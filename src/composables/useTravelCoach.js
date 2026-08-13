import { computed, unref } from 'vue'

import { formatNumber } from '@/utils/numberFormat'

const THUNDERSTORM_CODES = [95, 96, 99]
const SNOW_CODES = [71, 73, 75, 77, 85, 86]
const FOG_CODES = [45, 48]
const FOG_VISIBILITY = 1000
const DENSE_FOG_VISIBILITY = 200
const CAUTION_SEVERITY_SCORE = 40
const DANGER_SEVERITY_SCORE = 70
const MAX_SEVERITY_SCORE = 100

const WIND_THRESHOLDS = {
  'city-tour': { caution: 20, danger: 26, critical: 35 },
  camping: { caution: 20, danger: 26, critical: 35 },
  hiking: { caution: 25, danger: 30, critical: 40 },
  drive: { caution: 20, danger: 26, critical: 35 },
}

const ACTIVITY_HOURS = {
  'city-tour': { start: 9, end: 20 },
  camping: { start: 10, end: 18 },
  hiking: { start: 7, end: 18 },
  drive: { start: 8, end: 21 },
}

const getNumbers = (values) => values.filter(Number.isFinite)

const getMax = (values) => {
  const numbers = getNumbers(values)
  return numbers.length > 0 ? Math.max(...numbers) : null
}

const getMin = (values) => {
  const numbers = getNumbers(values)
  return numbers.length > 0 ? Math.min(...numbers) : null
}

const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum)

const interpolateScore = (value, inputMinimum, inputMaximum, scoreMinimum, scoreMaximum) => {
  if (inputMaximum <= inputMinimum) {
    return scoreMaximum
  }

  const ratio = clamp((value - inputMinimum) / (inputMaximum - inputMinimum), 0, 1)
  return scoreMinimum + (scoreMaximum - scoreMinimum) * ratio
}

const getUpperSeverity = (value, cautionThreshold, dangerThreshold, criticalThreshold) => {
  if (!Number.isFinite(value) || value < cautionThreshold) {
    return 0
  }

  if (value < dangerThreshold) {
    return interpolateScore(value, cautionThreshold, dangerThreshold, CAUTION_SEVERITY_SCORE, DANGER_SEVERITY_SCORE)
  }

  return interpolateScore(value, dangerThreshold, criticalThreshold, DANGER_SEVERITY_SCORE, MAX_SEVERITY_SCORE)
}

const getLowerSeverity = (value, cautionThreshold, dangerThreshold, criticalThreshold) => {
  return getUpperSeverity(-value, -cautionThreshold, -dangerThreshold, -criticalThreshold)
}

const roundSeverity = (value) => Math.round(clamp(value, 0, MAX_SEVERITY_SCORE))

const getMaximumRollingAmount = (hours, windowSize, getValue) => {
  const sortedHours = [...hours].sort((first, second) => first.time.localeCompare(second.time))
  let selected = null

  for (let startIndex = 0; startIndex <= sortedHours.length - windowSize; startIndex += 1) {
    const windowHours = sortedHours.slice(startIndex, startIndex + windowSize)
    const isConsecutive = windowHours.every((hour, index) => {
      if (index === 0) {
        return true
      }

      return getForecastTimestamp(hour.time) - getForecastTimestamp(windowHours[index - 1].time) === 60 * 60 * 1000
    })

    if (!isConsecutive) {
      continue
    }

    const values = windowHours.map(getValue)

    if (!values.every(Number.isFinite)) {
      continue
    }

    const amount = values.reduce((sum, value) => sum + value, 0)

    if (!selected || amount > selected.amount) {
      selected = { amount, hours: windowHours }
    }
  }

  return selected
}

const getPeakHour = (hours, getValue, direction = 'max') => {
  return hours.reduce((selected, hour) => {
    const value = getValue(hour)

    if (!Number.isFinite(value)) {
      return selected
    }

    if (!selected) {
      return hour
    }

    const selectedValue = getValue(selected)
    const shouldReplace = direction === 'min' ? value < selectedValue : value > selectedValue

    return shouldReplace ? hour : selected
  }, null)
}

const formatHour = (time) => {
  if (!time) {
    return '시간 미정'
  }

  return `${time.slice(11, 13)}시`
}

