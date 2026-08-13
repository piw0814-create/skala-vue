<script setup>
import { computed, onMounted, ref } from 'vue'
import { ChartNoAxesCombined, CloudSun, Compass, Info, LayoutDashboard, Sparkles, TriangleAlert } from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'

import OfficialWeatherAlert from './components/OfficialWeatherAlert.vue'
import WeatherIntro from './components/WeatherIntro.vue'
import UnitToggler from './components/exercise/UnitToggler.vue'
import { useTemperature } from './composables/useTemperature'
import { useOfficialWarningStore } from './stores/officialWarningStore'
import { useWeatherStore } from './stores/weatherStore'
import { formatNumber } from './utils/numberFormat'

const officialWarningStore = useOfficialWarningStore()
const weatherStore = useWeatherStore()
const route = useRoute()
const router = useRouter()
const introDismissed = ref(sessionStorage.getItem('skala-weather-intro-seen') === 'true')
const { formatTemp } = useTemperature()

const showIntro = computed(() => route.name === 'weather-home' && !introDismissed.value)

const introWeatherSummary = computed(() => {
  if (weatherStore.weatherList.length === 0) {
    return null
  }

  const statusCounts = weatherStore.weatherList.reduce((counts, city) => {
    counts[city.status] = (counts[city.status] ?? 0) + 1
    return counts
  }, {})
  const representativeStatus = Object.entries(statusCounts).reduce((representative, current) => (current[1] > representative[1] ? current : representative))[0]

  return {
    averageTemp: formatTemp(weatherStore.averageTemp),
    averageHumidity: `${formatNumber(weatherStore.averageHumidity, 0)}%`,
    averageWind: `${formatNumber(weatherStore.averageWind, 1)}m/s`,
    cityCount: weatherStore.cityCount,
    representativeStatus,
  }
})

const introMajorWarnings = computed(() => {
  const titles = new Set()

  return [...officialWarningStore.warnings]
    .sort((first, second) => Number(second.level === 'warning') - Number(first.level === 'warning'))
    .filter((warning) => {
      if (titles.has(warning.title)) {
        return false
      }

      titles.add(warning.title)
      return true
    })
    .slice(0, 2)
})

const handleOfficialWarningRefresh = () => {
  officialWarningStore.fetchOfficialWarnings()
}

const closeIntro = () => {
  introDismissed.value = true
  sessionStorage.setItem('skala-weather-intro-seen', 'true')
}

const openTravelFromIntro = () => {
  closeIntro()
  router.push({ name: 'travel-coach' })
}

const openWarningsFromIntro = () => {
  closeIntro()
  router.push({ name: 'weather-warning' })
}

const reopenIntro = async () => {
  if (route.name !== 'weather-home') {
    await router.push({ name: 'weather-home' })
  }

  introDismissed.value = false
}

onMounted(() => {
  if (!officialWarningStore.lastUpdatedAt && !officialWarningStore.isLoading) {
    officialWarningStore.fetchOfficialWarnings()
  }
})
</script>

<template>
  <Transition name="intro-fade">
    <WeatherIntro
      v-if="showIntro"
      :weather-summary="introWeatherSummary"
      :is-weather-loading="weatherStore.isLoading"
      :weather-error="weatherStore.errorMessage"
      :warning-count="officialWarningStore.warnings.length"
      :major-warnings="introMajorWarnings"
      :is-warning-loading="officialWarningStore.isLoading"
      :warning-error="officialWarningStore.errorMessage"
      @enter-dashboard="closeIntro"
      @open-travel="openTravelFromIntro"
      @open-warnings="openWarningsFromIntro"
    />
  </Transition>

  <div class="app-container">
    <aside class="app-sidebar">
      <RouterLink to="/" class="brand-link" aria-label="날씨 대시보드 홈">
        <span class="brand-icon">
          <CloudSun :size="30" />
        </span>

        <span class="brand-copy">
          <span class="brand-eyebrow">SKALA WEATHER</span>
          <strong>생활·여행 날씨 코치</strong>
        </span>
      </RouterLink>

      <nav class="navigation-bar" aria-label="주요 메뉴">
        <span class="nav-caption">EXPLORE</span>

        <RouterLink to="/" class="nav-item">
          <LayoutDashboard :size="18" />
          <span>대시보드</span>
        </RouterLink>

        <RouterLink to="/travel" class="nav-item">
          <Compass :size="18" />
          <span>여행 코치</span>
        </RouterLink>

        <RouterLink to="/stats" class="nav-item">
          <ChartNoAxesCombined :size="18" />
          <span>날씨 통계</span>
        </RouterLink>

        <RouterLink to="/warnings" class="nav-item">
          <TriangleAlert :size="18" />
          <span>안전 센터</span>
        </RouterLink>

        <RouterLink to="/about" class="nav-item">
          <Info :size="18" />
          <span>서비스 소개</span>
        </RouterLink>
      </nav>

      <button type="button" class="sidebar-note" @click="reopenIntro">
        <Sparkles :size="14" />
        인트로 다시 보기
      </button>
    </aside>

    <div class="app-workspace">
      <header class="app-header">
        <div>
          <span class="workspace-eyebrow">LIVE WEATHER DESK</span>
          <strong>오늘 필요한 날씨만 빠르게 확인하세요.</strong>
        </div>
        <div class="header-actions">
          <UnitToggler />
          <span class="live-indicator"><i></i> LIVE</span>
        </div>
      </header>

      <div class="official-warning-area">
        <OfficialWeatherAlert
          :warnings="officialWarningStore.warnings"
          :issued-at="officialWarningStore.issuedAt"
          :is-loading="officialWarningStore.isLoading"
          :error-message="officialWarningStore.errorMessage"
          context-label="전국"
          compact
          summary-only
          @refresh="handleOfficialWarningRefresh"
        />
      </div>

      <main class="app-main">
        <RouterView />
      </main>

      <footer class="app-footer">
        <span>SKALA WEATHER</span>
        <span>Vue 3 · OpenWeather · 기상청 공식 특보</span>
      </footer>
    </div>
  </div>
</template>

<style>
@import '@/assets/exercise.css';

.intro-fade-enter-active,
.intro-fade-leave-active {
  transition: opacity 0.42s ease;
}

.intro-fade-enter-from,
.intro-fade-leave-to {
  opacity: 0;
}
</style>
