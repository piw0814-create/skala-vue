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

  if (dangerCount > 0) {
    return {
      level: 'danger',
      label: '위험',
      dangerCount,
      cautionCount,
      score: dangerCount * 100 + cautionCount * 10,
    }
  }

  if (cautionCount > 0) {
    return {
      level: 'caution',
      label: '주의',
      dangerCount,
      cautionCount,
      score: cautionCount * 10,
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

export const useTripPeriodCoach = ({ dailyForecast, hourlyForecast, travelType }) => {
  const analyzedDays = computed(() => {
    const days = unref(dailyForecast) ?? []
    const hours = unref(hourlyForecast) ?? []
    const selectedTravelType = unref(travelType)

    return [...days]
      .sort((first, second) => first.date.localeCompare(second.date))
      .map((day) => {
        const dayHours = hours.filter((hour) => hour.time.startsWith(day.date))
        const risks = analyzeTravelRisks(day, dayHours, selectedTravelType)
        const status = getDayStatus(risks)

        return {
          ...day,
          formattedDate: formatTravelDate(day.date),
          hours: dayHours,
          risks,
          status,
          recommendedWindow: findTravelRecommendedWindow(day, dayHours, selectedTravelType),
          packingItems: createTravelPackingItems(day, dayHours, selectedTravelType),
        }
      })
  })

  const priorityDay = computed(() => {
    return analyzedDays.value.reduce((selected, day) => (!selected || day.status.score > selected.status.score ? day : selected), null)
  })

  const periodStatus = computed(() => {
    const dangerCount = analyzedDays.value.reduce((sum, day) => sum + day.status.dangerCount, 0)
    const cautionCount = analyzedDays.value.reduce((sum, day) => sum + day.status.cautionCount, 0)

    if (dangerCount > 0) {
      return {
        level: 'danger',
        title: `${priorityDay.value?.formattedDate ?? '선택 기간'} 일정 재검토 권장`,
        description: `여행 기간에 높은 위험 ${dangerCount}개와 주의 ${cautionCount}개가 예상됩니다. 가장 주의할 날의 상세 예보를 확인하세요.`,
      }
    }

    if (cautionCount > 0) {
      return {
        level: 'caution',
        title: `${priorityDay.value?.formattedDate ?? '선택 기간'} 준비 필요`,
        description: `여행 기간에 ${cautionCount}개의 주의 요소가 있습니다. 날짜별 주의 시간대와 준비물을 확인하세요.`,
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
    priorityDay,
    periodStatus,
    packingItems,
    periodForecast,
  }
}