const getForecastTimestamp = (time) => {
  if (!time) {
    return null
  }

  const [datePart, timePart] = time.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute = 0] = timePart.split(':').map(Number)

  if (![year, month, day, hour, minute].every(Number.isFinite)) {
    return null
  }

  return Date.UTC(year, month - 1, day, hour, minute)
}

const formatTimeSegment = (segment) => {
  const startHour = Number(segment[0].time.slice(11, 13))
  const endHour = Number(segment.at(-1).time.slice(11, 13)) + 1

  return `${String(startHour).padStart(2, '0')}시~${String(endHour).padStart(2, '0')}시`
}

const getRiskTimeRange = (hours, isRiskHour, fallbackHour = null) => {
  const riskHours = hours.filter(isRiskHour)

  if (riskHours.length === 0 && fallbackHour) {
    riskHours.push(fallbackHour)
  }

  if (riskHours.length === 0) {
    return '시간 미정'
  }

  const segments = riskHours.reduce((groups, hour) => {
    const currentGroup = groups.at(-1)
    const previousHour = currentGroup?.at(-1)
    const previousTimestamp = getForecastTimestamp(previousHour?.time)
    const currentTimestamp = getForecastTimestamp(hour.time)
    const isConsecutive = Number.isFinite(previousTimestamp) && Number.isFinite(currentTimestamp) && currentTimestamp - previousTimestamp === 60 * 60 * 1000

    if (!currentGroup || !isConsecutive) {
      groups.push([hour])
    } else {
      currentGroup.push(hour)
    }

    return groups
  }, [])

  const labels = segments.map(formatTimeSegment)

  if (labels.length <= 2) {
    return labels.join(', ')
  }

  return `${labels.slice(0, 2).join(', ')} 외 ${labels.length - 2}개 구간`
}

const getTravelAction = (travelType, category, level) => {
  const actions = {
    precipitation: {
      'city-tour': level === 'danger' ? '실내 일정을 우선하고 이동이 필요한 시간대는 다시 확인하세요.' : '야외 일정을 비가 적은 시간으로 옮기고 우산을 준비하세요.',
      camping: level === 'danger' ? '계곡과 저지대 캠핑을 피하고 일정 변경을 검토하세요.' : '방수 장비를 준비하고 텐트 설치 시간을 조정하세요.',
      hiking: level === 'danger' ? '산행을 재검토하고 공식 특보와 탐방로 통제 여부를 확인하세요.' : '미끄럼 방지 장비를 준비하고 짧은 코스로 조정하세요.',
      drive: level === 'danger' ? '강수가 집중되는 시간의 운전을 피하고 도로 통제를 확인하세요.' : '감속 운전하고 이동 시간을 여유 있게 잡으세요.',
    },
    wind: {
      'city-tour': '간판과 낙하물에 주의하고 노출된 야외 일정을 줄이세요.',
      camping: level === 'danger' ? '텐트와 타프 설치를 재검토하고 안전한 대피 장소를 확인하세요.' : '타프 사용을 줄이고 팩과 스트링을 보강하세요.',
      hiking: '능선과 정상 체류를 줄이고 바람이 강해지면 즉시 하산하세요.',
      drive: '교량과 해안도로에서 감속하고 차량이 흔들릴 수 있는 구간을 주의하세요.',
    },
    visibility: {
      'city-tour': '이동 시간을 여유 있게 잡고 밝은 색상의 옷을 준비하세요.',
      camping: '캠핑장 진입로와 야간 이동 경로를 미리 확인하세요.',
      hiking: '산행 코스를 단축하고 길 찾기 장비를 준비하세요.',
      drive: '전조등을 켜고 충분한 안전거리를 유지하며 감속하세요.',
    },
  }

  return actions[category]?.[travelType] ?? '예보 변화를 확인하고 야외 활동 시간을 조정하세요.'
}

