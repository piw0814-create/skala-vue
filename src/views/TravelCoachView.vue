<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { BookmarkPlus, CalendarCheck, CloudRain, RefreshCw, Sun, Thermometer, Wind } from '@lucide/vue'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'

import OfficialWeatherAlert from '@/components/OfficialWeatherAlert.vue'
import SavedTravelPlans from '@/components/travel/SavedTravelPlans.vue'
import TravelDayForecastCards from '@/components/travel/TravelDayForecastCards.vue'
import TravelPackingList from '@/components/travel/TravelPackingList.vue'
import TravelPlannerForm from '@/components/travel/TravelPlannerForm.vue'
import TravelRiskList from '@/components/travel/TravelRiskList.vue'
import { useTemperature } from '@/composables/useTemperature'
import { useTripPeriodCoach } from '@/composables/useTripPeriodCoach'
import { TRAVEL_FORECAST_MAX_DAYS, travelTypes } from '@/data/travelTypes'
import { useOfficialWarningStore } from '@/stores/officialWarningStore'
import { useSavedTravelStore } from '@/stores/savedTravelStore'
import { useTravelStore } from '@/stores/travelStore'
import { formatNumber } from '@/utils/numberFormat'
import { addDaysToDateValue, formatTravelPeriod, getDaysBetween, getTodayDateValue, getTripDurationLabel } from '@/utils/travelDate'

const travelStore = useTravelStore()
const officialWarningStore = useOfficialWarningStore()
const savedTravelStore = useSavedTravelStore()
const route = useRoute()
const { formatTemp } = useTemperature()

const travelPlan = ref({
  cityId: '',
  startDate: getTodayDateValue(),
  endDate: getTodayDateValue(),
  travelType: 'city-tour',
})

const hasRequested = ref(false)

const selectedTravelType = computed(() => {
  return travelTypes.find((type) => type.id === travelPlan.value.travelType) ?? null
})

const selectedPeriodForecast = computed(() => {
  return travelStore.selectedForecast?.daily.filter((day) => day.date >= travelPlan.value.startDate && day.date <= travelPlan.value.endDate) ?? []
})

const selectedPeriodHourlyForecast = computed(() => {
  return (
    travelStore.selectedForecast?.hourly.filter((hour) => {
      const date = hour.time.slice(0, 10)
      return date >= travelPlan.value.startDate && date <= travelPlan.value.endDate
    }) ?? []
  )
})

const selectedTravelTypeId = computed(() => travelPlan.value.travelType)

const tripDayCount = computed(() => {
  const nights = getDaysBetween(travelPlan.value.startDate, travelPlan.value.endDate)
  return Number.isFinite(nights) && nights >= 0 ? nights + 1 : 0
})

const hasCompletePeriodForecast = computed(() => {
  return tripDayCount.value > 0 && selectedPeriodForecast.value.length === tripDayCount.value
})

const includesToday = computed(() => {
  const today = getTodayDateValue()
  return travelPlan.value.startDate <= today && travelPlan.value.endDate >= today
})

const selectedOfficialWarnings = computed(() => {
  if (!includesToday.value || !travelPlan.value.cityId) {
    return []
  }

  return officialWarningStore.getWarningsForCity(travelPlan.value.cityId)
})

const officialWarningContext = computed(() => {
  return travelStore.selectedCity?.name ?? '선택 지역'
})

const { analyzedDays, priorityDay, periodStatus, packingItems, periodForecast } = useTripPeriodCoach({
  dailyForecast: selectedPeriodForecast,
  hourlyForecast: selectedPeriodHourlyForecast,
  travelType: selectedTravelTypeId,
})

const priorityRisks = computed(() => priorityDay.value?.risks ?? [])

const packingListKey = computed(() => {
  return `${travelPlan.value.cityId}-${travelPlan.value.startDate}-${travelPlan.value.endDate}-${travelPlan.value.travelType}`
})

