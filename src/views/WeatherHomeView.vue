<script setup>
import { ref, computed, watch, watchEffect, onMounted } from 'vue'
import { ArrowRight, Clock3, Droplets, Gauge, MapPin, RefreshCw, Thermometer, Wind } from '@lucide/vue'

import { useRouter } from 'vue-router'

import { useWeatherStore } from '@/stores/weatherStore'
import { useTravelStore } from '@/stores/travelStore'
import { useOfficialWarningStore } from '@/stores/officialWarningStore'
import { useSavedTravelStore } from '@/stores/savedTravelStore'
import { useTemperature } from '@/composables/useTemperature'
import { travelTypes } from '@/data/travelTypes'
import { formatNumber } from '@/utils/numberFormat'

import clearBackground from '@/assets/weather-backgrounds/clear.jpg'
import cloudsBackground from '@/assets/weather-backgrounds/clouds.jpg'
import mistBackground from '@/assets/weather-backgrounds/mist.jpg'
import rainBackground from '@/assets/weather-backgrounds/rain.jpg'
import snowBackground from '@/assets/weather-backgrounds/snow.jpg'
import thunderstormBackground from '@/assets/weather-backgrounds/thunderstorm.jpg'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import LifeWeatherCoach from '@/components/exercise/LifeWeatherCoach.vue'
import NextTravelPlan from '@/components/exercise/NextTravelPlan.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import FeelsLikeThreshold from '@/components/exercise/FeelsLikeThreshold.vue'
import HottestCity from '@/components/exercise/HottestCity.vue'
import HeatWarningList from '@/components/exercise/HeatWarningList.vue'

// Router
const router = useRouter()

// Pinia Store
const weatherStore = useWeatherStore()
const travelStore = useTravelStore()
const officialWarningStore = useOfficialWarningStore()
const savedTravelStore = useSavedTravelStore()

// 온도 변환 Composable
const { formatTemp } = useTemperature()

// =========================
// 현재 View에서만 사용하는 상태
// =========================

// 검색어
const searchQuery = ref('')

// 선택한 도시
const selectedCityId = ref('')
const selectedCityInfo = ref('카드를 클릭해 보세요.')

// 현재 도시 목록 탭
const activeTab = ref('all')

// =========================
// 현재 View에서만 필요한 computed
// =========================

// 현재 탭 + 검색어에 따라 표시할 도시 목록
const displayedWeatherList = computed(() => {
  const query = searchQuery.value.trim()

  const sourceList = activeTab.value === 'favorite' ? weatherStore.favoriteCities : weatherStore.weatherWithFeelsLike

  return sourceList.filter((city) => city.name.includes(query))
})

// 마지막 API 조회 시각
const lastUpdatedText = computed(() => {
  if (!weatherStore.lastUpdatedAt) {
    return '아직 갱신되지 않음'
  }

  return new Date(weatherStore.lastUpdatedAt).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
})

// 생활 코치에서 사용할 선택 도시
const selectedCity = computed(() => {
  if (!selectedCityId.value) {
    return null
  }

  return weatherStore.getCityById(selectedCityId.value)
})

const featuredCity = computed(() => {
  return selectedCity.value ?? weatherStore.hottestFeelsLikeCity ?? weatherStore.weatherWithFeelsLike[0] ?? null
})

const heroBackgrounds = {
  clear: clearBackground,
  clouds: cloudsBackground,
  drizzle: rainBackground,
  rain: rainBackground,
  snow: snowBackground,
  thunderstorm: thunderstormBackground,
  mist: mistBackground,
  smoke: mistBackground,
  haze: mistBackground,
  dust: mistBackground,
  fog: mistBackground,
  sand: mistBackground,
  ash: mistBackground,
  squall: thunderstormBackground,
  tornado: thunderstormBackground,
}