export const analyzeTravelRisks = (day, hours, travelType) => {
  if (!day || hours.length === 0) {
    return []
  }

  const risks = []
  const addRisk = (risk) => risks.push({ ...risk, sourceType: 'analysis' })

  const thunderHour = hours.find((hour) => THUNDERSTORM_CODES.includes(hour.weatherCode))

  if (thunderHour) {
    const thunderCode = thunderHour.weatherCode
    const severityScore = thunderCode === 99 ? 100 : thunderCode === 96 ? 85 : DANGER_SEVERITY_SCORE

    addRisk({
      id: 'thunderstorm',
      category: 'thunderstorm',
      level: 'danger',
      title: thunderCode === 99 ? '강한 우박을 동반한 뇌우' : '뇌우 가능성',
      reason: `${formatHour(thunderHour.time)} 전후 WMO 뇌우 예보 코드가 포함되어 있습니다. 천둥이 들리면 낙뢰의 타격 범위에 있을 수 있습니다.`,
      action: getTravelAction(travelType, 'precipitation', 'danger'),
      timeRange: getRiskTimeRange(hours, (hour) => THUNDERSTORM_CODES.includes(hour.weatherCode), thunderHour),
      severityScore,
    })
  }

  const maxRainfallForThreeHours = getMaximumRollingAmount(hours, 3, (hour) => hour.rainfall ?? hour.precipitation)
  const maxRainfallForTwelveHours = getMaximumRollingAmount(hours, 12, (hour) => hour.rainfall ?? hour.precipitation)
  const threeHourRainfall = maxRainfallForThreeHours?.amount ?? 0
  const twelveHourRainfall = maxRainfallForTwelveHours?.amount ?? 0
  const meetsRainDanger = threeHourRainfall >= 90 || twelveHourRainfall >= 180
  const meetsRainCaution = threeHourRainfall >= 60 || twelveHourRainfall >= 110

  if (meetsRainCaution) {
    const level = meetsRainDanger ? 'danger' : 'caution'
    const selectedRainWindow = getUpperSeverity(twelveHourRainfall, 110, 180, 250) > getUpperSeverity(threeHourRainfall, 60, 90, 120) ? maxRainfallForTwelveHours : maxRainfallForThreeHours

    addRisk({
      id: 'precipitation',
      category: 'precipitation',
      level,
      title: level === 'danger' ? '호우 경보 기준 예상' : '호우 주의보 기준 예상',
      reason: `최대 3시간 누적 ${formatNumber(threeHourRainfall, 1)}mm, 최대 12시간 누적 ${formatNumber(twelveHourRainfall, 1)}mm로 기상청 호우 ${level === 'danger' ? '경보' : '주의보'} 기준에 해당합니다.`,
      action: getTravelAction(travelType, 'precipitation', level),
      timeRange: getRiskTimeRange(hours, (hour) => selectedRainWindow?.hours.includes(hour) ?? false, selectedRainWindow?.hours[0]),
      severityScore: roundSeverity(Math.max(getUpperSeverity(threeHourRainfall, 60, 90, 120), getUpperSeverity(twelveHourRainfall, 110, 180, 250))),
    })
  }

  const windThreshold = WIND_THRESHOLDS[travelType] ?? WIND_THRESHOLDS['city-tour']
  const maxWindGust = day.windGustMax ?? getMax(hours.map((hour) => hour.windGust)) ?? 0
  const windPeak = getPeakHour(hours, (hour) => hour.windGust)

  if (maxWindGust >= windThreshold.caution) {
    const level = maxWindGust >= windThreshold.danger ? 'danger' : 'caution'

    addRisk({
      id: 'wind',
      category: 'wind',
      level,
      title: level === 'danger' ? '강한 돌풍 위험' : '돌풍 주의',
      reason: `최대 순간풍속 ${formatNumber(maxWindGust, 1)}m/s로 기상청 ${travelType === 'hiking' ? '산지 ' : ''}강풍 ${level === 'danger' ? '경보' : '주의보'} 기준에 해당합니다.`,
      action: getTravelAction(travelType, 'wind', level),
      timeRange: getRiskTimeRange(hours, (hour) => (hour.windGust ?? 0) >= windThreshold.caution, windPeak),
      severityScore: roundSeverity(getUpperSeverity(maxWindGust, windThreshold.caution, windThreshold.danger, windThreshold.critical)),
    })
  }

  const maxFeelsLike = day.feelsLikeMax ?? getMax(hours.map((hour) => hour.feelsLike))
  const heatPeak = getPeakHour(hours, (hour) => hour.feelsLike)

  if (day.officialHeatLevel && Number.isFinite(maxFeelsLike)) {
    const level = day.officialHeatLevel

    addRisk({
      id: 'heat',
      category: 'temperature',
      level,
      title: level === 'danger' ? '폭염 경보 기준 예상' : '폭염 주의보 기준 예상',
      reason: `일 최고 체감온도 ${formatNumber(maxFeelsLike, 1)}℃ 이상이 2일 이상 이어져 기상청 폭염 ${level === 'danger' ? '경보' : '주의보'} 기준에 해당합니다.`,
      action: level === 'danger' ? '한낮 야외 활동을 피하고 충분한 휴식과 수분을 확보하세요.' : '한낮 활동 시간을 줄이고 물과 그늘을 확보하세요.',
      timeRange: getRiskTimeRange(hours, (hour) => (hour.feelsLike ?? -Infinity) >= 33, heatPeak),
      severityScore: roundSeverity(getUpperSeverity(maxFeelsLike, 33, 35, 38)),
    })
  }

  const minTemperature = day.tempMin ?? getMin(hours.map((hour) => hour.temp))
  const coldPeak = getPeakHour(hours, (hour) => hour.temp, 'min')

  if (day.officialColdLevel && Number.isFinite(minTemperature)) {
    const level = day.officialColdLevel

    addRisk({
      id: 'cold',
      category: 'temperature',
      level,
      title: level === 'danger' ? '한파 경보 기준 예상' : '한파 주의보 기준 예상',
      reason: `아침 최저기온 ${formatNumber(minTemperature, 1)}℃ 이하가 2일 이상 이어져 기상청 한파 ${level === 'danger' ? '경보' : '주의보'}의 절대기온 기준에 해당합니다.`,
      action: '노출 시간을 줄이고 방한 의류와 여분의 보온 장비를 준비하세요.',
      timeRange: getRiskTimeRange(hours, (hour) => (hour.temp ?? Infinity) <= -12, coldPeak),
      severityScore: roundSeverity(getLowerSeverity(minTemperature, -12, -15, -20)),
    })
  }

  const maxUvIndex = day.uvIndexMax ?? getMax(hours.map((hour) => hour.uvIndex))
  const uvPeak = getPeakHour(hours, (hour) => hour.uvIndex)

  if (Number.isFinite(maxUvIndex) && maxUvIndex >= 6) {
    const level = maxUvIndex >= 8 ? 'danger' : 'caution'

    addRisk({
      id: 'uv',
      category: 'uv',
      level,
      title: level === 'danger' ? '매우 높은 자외선' : '높은 자외선',
      reason: `최대 자외선 지수가 ${formatNumber(maxUvIndex, 1)}로 예상됩니다.`,
      action: level === 'danger' ? '한낮 노출을 피하고 그늘, 긴소매, 모자와 선크림을 활용하세요.' : '모자와 선크림을 준비하고 한낮에는 그늘을 이용하세요.',
      timeRange: getRiskTimeRange(hours, (hour) => (hour.uvIndex ?? 0) >= 6, uvPeak),
      severityScore: roundSeverity(getUpperSeverity(maxUvIndex, 6, 8, 11)),
    })
  }

  const maxAqi = getMax(hours.map((hour) => hour.airQuality?.usAqi))
  const aqiPeak = getPeakHour(hours, (hour) => hour.airQuality?.usAqi)
  const maxProviderAqi = getMax(hours.map((hour) => hour.airQuality?.providerAqi))
  const providerAqiPeak = getPeakHour(hours, (hour) => hour.airQuality?.providerAqi)

  if (Number.isFinite(maxAqi) && maxAqi >= 101) {
    const level = maxAqi >= 151 ? 'danger' : 'caution'

    addRisk({
      id: 'air-quality',
      category: 'air-quality',
      level,
      title: level === 'danger' ? '건강에 좋지 않은 대기질' : '민감군 대기질 주의',
      reason: `미국 AQI 기준 최고 ${formatNumber(maxAqi, 0)}로 예상됩니다.`,
      action: level === 'danger' ? '장시간 야외 활동을 줄이고 실내 일정을 우선하세요.' : '민감군은 오래 지속되는 야외 활동을 줄이세요.',
      timeRange: getRiskTimeRange(hours, (hour) => (hour.airQuality?.usAqi ?? 0) >= 101, aqiPeak),
      severityScore: roundSeverity(getUpperSeverity(maxAqi, 101, 151, 301)),
    })
  } else if (Number.isFinite(maxProviderAqi) && maxProviderAqi >= 4) {
    const level = maxProviderAqi >= 5 ? 'danger' : 'caution'

    addRisk({
      id: 'air-quality',
      category: 'air-quality',
      level,
      title: level === 'danger' ? '매우 나쁜 대기질' : '대기질 주의',
      reason: `OpenWeather 대기질 5단계 중 ${formatNumber(maxProviderAqi, 0)}단계로 예상됩니다.`,
      action: level === 'danger' ? '장시간 야외 활동을 줄이고 실내 일정을 우선하세요.' : '민감군은 오래 지속되는 야외 활동을 줄이세요.',
      timeRange: getRiskTimeRange(hours, (hour) => (hour.airQuality?.providerAqi ?? 0) >= 4, providerAqiPeak),
      severityScore: maxProviderAqi >= 5 ? DANGER_SEVERITY_SCORE : CAUTION_SEVERITY_SCORE,
    })
  }

  const minVisibility = getMin(hours.map((hour) => hour.visibility))
  const visibilityPeak = getPeakHour(hours, (hour) => hour.visibility, 'min')
  const hasFogCode = hours.some((hour) => FOG_CODES.includes(hour.weatherCode))
  const hasLowVisibility = Number.isFinite(minVisibility) && minVisibility < FOG_VISIBILITY

  if (hasFogCode || hasLowVisibility) {
    const level = Number.isFinite(minVisibility) && minVisibility < DENSE_FOG_VISIBILITY ? 'danger' : 'caution'
    const isVisibilityRiskHour = (hour) => {
      if (level === 'danger') {
        return Number.isFinite(hour.visibility) && hour.visibility < DENSE_FOG_VISIBILITY
      }

      return FOG_CODES.includes(hour.weatherCode) || (Number.isFinite(hour.visibility) && hour.visibility < FOG_VISIBILITY)
    }

    const visibilitySeverity = getLowerSeverity(minVisibility, FOG_VISIBILITY, DENSE_FOG_VISIBILITY, 50)
    const boundedVisibilitySeverity = level === 'danger' ? visibilitySeverity : Math.min(visibilitySeverity, DANGER_SEVERITY_SCORE - 1)

    addRisk({
      id: 'visibility',
      category: 'visibility',
      level,
      title: level === 'danger' ? '200m 미만 짙은 안개 위험' : '안개로 인한 가시거리 저하',
      reason: hasLowVisibility ? `최저 가시거리가 약 ${formatNumber(minVisibility / 1000, 1)}km로 예상됩니다.` : '예보에 안개 코드가 포함되어 있습니다.',
      action: getTravelAction(travelType, 'visibility', level),
      timeRange: getRiskTimeRange(hours, isVisibilityRiskHour, visibilityPeak),
      severityScore: roundSeverity(Math.max(hasFogCode ? CAUTION_SEVERITY_SCORE : 0, boundedVisibilitySeverity)),
    })
  }

  const snowfallSum = day.snowfallSum
  const snowDangerThreshold = travelType === 'hiking' ? 30 : 20

  if (Number.isFinite(snowfallSum) && snowfallSum >= 5) {
    const level = snowfallSum >= snowDangerThreshold ? 'danger' : 'caution'
    const snowPeak = getPeakHour(hours, (hour) => hour.snowfall)

    addRisk({
      id: 'snow',
      category: 'snow',
      level,
      title: level === 'danger' ? '대설 경보 기준 예상' : '대설 주의보 기준 예상',
      reason: `24시간 예상 적설량 ${formatNumber(snowfallSum, 1)}cm로 기상청 ${travelType === 'hiking' ? '산지 ' : ''}대설 ${level === 'danger' ? '경보' : '주의보'} 기준에 해당합니다.`,
      action: travelType === 'drive' ? '겨울용 타이어와 도로 통제 정보를 확인하고 급가속·급제동을 피하세요.' : '방수 신발과 미끄럼 방지 장비를 준비하세요.',
      timeRange: getRiskTimeRange(hours, (hour) => SNOW_CODES.includes(hour.weatherCode) || (hour.snowfall ?? 0) > 0, snowPeak),
      severityScore: roundSeverity(getUpperSeverity(snowfallSum, 5, snowDangerThreshold, snowDangerThreshold + 10)),
    })
  }

  return risks.sort((a, b) => {
    const priority = { danger: 0, caution: 1 }
    const levelOrder = priority[a.level] - priority[b.level]
    return levelOrder === 0 ? b.severityScore - a.severityScore : levelOrder
  })
}