const formattedTravelPeriod = computed(() => formatTravelPeriod(travelPlan.value.startDate, travelPlan.value.endDate))
const tripDurationLabel = computed(() => getTripDurationLabel(travelPlan.value.startDate, travelPlan.value.endDate))

const lastUpdatedText = computed(() => {
  const fetchedAt = travelStore.selectedForecast?.fetchedAt

  if (!fetchedAt) {
    return ''
  }

  return new Date(fetchedAt).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
})

const forecastProviderLabel = computed(() => {
  return travelStore.selectedForecast?.providerLabel ?? 'Open-Meteo · CAMS'
})

const forecastProviderUrl = computed(() => {
  return travelStore.selectedForecast?.provider === 'openweather' ? 'https://openweathermap.org/forecast5' : 'https://open-meteo.com/'
})

const formatMetric = (value, suffix, maximumFractionDigits = 1) => {
  if (!Number.isFinite(value)) {
    return '-'
  }

  return `${formatNumber(value, maximumFractionDigits)}${suffix}`
}

const handleAnalyze = async (forceRefresh = false) => {
  hasRequested.value = true
  await travelStore.fetchTravelForecast(travelPlan.value.cityId, forceRefresh)
}

const handleRetry = () => {
  handleAnalyze(true)
}

const handleOfficialWarningRefresh = () => {
  officialWarningStore.fetchOfficialWarnings()
}

const handleSavePlan = () => {
  const saveResult = savedTravelStore.savePlan(travelPlan.value)

  ElMessage({
    type: 'success',
    message: saveResult === 'created' ? '여행 일정을 저장했습니다.' : '저장된 여행 일정을 최신 내용으로 갱신했습니다.',
  })
}

const handleLoadPlan = async (plan) => {
  const today = getTodayDateValue()

  travelPlan.value = {
    cityId: plan.cityId,
    startDate: plan.startDate < today ? today : plan.startDate,
    endDate: plan.endDate,
    travelType: plan.travelType,
  }

  await nextTick()
  await handleAnalyze(true)

  if (!travelStore.errorMessage) {
    ElMessage({
      type: 'success',
      message: '저장한 일정을 불러와 최신 예보로 다시 분석했습니다.',
    })
  }
}

const handleRemovePlan = (planId) => {
  savedTravelStore.removePlan(planId)
  ElMessage({
    type: 'info',
    message: '저장한 여행 일정을 삭제했습니다.',
  })
}

const getQueryValue = (value) => {
  return Array.isArray(value) ? value[0] : value
}

const isAvailableForecastPeriod = (startDate, endDate) => {
  const today = getTodayDateValue()
  const lastForecastDate = addDaysToDateValue(today, TRAVEL_FORECAST_MAX_DAYS)
  const nights = getDaysBetween(startDate, endDate)

  return startDate >= today && endDate <= lastForecastDate && Number.isFinite(nights) && nights >= 0 && nights <= TRAVEL_FORECAST_MAX_DAYS
}

const restorePlanFromQuery = async () => {
  const cityId = getQueryValue(route.query.cityId)
  const legacyDate = getQueryValue(route.query.date)
  const startDate = getQueryValue(route.query.startDate) ?? legacyDate
  const endDate = getQueryValue(route.query.endDate) ?? legacyDate ?? startDate
  const travelType = getQueryValue(route.query.travelType)
  const hasValidCity = travelStore.cities.some((city) => city.id === cityId)
  const hasValidTravelType = travelTypes.some((type) => type.id === travelType)

  if (!hasValidCity || !hasValidTravelType || !startDate || !endDate || !isAvailableForecastPeriod(startDate, endDate)) {
    return
  }

  travelPlan.value = { cityId, startDate, endDate, travelType }
  await nextTick()
  await handleAnalyze(true)
}

watch(
  () => travelPlan.value.cityId,
  (newCityId, oldCityId) => {
    if (newCityId !== oldCityId) {
      hasRequested.value = false
      travelStore.clearError()
    }
  },
)

