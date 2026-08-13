import { computed, unref } from 'vue'

import { analyzeTravelRisks, createTravelPackingItems, findTravelRecommendedWindow } from '@/composables/useTravelCoach'
import { formatTravelDate } from '@/utils/travelDate'

const getNumbers = (values) => values.filter(Number.isFinite)

const getMax = (values) => {
  const numbers = getNumbers(values)
  return numbers.length > 0 ? Math.max(...numbers) : null
}

const getMin = (values) => {
  const numbers = getNumbers(values)
  return numbers.length > 0 ? Math.min(...numbers) : null
}

const getDayStatus = (risks) => {
  const dangerCount = risks.filter((risk) => risk.level === 'danger').length
  const cautionCount = risks.filter((risk) => risk.level === 'caution').length
  const severityScores = risks.map((risk) => risk.severityScore).filter(Number.isFinite)
  const score = Math.round(severityScores.reduce((sum, severityScore) => sum + severityScore, 0))

  if (dangerCount > 0) {
    return {
      level: 'danger',
      label: '위험',
      dangerCount,
      cautionCount,
      score,
    }
  }

  if (cautionCount > 0) {
    return {
      level: 'caution',
      label: '주의',
      dangerCount,
      cautionCount,
      score,
    }
  }

  return {
    level: 'good',
    label: '비교적 양호',
    dangerCount: 0,
    cautionCount: 0,
    score: 0,
  }
}

const isNextDate = (firstDate, secondDate) => {
  const firstTimestamp = new Date(`${firstDate}T00:00:00Z`).getTime()
  const secondTimestamp = new Date(`${secondDate}T00:00:00Z`).getTime()
  return Number.isFinite(firstTimestamp) && Number.isFinite(secondTimestamp) && secondTimestamp - firstTimestamp === 24 * 60 * 60 * 1000
}

const hasMatchingAdjacentDay = (days, index, matches) => {
  const currentDay = days[index]
  const previousDay = days[index - 1]
  const nextDay = days[index + 1]

  return (previousDay && isNextDate(previousDay.date, currentDay.date) && matches(previousDay)) || (nextDay && isNextDate(currentDay.date, nextDay.date) && matches(nextDay))
}

const isColdSeason = (date) => {
  const month = Number(date.slice(5, 7))
  return month >= 10 || month <= 4
}

const getOfficialTemperatureLevels = (dailyForecast) => {
  const sortedDays = [...dailyForecast].sort((first, second) => first.date.localeCompare(second.date))
  const heatLevels = new Map()
  const coldLevels = new Map()

  sortedDays.forEach((day, index) => {
    const hasHeatDangerSequence = day.feelsLikeMax >= 35 && hasMatchingAdjacentDay(sortedDays, index, (adjacentDay) => adjacentDay.feelsLikeMax >= 35)
    const hasHeatCautionSequence = day.feelsLikeMax >= 33 && hasMatchingAdjacentDay(sortedDays, index, (adjacentDay) => adjacentDay.feelsLikeMax >= 33)

    if (hasHeatDangerSequence) {
      heatLevels.set(day.date, 'danger')
    } else if (hasHeatCautionSequence) {
      heatLevels.set(day.date, 'caution')
    }

    if (!isColdSeason(day.date)) {
      return
    }

    const hasColdDangerSequence = day.tempMin <= -15 && hasMatchingAdjacentDay(sortedDays, index, (adjacentDay) => isColdSeason(adjacentDay.date) && adjacentDay.tempMin <= -15)
    const hasColdCautionSequence = day.tempMin <= -12 && hasMatchingAdjacentDay(sortedDays, index, (adjacentDay) => isColdSeason(adjacentDay.date) && adjacentDay.tempMin <= -12)

    if (hasColdDangerSequence) {
      coldLevels.set(day.date, 'danger')
    } else if (hasColdCautionSequence) {
      coldLevels.set(day.date, 'caution')
    }
  })

  return { heatLevels, coldLevels }
}

export const useTripPeriodCoach = ({ dailyForecast, forecastDailyContext, hourlyForecast, travelType }) => {
  const analyzedDays = computed(() => {
    const days = unref(dailyForecast) ?? []
    const contextDays = unref(forecastDailyContext) ?? days
    const hours = unref(hourlyForecast) ?? []
    const selectedTravelType = unref(travelType)
    const { heatLevels, coldLevels } = getOfficialTemperatureLevels(contextDays)

    return [...days]
      .sort((first, second) => first.date.localeCompare(second.date))
      .map((day) => {
        const dayHours = hours.filter((hour) => hour.time.startsWith(day.date))
        const assessedDay = {
          ...day,
          officialHeatLevel: heatLevels.get(day.date) ?? null,
          officialColdLevel: coldLevels.get(day.date) ?? null,
        }
        const risks = analyzeTravelRisks(assessedDay, dayHours, selectedTravelType)
        const status = getDayStatus(risks)

        return {
          ...assessedDay,
          formattedDate: formatTravelDate(day.date),
          hours: dayHours,
          risks,
          status,
          recommendedWindow: findTravelRecommendedWindow(day, dayHours, selectedTravelType),
          packingItems: createTravelPackingItems(day, dayHours, selectedTravelType),
        }
      })
  })

  const periodStatus = computed(() => {
    const dangerCount = analyzedDays.value.reduce((sum, day) => sum + day.status.dangerCount, 0)
    const cautionCount = analyzedDays.value.reduce((sum, day) => sum + day.status.cautionCount, 0)
    const dangerDayCount = analyzedDays.value.filter((day) => day.status.level === 'danger').length
    const cautionDayCount = analyzedDays.value.filter((day) => day.status.level === 'caution').length

    if (dangerCount > 0) {
      return {
        level: 'danger',
        title: `여행 기간 중 ${dangerDayCount}일 일정 재검토 권장`,
        description: `높은 위험 ${dangerCount}개와 주의 ${cautionCount}개가 예상됩니다. 기준 초과 정도를 반영한 날짜별 분석을 확인하세요.`,
      }
    }

    if (cautionCount > 0) {
      return {
        level: 'caution',
        title: `여행 기간 중 ${cautionDayCount}일 준비 필요`,
        description: `여행 기간에 ${cautionCount}개의 주의 요소가 있습니다. 기준 초과 정도를 반영한 날짜별 분석을 확인하세요.`,
      }
    }

    return {
      level: 'good',
      title: '여행 기간 날씨 부담 적음',
      description: '선택한 기간에 설정 기준을 넘는 주요 위험 요소가 발견되지 않았습니다.',
    }
  })

  const packingItems = computed(() => {
    const uniqueItems = new Map()

    analyzedDays.value.forEach((day) => {
      day.packingItems.forEach((item) => {
        if (!uniqueItems.has(item.id)) {
          uniqueItems.set(item.id, item)
        }
      })
    })

    return [...uniqueItems.values()]
  })

  const periodForecast = computed(() => {
    const days = analyzedDays.value

    return {
      tempMin: getMin(days.map((day) => day.tempMin)),
      tempMax: getMax(days.map((day) => day.tempMax)),
      precipitationProbabilityMax: getMax(days.map((day) => day.precipitationProbabilityMax)),
      windGustMax: getMax(days.map((day) => day.windGustMax)),
      uvIndexMax: getMax(days.map((day) => day.uvIndexMax)),
    }
  })

  return {
    analyzedDays,
    periodStatus,
    packingItems,
    periodForecast,
  }
}