const getHourPenalty = (hour) => {
  let penalty = 0

  penalty += Math.min((hour.precipitationProbability ?? 0) * 0.35, 35)
  penalty += Math.min((hour.precipitation ?? 0) * 8, 30)
  penalty += Math.min(Math.max((hour.windGust ?? 0) - 5, 0) * 2.5, 25)
  penalty += Math.min(Math.max((hour.uvIndex ?? 0) - 3, 0) * 4, 24)
  penalty += Math.min(Math.max((hour.airQuality?.usAqi ?? 0) - 50, 0) * 0.2, 30)

  if (!Number.isFinite(hour.airQuality?.usAqi) && Number.isFinite(hour.airQuality?.providerAqi)) {
    penalty += Math.max(hour.airQuality.providerAqi - 3, 0) * 20
  }

  if (Number.isFinite(hour.visibility) && hour.visibility < 2000) {
    penalty += Math.min((2000 - hour.visibility) / 60, 25)
  }

  if (THUNDERSTORM_CODES.includes(hour.weatherCode)) {
    penalty += 100
  }

  if (SNOW_CODES.includes(hour.weatherCode)) {
    penalty += 35
  }

  if (Number.isFinite(hour.feelsLike) && (hour.feelsLike >= 35 || hour.feelsLike <= -10)) {
    penalty += 35
  }

  return penalty
}