onMounted(() => {
  restorePlanFromQuery()
})
</script>

<template>
  <div class="travel-container">
    <section class="page-heading">
      <div>
        <p class="page-eyebrow">TRAVEL WEATHER COACH</p>
        <h1>날씨에 맞춰 여행을 계획하세요</h1>
        <p>여행지와 기간, 활동 유형을 선택하면 날짜별 예보와 통합 준비물을 제공합니다.</p>
      </div>
    </section>

    <el-alert title="앱 위험 분석은 예보 기반 참고 정보이며, 기상청 공식 특보와 구분해 제공합니다." type="info" show-icon :closable="false" />

    <TravelPlannerForm v-model="travelPlan" :cities="travelStore.cities" :travel-types="travelTypes" :is-loading="travelStore.isLoading" @analyze="handleAnalyze" />

    <SavedTravelPlans :plans="savedTravelStore.sortedPlans" :cities="travelStore.cities" :travel-types="travelTypes" @load-plan="handleLoadPlan" @remove-plan="handleRemovePlan" />

    <section v-if="travelStore.isLoading" class="surface-card result-state">
      <div class="result-heading">
        <div>
          <span class="section-kicker">FORECAST LOADING</span>
          <h2>여행 예보를 불러오는 중입니다</h2>
        </div>
      </div>
      <el-skeleton :rows="7" animated />
    </section>

    <section v-else-if="hasRequested && travelStore.errorMessage" class="surface-card error-state">
      <el-alert :title="travelStore.errorMessage" type="error" show-icon :closable="false" />
      <el-button type="danger" plain round @click="handleRetry">
        <RefreshCw :size="16" />
        다시 시도
      </el-button>
    </section>

    <section v-else-if="hasRequested && hasCompletePeriodForecast" class="surface-card forecast-result">
      <div class="result-heading">
        <div>
          <span class="section-kicker">TRIP PERIOD FORECAST</span>
          <h2>{{ travelStore.selectedCity?.name }} · {{ formattedTravelPeriod }}</h2>
          <p>{{ tripDurationLabel }} · {{ selectedTravelType?.label }} 일정의 기간 종합 예보입니다.</p>
        </div>

        <div class="result-actions">
          <el-tag type="success" effect="light" round>예보 연결 완료</el-tag>
          <el-button type="primary" plain round @click="handleSavePlan">
            <BookmarkPlus :size="16" />
            일정 저장
          </el-button>
        </div>
      </div>

      <el-alert
        v-if="travelStore.selectedForecast?.isFallback"
        class="fallback-notice"
        :title="travelStore.selectedForecast.fallbackMessage"
        description="대체 예보는 3시간 구간 자료를 코칭용 시간 단위로 환산한 참고값이며, 자외선 수치는 제공되지 않습니다."
        type="warning"
        show-icon
        :closable="false"
      />

      <div class="forecast-grid">
        <article class="forecast-item temperature-item">
          <span class="metric-icon"><Thermometer :size="22" /></span>
          <p>기간 최저 / 최고기온</p>
          <strong>{{ formatTemp(periodForecast.tempMin) }} / {{ formatTemp(periodForecast.tempMax) }}</strong>
        </article>

        <article class="forecast-item rain-item">
          <span class="metric-icon"><CloudRain :size="22" /></span>
          <p>기간 중 최고 강수확률</p>
          <strong>{{ formatMetric(periodForecast.precipitationProbabilityMax, '%', 0) }}</strong>
          <small>강수량이나 지속시간과는 다른 값</small>
        </article>

        <article class="forecast-item wind-item">
          <span class="metric-icon"><Wind :size="22" /></span>
          <p>기간 중 최대 돌풍</p>
          <strong>{{ formatMetric(periodForecast.windGustMax, 'm/s') }}</strong>
        </article>

        <article class="forecast-item uv-item">
          <span class="metric-icon"><Sun :size="22" /></span>
          <p>기간 중 최대 자외선 지수</p>
          <strong>{{ formatMetric(periodForecast.uvIndexMax, '') }}</strong>
        </article>
      </div>

      <div class="forecast-meta">
        <span>
          <CalendarCheck :size="16" />
          마지막 조회 {{ lastUpdatedText }}
        </span>
        <span>
          예보·대기질 출처
          <a :href="forecastProviderUrl" target="_blank" rel="noopener noreferrer">{{ forecastProviderLabel }}</a>
        </span>
      </div>
    </section>

    <section v-else-if="hasRequested" class="surface-card">
      <el-empty description="선택한 여행 기간의 예보를 모두 찾을 수 없습니다." />
    </section>

    <section v-else class="surface-card empty-state">
      <el-empty description="여행 조건을 선택하고 날씨 확인 버튼을 눌러 주세요." :image-size="92" />
    </section>

    <template v-if="hasRequested && hasCompletePeriodForecast && !travelStore.isLoading && !travelStore.errorMessage">
      <OfficialWeatherAlert
        v-if="includesToday"
        :warnings="selectedOfficialWarnings"
        :issued-at="officialWarningStore.issuedAt"
        :is-loading="officialWarningStore.isLoading"
        :error-message="officialWarningStore.errorMessage"
        :context-label="officialWarningContext"
        compact
        @refresh="handleOfficialWarningRefresh"
      />

      <el-alert v-else title="기상청 공식 특보는 현재 발효 현황이므로 오늘이 포함되지 않은 여행 기간에는 표시하지 않습니다." type="info" show-icon :closable="false" />

      <TravelDayForecastCards :days="analyzedDays" />

      <TravelRiskList :status="periodStatus" :risks="priorityRisks" />

      <TravelPackingList :key="packingListKey" :items="packingItems" />

      <el-collapse class="analysis-guide">
        <el-collapse-item title="앱 분석 기준과 한계 보기" name="analysis-guide">
          <p>
            강수·돌풍·체감온도·가시거리 기준은 여행 일정 조정을 돕기 위한 앱 내부 참고 기준입니다. 자외선은 WHO 분류를 참고하며,
            <template v-if="travelStore.selectedForecast?.provider === 'openweather'">대기질은 OpenWeather 1~5단계를 사용합니다.</template>
            <template v-else>대기질은 미국 AQI 분류를 사용합니다.</template>
            실제 안전 결정은 기상청 특보와 현장 통제 안내를 우선하세요.
          </p>
          <div class="criteria-list">
            <span>강수: 시간대별 확률 60% 또는 제공 예보 구간 누적 5mm부터 주의</span>
            <span>돌풍: 여행 유형별 8~12m/s부터 주의</span>
            <span>체감온도: 30℃ 이상 또는 0℃ 이하부터 주의</span>
            <span>가시거리: 운전 2km·기타 활동 1km 미만 또는 안개 예보부터 앱 주의 · 500m 미만 시야 위험</span>
            <span>눈: 눈 예보부터 주의 · 운전 2cm·기타 활동 5cm 이상 또는 강한 눈 예보 시 위험</span>
            <span>자외선: 6 이상 주의 · 8 이상 위험</span>
            <span v-if="travelStore.selectedForecast?.provider === 'openweather'">OpenWeather 대기질: 4/5단계부터 주의 · 5/5단계 높은 위험</span>
            <span v-else>미국 AQI: 101 이상 주의 · 151 이상 높은 위험</span>
          </div>
          <p class="reference-links">
            참고:
            <a href="https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-%28uv%29-index" target="_blank" rel="noopener noreferrer">WHO 자외선 지수</a>
            ·
            <a v-if="travelStore.selectedForecast?.provider === 'openweather'" href="https://openweathermap.org/api/air-pollution" target="_blank" rel="noopener noreferrer">OpenWeather 대기질 단계</a>
            <a v-else href="https://www.airnow.gov/aqi/aqi-basics/" target="_blank" rel="noopener noreferrer">AirNow 미국 AQI 분류</a>
          </p>
        </el-collapse-item>
      </el-collapse>
    </template>
  </div>
