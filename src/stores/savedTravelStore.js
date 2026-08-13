import { defineStore } from 'pinia'

import { cityConfigs } from '@/data/cityConfigs'
import { TRAVEL_FORECAST_MAX_DAYS } from '@/data/travelTypes'
import { addDaysToDateValue, getTodayDateValue } from '@/utils/travelDate'

const STORAGE_KEY = 'skala-weather-saved-travel-plans'
const MAX_SAVED_PLANS = 12

const getLastForecastDateValue = () => addDaysToDateValue(getTodayDateValue(), TRAVEL_FORECAST_MAX_DAYS)

const normalizePlan = (plan) => {
  if (!plan || typeof plan !== 'object') {
    return null
  }

  const startDate = plan.startDate ?? plan.date
  const endDate = plan.endDate ?? plan.date ?? startDate

  if (!startDate || !endDate) {
    return null
  }

  return {
    id: `${plan.cityId}-${startDate}-${endDate}-${plan.travelType}`,
    cityId: plan.cityId,
    startDate,
    endDate,
    travelType: plan.travelType,
    updatedAt: plan.updatedAt,
  }
}

const sortPlansByDate = (plans) => {
  return [...plans].sort((first, second) => {
    const today = getTodayDateValue()
    const firstIsExpired = first.endDate < today
    const secondIsExpired = second.endDate < today

    if (firstIsExpired !== secondIsExpired) {
      return firstIsExpired ? 1 : -1
    }

    if (firstIsExpired && secondIsExpired) {
      return second.endDate.localeCompare(first.endDate)
    }

    const dateOrder = first.startDate.localeCompare(second.startDate)
    return dateOrder === 0 ? second.updatedAt.localeCompare(first.updatedAt) : dateOrder
  })
}

const readSavedPlans = () => {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY)
    const parsedValue = storedValue ? JSON.parse(storedValue) : []

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.map(normalizePlan).filter((plan) => {
      const hasValidCity = cityConfigs.some((city) => city.id === plan?.cityId)
      return Boolean(plan?.id && hasValidCity && plan.startDate <= plan.endDate && plan.travelType && plan.updatedAt)
    })
  } catch (error) {
    console.warn('저장된 여행 일정을 불러오지 못했습니다:', error)
    return []
  }
}

export const useSavedTravelStore = defineStore('savedTravel', {
  state: () => ({
    plans: readSavedPlans(),
  }),

  getters: {
    sortedPlans: (state) => sortPlansByDate(state.plans),

    upcomingPlans: (state) => {
      return sortPlansByDate(state.plans.filter((plan) => plan.endDate >= getTodayDateValue()))
    },

    nextUpcomingPlan() {
      return this.upcomingPlans.find((plan) => plan.endDate <= getLastForecastDateValue()) ?? null
    },

    savedPlanCount: (state) => state.plans.length,

    hasSavedPlans: (state) => state.plans.length > 0,
  },

  actions: {
    persistPlans() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.plans))
      } catch (error) {
        console.warn('여행 일정을 브라우저에 저장하지 못했습니다:', error)
      }
    },

    savePlan(plan) {
      const id = `${plan.cityId}-${plan.startDate}-${plan.endDate}-${plan.travelType}`
      const existingIndex = this.plans.findIndex((item) => item.id === id)
      const savedPlan = {
        id,
        cityId: plan.cityId,
        startDate: plan.startDate,
        endDate: plan.endDate,
        travelType: plan.travelType,
        updatedAt: new Date().toISOString(),
      }

      if (existingIndex >= 0) {
        this.plans.splice(existingIndex, 1, savedPlan)
        this.persistPlans()
        return 'updated'
      }

      this.plans.unshift(savedPlan)
      this.plans = this.plans.slice(0, MAX_SAVED_PLANS)
      this.persistPlans()
      return 'created'
    },

    removePlan(planId) {
      this.plans = this.plans.filter((plan) => plan.id !== planId)
      this.persistPlans()
    },
  },
})