export const findTravelRecommendedWindow = (day, hours, travelType) => {
  const activityHours = ACTIVITY_HOURS[travelType] ?? ACTIVITY_HOURS['city-tour']
  const now = new Date()
  let activityEndHour = activityHours.end

  if ((travelType === 'hiking' || travelType === 'camping') && day?.sunset) {
    const sunsetHour = Number(day.sunset.slice(11, 13))
    const daylightMargin = travelType === 'hiking' ? 1 : 0
    activityEndHour = Math.min(activityEndHour, sunsetHour - daylightMargin)
  }

  const candidates = hours.filter((hour) => {
    const hourNumber = Number(hour.time.slice(11, 13))
    const forecastTime = new Date(hour.time)
    const isFutureTime = forecastTime.toDateString() !== now.toDateString() || forecastTime.getTime() >= now.getTime()

    return hourNumber >= activityHours.start && hourNumber < activityEndHour && isFutureTime
  })

  if (candidates.length < 3) {
    return {
      available: false,
      label: '추천 시간 없음',
      description: '선택한 날짜에 비교 가능한 야외 활동 시간이 충분하지 않습니다.',
    }
  }

  const windows = []

  for (let index = 0; index <= candidates.length - 3; index += 1) {
    const windowHours = candidates.slice(index, index + 3)
    const firstTime = new Date(windowHours[0].time).getTime()
    const lastTime = new Date(windowHours[2].time).getTime()

    if (lastTime - firstTime === 2 * 60 * 60 * 1000) {
      const averagePenalty = windowHours.reduce((sum, hour) => sum + getHourPenalty(hour), 0) / windowHours.length
      windows.push({ hours: windowHours, penalty: averagePenalty })
    }
  }

  const bestWindow = windows.reduce((best, current) => (!best || current.penalty < best.penalty ? current : best), null)

  if (!bestWindow || bestWindow.penalty >= 60) {
    return {
      available: false,
      label: '안정적인 추천 시간 없음',
      description: '비, 바람, 기온 등 위험 요소가 낮은 연속 3시간을 찾지 못했습니다.',
    }
  }

  const startHour = Number(bestWindow.hours[0].time.slice(11, 13))
  const endHour = Number(bestWindow.hours[2].time.slice(11, 13)) + 1

  return {
    available: true,
    label: `${String(startHour).padStart(2, '0')}시 ~ ${String(endHour).padStart(2, '0')}시`,
    description: bestWindow.penalty < 20 ? '선택 날짜 중 날씨 부담이 비교적 적은 시간대입니다.' : '다른 시간대보다 위험 요소가 적지만 예보 변화를 다시 확인하세요.',
  }
}