</template>

<style scoped>
.travel-container {
  display: grid;
  gap: 18px;
}

.page-heading {
  margin-bottom: 6px;
}

.page-heading h1 {
  margin: 2px 0 6px;
  color: var(--weather-navy);
  font-size: clamp(1.75rem, 4vw, 2.4rem);
  line-height: 1.2;
  letter-spacing: -0.04em;
}

.page-heading p:not(.page-eyebrow),
.result-heading p {
  color: var(--weather-muted);
}

.page-eyebrow,
.section-kicker {
  color: var(--weather-primary);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.surface-card {
  padding: 24px;
  background: var(--weather-surface);
  border: 1px solid var(--weather-border);
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(51, 65, 85, 0.06);
}

.result-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 20px;
}

.result-heading h2 {
  margin: 2px 0 3px;
  color: var(--weather-navy);
  font-size: 1.3rem;
}

.result-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.result-actions .el-button {
  gap: 5px;
}

.fallback-notice {
  margin-bottom: 16px;
}

.forecast-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 11px;
}

.forecast-item {
  padding: 17px;
  background: var(--weather-surface-soft);
  border: 1px solid var(--weather-border);
  border-radius: 14px;
}

.metric-icon {
  display: grid;
  width: 38px;
  height: 38px;
  margin-bottom: 10px;
  border-radius: 11px;
  place-items: center;
}