const heroWeatherTheme = computed(() => {
  const condition = featuredCity.value?.condition

  if (condition && heroBackgrounds[condition]) {
    return condition
  }

  const status = featuredCity.value?.status ?? ''

  if (/천둥|번개/.test(status)) return 'thunderstorm'
  if (/눈/.test(status)) return 'snow'
  if (/비|소나기/.test(status)) return 'rain'
  if (/안개|박무|연무|황사/.test(status)) return 'mist'
  if (/맑/.test(status)) return 'clear'

  return 'clouds'
})

const heroBackgroundStyle = computed(() => ({
  '--hero-weather-image': `url("${heroBackgrounds[heroWeatherTheme.value]}")`,
}))

// 오늘 날짜를 API의 YYYY-MM-DD 형식으로 변환
const todayDate = computed(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const date = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${date}`
})

// 여행 Store에 저장된 예보를 생활 코치에서도 재사용
const selectedLifeForecast = computed(() => {
  if (!selectedCityId.value) {
    return null
  }

  return travelStore.getForecastByCityId(selectedCityId.value)
})

const lifeDailyForecast = computed(() => {
  return selectedLifeForecast.value?.daily.find((day) => day.date === todayDate.value) ?? null
})

const lifeHourlyForecast = computed(() => {
  return selectedLifeForecast.value?.hourly.filter((hour) => hour.time.startsWith(todayDate.value)) ?? []
})

const isLifeForecastLoading = computed(() => {
  return travelStore.isLoading && travelStore.selectedCityId === selectedCityId.value
})

const lifeForecastError = computed(() => {
  if (travelStore.selectedCityId !== selectedCityId.value) {
    return ''
  }

  return travelStore.errorMessage
})

const lifeOfficialWarnings = computed(() => {
  if (!selectedCityId.value) {
    return []
  }

  return officialWarningStore.getWarningsForCity(selectedCityId.value)
})

const nextTravelPlan = computed(() => savedTravelStore.nextUpcomingPlan)

const nextTravelCity = computed(() => {
  if (!nextTravelPlan.value) {
    return null
  }

  return travelStore.cities.find((city) => city.id === nextTravelPlan.value.cityId) ?? null
})

const nextTravelType = computed(() => {
  if (!nextTravelPlan.value) {
    return null
  }

  return travelTypes.find((type) => type.id === nextTravelPlan.value.travelType) ?? null
})

const nextTravelOfficialWarnings = computed(() => {
  if (!nextTravelPlan.value || nextTravelPlan.value.startDate > todayDate.value || nextTravelPlan.value.endDate < todayDate.value) {
    return []
  }

  return officialWarningStore.getWarningsForCity(nextTravelPlan.value.cityId)
})

// =========================
// 이벤트 처리
// =========================

// SearchBar에서 emit된 값 처리
const updateQuery = (value) => {
  searchQuery.value = value.trim()
}

// FeelsLikeThreshold에서 emit된 값 처리
const updateThreshold = (value) => {
  weatherStore.updateThreshold(value)
}

// WeatherCard 선택
const selectCity = (city) => {
  selectedCityId.value = city.id
  selectedCityInfo.value = `${city.name}이 선택되었습니다.`
  travelStore.clearError()
}

// 즐겨찾기 체크/해제
const handleToggleFavorite = (cityId) => {
  weatherStore.toggleFavorite(cityId)
}

// 도시 목록 탭 변경
const changeTab = (tab) => {
  activeTab.value = tab
}

// 상세 페이지 이동
const goToDetail = (city) => {
  router.push('/weather/' + city.id)
}

// 최신 날씨 다시 조회
const handleRefresh = () => {
  weatherStore.fetchWeatherList()
}

// 선택한 도시 한 곳의 오늘 시간별 예보 조회
const handleLifeForecastRequest = (forceRefresh) => {
  if (selectedCityId.value) {
    travelStore.fetchTravelForecast(selectedCityId.value, forceRefresh)
  }
}

const handleOfficialWarningRefresh = () => {
  officialWarningStore.fetchOfficialWarnings()
}

const handleCheckSavedTravel = (plan) => {
  router.push({
    name: 'travel-coach',
    query: {
      cityId: plan.cityId,
      startDate: plan.startDate < todayDate.value ? todayDate.value : plan.startDate,
      endDate: plan.endDate,
      travelType: plan.travelType,
    },
  })
}

// =========================
// watch
// =========================

watch(selectedCityInfo, (newValue, oldValue) => {
  console.log(`[watch 감지] 상태 바 문구가 업데이트되었습니다: "${oldValue}" → "${newValue}"`)
})

watchEffect(() => {
  console.log(`[watchEffect 자동 호출] 현재 검색어: "${searchQuery.value}" / 매칭 도시 수: ${displayedWeatherList.value.length}`)
})

watch(
  () => weatherStore.feelsLikeThreshold,
  (newValue, oldValue) => {
    console.log(`⚠️ 체감온도 경고 기준이 ${oldValue}℃에서 ${newValue}℃로 변경되었습니다.`)
  },
)

// =========================
// Lifecycle
// =========================

// 화면이 처음 생성된 후 실제 날씨 API 호출
onMounted(() => {
  if (weatherStore.weatherList.length === 0 && !weatherStore.isLoading) {
    weatherStore.fetchWeatherList()
  }
})
</script>

<template>
  <div class="dashboard-wrapper">
    <section class="dashboard-hero" :style="heroBackgroundStyle" :data-weather-theme="heroWeatherTheme">
      <div class="hero-toolbar">
        <div>
          <p class="page-eyebrow">LIVE WEATHER · SOUTH KOREA</p>
          <span class="hero-updated"><Clock3 :size="13" /> 마지막 갱신 {{ lastUpdatedText }}</span>
        </div>

        <el-button class="hero-refresh" round :loading="weatherStore.isLoading" @click="handleRefresh">
          <RefreshCw v-if="!weatherStore.isLoading" :size="15" />
          새로고침
        </el-button>
      </div>

      <div v-if="featuredCity" class="hero-weather-layout">
        <div class="hero-primary">
          <span class="hero-location"><MapPin :size="15" /> {{ featuredCity.fullName }}</span>
          <p class="hero-status">{{ featuredCity.status }}</p>
          <h1>{{ formatTemp(featuredCity.temp) }}</h1>
          <p class="hero-summary">{{ featuredCity.name }}의 현재 날씨</p>

          <div class="hero-metrics">
            <span
              ><Thermometer :size="16" /> 체감 <strong>{{ formatTemp(featuredCity.feelsLike) }}</strong></span
            >
            <span
              ><Droplets :size="16" /> 습도 <strong>{{ formatNumber(featuredCity.humidity, 0) }}%</strong></span
            >
            <span
              ><Wind :size="16" /> 바람 <strong>{{ formatNumber(featuredCity.wind, 1) }}m/s</strong></span
            >
            <span v-if="featuredCity.airQuality"
              ><Gauge :size="16" /> 대기질 <strong>{{ featuredCity.airQuality.label }}</strong></span
            >
          </div>

          <el-button class="hero-detail-button" round @click="goToDetail(featuredCity)">
            상세 관측 보기
            <ArrowRight :size="15" />
          </el-button>
        </div>

        <div class="hero-controls">
          <div class="hero-control-card">
            <SearchBar :current-query="searchQuery" @update-query="updateQuery" />
          </div>

          <div class="hero-control-card">
            <FeelsLikeThreshold :threshold="weatherStore.feelsLikeThreshold" @update-threshold="updateThreshold" />
          </div>
        </div>
      </div>

      <div v-else class="hero-empty-state">
        <el-skeleton :rows="4" animated />
      </div>
    </section>

    <section class="dashboard-secondary">
      <NextTravelPlan
        v-if="nextTravelPlan && nextTravelCity && nextTravelType"
        :plan="nextTravelPlan"
        :city="nextTravelCity"
        :travel-type="nextTravelType"
        :saved-count="savedTravelStore.upcomingPlans.length"
        :official-warnings="nextTravelOfficialWarnings"
        @check-weather="handleCheckSavedTravel"
      />
    </section>

    <!-- 날씨 목록 -->
    <BaseDashboardCard class="weather-list-panel">
      <!-- API 로딩 중 -->
      <div v-if="weatherStore.isLoading" class="loading-state">
        <div class="section-title-row">
          <div>
            <span class="section-kicker">실시간 관측</span>
            <h2>날씨 데이터를 불러오는 중입니다</h2>
          </div>
        </div>

        <el-skeleton :rows="6" animated />
      </div>

      <!-- API 오류 -->
      <div v-else-if="weatherStore.errorMessage" class="error-state">
        <el-alert :title="weatherStore.errorMessage" type="error" show-icon :closable="false" />
        <el-button type="danger" plain round @click="handleRefresh">다시 시도</el-button>
      </div>

      <!-- API 정상 조회 완료 -->
      <div v-else>
        <div class="section-title-row">
          <div>
            <span class="section-kicker">CITY OVERVIEW</span>
            <h2>지역별 날씨 현황</h2>
          </div>

          <el-tag effect="plain" round>{{ displayedWeatherList.length }}개 도시</el-tag>
        </div>

        <!-- 전체 / 즐겨찾기 탭 -->
        <el-tabs :model-value="activeTab" class="weather-tabs" @tab-change="changeTab">
          <el-tab-pane label="전체 도시" name="all" />
          <el-tab-pane :label="`즐겨찾기 (${weatherStore.favoriteCities.length})`" name="favorite" />
        </el-tabs>

        <!-- 즐겨찾기 없음 -->
        <el-empty v-if="activeTab === 'favorite' && weatherStore.favoriteCities.length === 0" description="즐겨찾기한 도시가 없습니다." :image-size="84" />

        <!-- 검색 결과 없음 -->
        <el-empty v-else-if="searchQuery !== '' && displayedWeatherList.length === 0" description="검색 결과와 일치하는 도시가 없습니다." :image-size="84" />

        <!-- 도시별 날씨 카드 -->
        <div v-else class="weather-grid">
          <WeatherCard
            v-for="city in displayedWeatherList"
            :key="city.id"
            :city-item="city"
            :selected="selectedCityId === city.id"
            :favorite="weatherStore.favoriteCityIds.includes(city.id)"
            :feels-like-threshold="weatherStore.feelsLikeThreshold"
            @select-card="selectCity"
            @click-detail="goToDetail"
            @toggle-favorite="handleToggleFavorite"
          />
        </div>

        <div class="summary-grid detail-summary-grid">
          <HottestCity v-if="weatherStore.hottestFeelsLikeCity" :city="weatherStore.hottestFeelsLikeCity" />

          <HeatWarningList :cities="weatherStore.warningCities" :threshold="weatherStore.feelsLikeThreshold">
            <template #default="{ city }">
              <span class="warning-city-name">{{ city.name }}</span>
              <span>체감 {{ formatTemp(city.feelsLike) }} · 실제 {{ formatTemp(city.temp) }}</span>
            </template>
          </HeatWarningList>
        </div>
      </div>
    </BaseDashboardCard>

    <!-- 선택 상태 -->
    <div class="status-bar">
      <MapPin :size="17" />
      <span>{{ selectedCityInfo }}</span>
    </div>

    <div class="life-coach-section">
      <LifeWeatherCoach
        :city="selectedCity"
        :daily-forecast="lifeDailyForecast"
        :hourly-forecast="lifeHourlyForecast"
        :forecast-source="selectedLifeForecast?.providerLabel"
        :is-fallback-forecast="selectedLifeForecast?.isFallback"
        :fallback-message="selectedLifeForecast?.fallbackMessage"
        :is-loading="isLifeForecastLoading"
        :error-message="lifeForecastError"
        :official-warnings="lifeOfficialWarnings"
        :official-warning-issued-at="officialWarningStore.issuedAt"
        :official-warning-loading="officialWarningStore.isLoading"
        :official-warning-error="officialWarningStore.errorMessage"
        @request-forecast="handleLifeForecastRequest"
        @refresh-official-warnings="handleOfficialWarningRefresh"
      />
    </div>
  </div>
</template>

<style scoped>
.page-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.page-heading h1 {
  margin: 2px 0 7px;
  color: var(--weather-navy);
  font-size: clamp(1.8rem, 4vw, 2.55rem);
  line-height: 1.2;
  letter-spacing: -0.04em;
}

.page-heading p:not(.page-eyebrow) {
  color: var(--weather-muted);
}

.page-eyebrow,
.section-kicker {
  color: var(--weather-primary);
  font-size: 0.73rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.refresh-area {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.refresh-area .el-button {
  gap: 6px;
}

.updated-time {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--weather-muted);
  font-size: 0.78rem;
}

.control-grid,
.summary-grid,
.weather-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.control-grid {
  margin-bottom: 18px;
}

.control-grid :deep(.base-dashboard-card) {
  height: 100%;
  margin-bottom: 0;
}

.section-title-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin: 28px 0 14px;
}

.section-title-row:first-child {
  margin-top: 0;
}

.section-title-row h2 {
  margin: 2px 0 0;
  color: var(--weather-navy);
  font-size: 1.3rem;
  letter-spacing: -0.025em;
}

.summary-grid {
  align-items: stretch;
}

.warning-city-name {
  color: var(--weather-navy);
  font-weight: 800;
}

.weather-tabs {
  margin-bottom: 18px;
}

.weather-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}

.weather-tabs :deep(.el-tabs__content) {
  display: none;
}

.weather-grid {
  align-items: stretch;
}

.status-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  color: #166534;
  background: #ecfdf5;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  font-weight: 700;
}

.life-coach-section {
  margin-top: 18px;
}

.error-state {
  display: grid;
  gap: 14px;
}

.error-state .el-button {
  justify-self: start;
}

.loading-state :deep(.el-skeleton__item) {
  border-radius: 8px;
}

@media (max-width: 860px) {
  .weather-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .page-heading {
    flex-direction: column;
  }

  .refresh-area {
    align-items: flex-start;
  }

  .control-grid,
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<style scoped>
.dashboard-hero {
  --hero-weather-image: none;
  position: relative;
  min-height: 410px;
  padding: 24px 26px;
  overflow: hidden;
  color: var(--weather-on-dark);
  background-color: #181a1b;
  background-image: linear-gradient(105deg, rgba(0, 0, 0, 0.74) 0%, rgba(0, 0, 0, 0.5) 30%, rgba(0, 0, 0, 0.2) 63%, rgba(0, 0, 0, 0.42) 100%), var(--hero-weather-image);
  background-size: cover, cover;
  background-position:
    center,
    center 68%;
  background-repeat: no-repeat;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 21px;
  box-shadow: 0 24px 52px rgba(0, 0, 0, 0.2);
  isolation: isolate;
}

.dashboard-hero::after {
  position: absolute;
  inset: 0;
  z-index: -1;
  content: '';
  background: linear-gradient(115deg, transparent 35%, rgba(255, 255, 255, 0.07), transparent 62%);
  opacity: 0.8;
}

.hero-toolbar,
.hero-weather-layout {
  display: flex;
  justify-content: space-between;
  gap: 28px;
}

.hero-toolbar {
  align-items: flex-start;
}

.dashboard-hero .page-eyebrow {
  color: #a9d8ce;
  font-size: 0.65rem;
}

.hero-updated {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
  color: #afc8c3;
  font-size: 0.7rem;
}

.hero-refresh.el-button,
.hero-detail-button.el-button {
  --el-button-bg-color: rgba(255, 255, 255, 0.1);
  --el-button-border-color: rgba(255, 255, 255, 0.23);
  --el-button-text-color: #ffffff;
  --el-button-hover-bg-color: rgba(255, 255, 255, 0.18);
  --el-button-hover-border-color: rgba(255, 255, 255, 0.34);
  --el-button-hover-text-color: #ffffff;
  gap: 6px;
  backdrop-filter: blur(12px);
}

.hero-weather-layout {
  align-items: flex-end;
  margin-top: 34px;
}

.hero-primary {
  min-width: 0;
}

.hero-location {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #cfe1dd;
  font-size: 0.78rem;
  font-weight: 700;
}

.hero-status {
  margin-top: 17px;
  color: #d3e3df;
  font-size: clamp(1.25rem, 2.2vw, 1.85rem);
  font-weight: 680;
  letter-spacing: -0.03em;
}

.hero-primary h1 {
  margin: -2px 0 0;
  color: #ffffff;
  font-size: clamp(4.5rem, 8vw, 7rem);
  font-weight: 440;
  line-height: 0.98;
  letter-spacing: -0.075em;
  text-shadow: 0 10px 28px rgba(0, 0, 0, 0.18);
}

.hero-summary {
  margin-top: 5px;
  color: #9eb9b3;
  font-size: 0.78rem;
}

.hero-metrics {
  display: flex;
  gap: 8px;
  margin-top: 19px;
  flex-wrap: wrap;
}

.hero-metrics > span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 9px;
  color: #bcd0cb;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9px;
  font-size: 0.7rem;
  backdrop-filter: blur(10px);
}

.hero-metrics strong {
  color: #ffffff;
}

.hero-detail-button {
  margin-top: 16px;
}

.hero-controls {
  display: grid;
  width: min(390px, 40%);
  gap: 10px;
}

.hero-control-card {
  --weather-navy: #f4f4f5;
  --weather-muted: #c4c4c7;
  padding: 14px 15px;
  background: rgba(17, 20, 22, 0.48);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 13px;
  backdrop-filter: blur(18px);
}

.hero-control-card :deep(.field-label) {
  margin-bottom: 7px;
  font-size: 0.76rem;
}

.hero-control-card :deep(.field-help) {
  margin-top: 6px;
  font-size: 0.68rem;
}

.hero-control-card :deep(.el-input__wrapper),
.hero-control-card :deep(.el-input-number .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.92);
  box-shadow: none;
}

.hero-empty-state {
  width: min(620px, 100%);
  margin-top: 60px;
}

.dashboard-secondary:empty {
  display: none;
}

.dashboard-secondary:not(:empty) {
  margin-top: 14px;
}

.weather-list-panel {
  margin-top: 14px;
}

.weather-list-panel :deep(.base-dashboard-card) {
  padding: 18px;
}

.section-title-row {
  margin: 0 0 10px;
}

.weather-tabs {
  margin-bottom: 12px;
}

.weather-grid {
  grid-template-columns: repeat(auto-fit, minmax(235px, 1fr));
  gap: 10px;
}

.detail-summary-grid {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--weather-border);
}

.status-bar {
  justify-content: flex-start;
  margin-top: 10px;
  padding: 9px 12px;
  color: var(--weather-primary-dark);
  background: var(--weather-primary-soft);
  border-color: #c7ddd7;
  font-size: 0.75rem;
}

.life-coach-section {
  margin-top: 12px;
}

@media (max-width: 980px) {
  .hero-weather-layout {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-controls {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
  }
}

@media (max-width: 680px) {
  .dashboard-hero {
    min-height: 0;
    padding: 18px;
  }

  .hero-weather-layout {
    margin-top: 25px;
  }

  .hero-toolbar {
    gap: 10px;
  }

  .hero-refresh.el-button {
    width: 38px;
    min-width: 38px;
    padding: 0;
    font-size: 0;
  }

  .hero-primary h1 {
    font-size: 4.7rem;
  }

  .hero-controls {
    grid-template-columns: 1fr;
  }

  .hero-metrics {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .hero-metrics > span {
    justify-content: center;
  }

  .weather-grid {
    grid-template-columns: 1fr;
  }
}
</style>