export const createTravelPackingItems = (day, hours, travelType) => {
  if (!day || hours.length === 0) {
    return []
  }

  const items = []
  const addItem = (id, label, reason) => {
    if (!items.some((item) => item.id === id)) {
      items.push({ id, label, reason })
    }
  }

  const maxAqi = getMax(hours.map((hour) => hour.airQuality?.usAqi)) ?? 0
  const maxProviderAqi = getMax(hours.map((hour) => hour.airQuality?.providerAqi)) ?? 0
  const maxWindGust = day.windGustMax ?? 0
  const tempDifference = Number.isFinite(day.tempMax) && Number.isFinite(day.tempMin) ? day.tempMax - day.tempMin : 0

  if ((day.precipitationProbabilityMax ?? 0) >= 40 || (day.precipitationSum ?? 0) > 0) {
    if (travelType === 'camping') {
      addItem('rain-gear', '방수 타프와 드라이백', '비 예보에 대비해 침구와 전자기기를 보호하세요.')
    } else if (travelType === 'hiking') {
      addItem('rain-gear', '방수 재킷과 배낭 커버', '산행 중 우산보다 양손을 자유롭게 유지하세요.')
    } else {
      addItem('rain-gear', '휴대용 우산 또는 우비', '이동 중 비에 대비하세요.')
    }
  }

  if ((day.uvIndexMax ?? 0) >= 3) {
    addItem('sun-protection', '선크림·모자·선글라스', '자외선 노출을 줄이세요.')
  }

  if ((day.tempMax ?? 0) >= 28) {
    addItem('water', '충분한 물과 전해질 음료', '더운 시간대의 수분 부족에 대비하세요.')
  }

  if ((day.tempMin ?? 100) <= 12 || tempDifference >= 10) {
    addItem('layered-clothes', '얇은 겉옷과 여벌 옷', '낮과 밤의 기온 차이에 대비하세요.')
  }

  if (maxWindGust >= 8) {
    addItem('windbreaker', '방풍 재킷', '돌풍이 불 때 체온 저하와 불편을 줄이세요.')

    if (travelType === 'camping') {
      addItem('camping-anchor', '여분의 팩과 스트링', '텐트 고정 상태를 보강하세요.')
    }
  }

  if (maxAqi >= 101 || maxProviderAqi >= 4) {
    addItem('mask', '보건용 마스크', '대기질이 나쁜 시간대의 노출을 줄이세요.')
  }

  if ((day.snowfallSum ?? 0) > 0 || hours.some((hour) => SNOW_CODES.includes(hour.weatherCode))) {
    addItem(travelType === 'drive' ? 'winter-drive' : 'anti-slip', travelType === 'drive' ? '겨울용 차량 장비' : '미끄럼 방지 장비', '눈과 결빙 가능성에 대비하세요.')
  }

  if (travelType === 'camping') {
    addItem('camping-light', '손전등과 보조배터리', '일몰 이후 캠핑장 이동에 대비하세요.')
  } else if (travelType === 'hiking') {
    addItem('hiking-light', '헤드랜턴과 오프라인 지도', '예정보다 하산이 늦어지는 상황에 대비하세요.')
  } else if (travelType === 'drive') {
    addItem('drive-kit', '차량 비상용품과 충전기', '기상 변화로 이동 시간이 길어지는 상황에 대비하세요.')
  }

  return items
}