.forecast-item p {
  color: var(--weather-muted);
  font-size: 0.76rem;
}

.forecast-item strong {
  display: block;
  margin-top: 2px;
  color: var(--weather-navy);
  font-size: 1rem;
}

.forecast-item small {
  display: block;
  margin-top: 3px;
  color: var(--weather-muted);
  font-size: 0.64rem;
}

.temperature-item .metric-icon {
  color: #ea580c;
  background: #fff7ed;
}

.rain-item .metric-icon {
  color: #2563eb;
  background: #eff6ff;
}

.wind-item .metric-icon {
  color: #0891b2;
  background: #ecfeff;
}

.uv-item .metric-icon {
  color: #d97706;
  background: #fffbeb;
}

.forecast-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
  padding-top: 14px;
  color: var(--weather-muted);
  border-top: 1px solid var(--weather-border);
  font-size: 0.78rem;
}

.forecast-meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.forecast-meta a {
  color: var(--weather-primary);
  font-weight: 800;
}

.error-state {
  display: grid;
  gap: 14px;
}

.error-state .el-button {
  justify-self: start;
  gap: 6px;
}

.empty-state {
  padding-block: 38px;
}

.analysis-guide {
  padding: 0 18px;
  background: #ffffff;
  border: 1px solid var(--weather-border);
  border-radius: 14px;
}

.analysis-guide :deep(.el-collapse-item__header) {
  color: var(--weather-navy);
  font-weight: 800;
}

.analysis-guide :deep(.el-collapse-item__content) {
  color: var(--weather-muted);
  font-size: 0.8rem;
}

.criteria-list {
  display: flex;
  gap: 6px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.criteria-list span {
  padding: 5px 8px;
  color: var(--weather-text);
  background: var(--weather-surface-soft);
  border-radius: 7px;
}

.reference-links {
  margin-top: 10px;
}

.reference-links a {
  color: var(--weather-primary);
  font-weight: 800;
}

@media (max-width: 900px) {
  .forecast-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 580px) {
  .result-heading,
  .forecast-meta {
    align-items: flex-start;
    flex-direction: column;
  }

  .forecast-grid {
    grid-template-columns: 1fr;
  }
}
</style>