export const useTravelCoach = ({ dailyForecast, hourlyForecast, travelType }) => {
  const risks = computed(() => {
    return analyzeTravelRisks(unref(dailyForecast), unref(hourlyForecast) ?? [], unref(travelType))
  })

  const coachStatus = computed(() => {
    const dangerCount = risks.value.filter((risk) => risk.level === 'danger').length
    const cautionCount = risks.value.filter((risk) => risk.level === 'caution').length

    if (dangerCount > 0) {
      return {
        level: 'danger',
        title: '일정 재검토 권장',
        description: `${dangerCount}개의 높은 위험 요소가 있습니다. 기상청 공식 특보와 현장 통제 정보를 확인하세요.`,
      }
    }

    if (cautionCount > 0) {
      return {
        level: 'caution',
        title: '일정 조정 권장',
        description: `${cautionCount}개의 주의 요소가 있습니다. 시간과 준비물을 조정해 주세요.`,
      }
    }

    return {
      level: 'good',
      title: '여행하기 비교적 좋음',
      description: '현재 예보에서 설정 기준 이상의 주요 위험 요소가 발견되지 않았습니다.',
    }
  })

  const recommendedWindow = computed(() => {
    return findTravelRecommendedWindow(unref(dailyForecast), unref(hourlyForecast) ?? [], unref(travelType))
  })

  const packingItems = computed(() => {
    return createTravelPackingItems(unref(dailyForecast), unref(hourlyForecast) ?? [], unref(travelType))
  })

  return {
    risks,
    coachStatus,
    recommendedWindow,
    packingItems,
  }
}
