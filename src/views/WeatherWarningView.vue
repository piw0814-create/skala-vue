<script setup>
import { computed, onMounted, ref } from 'vue'
import { ArrowLeft, Building2, Droplets, RefreshCw, ShieldCheck, Siren, Thermometer, TriangleAlert, Wind } from '@lucide/vue'
import { useRouter } from 'vue-router'

import OfficialWeatherAlert from '@/components/OfficialWeatherAlert.vue'
import SafetyActionGuide from '@/components/warnings/SafetyActionGuide.vue'
import { useTemperature } from '@/composables/useTemperature'
import { cityConfigs } from '@/data/cityConfigs'
import { getSafetyGuide } from '@/data/safetyGuides'
import { useOfficialWarningStore } from '@/stores/officialWarningStore'
import { useWeatherStore } from '@/stores/weatherStore'
import { formatNumber } from '@/utils/numberFormat'

const router = useRouter()
const weatherStore = useWeatherStore()
const officialWarningStore = useOfficialWarningStore()

const { formatTemp } = useTemperature()

const selectedHazard = ref('all')
const selectedCityId = ref('all')

const hazardOptions = computed(() => {
  return [...new Set(officialWarningStore.warnings.map((warning) => warning.hazard))].sort((first, second) => first.localeCompare(second, 'ko'))
})

const filteredOfficialWarnings = computed(() => {
  const cityWarnings = selectedCityId.value === 'all' ? officialWarningStore.warnings : officialWarningStore.getWarningsForCity(selectedCityId.value)

  if (selectedHazard.value === 'all') {
    return cityWarnings
  }

  return cityWarnings.filter((warning) => warning.hazard === selectedHazard.value)
})

const filterContextLabel = computed(() => {
  const cityName = cityConfigs.find((city) => city.id === selectedCityId.value)?.name ?? '전국'
  const hazardName = selectedHazard.value === 'all' ? '' : ` · ${selectedHazard.value}`

  return `${cityName}${hazardName}`
})

const displayedSafetyGuides = computed(() => {
  const guideMap = new Map()

  filteredOfficialWarnings.value.forEach((warning) => {
    const guide = getSafetyGuide(warning.hazard)
    guideMap.set(guide.id, guide)
  })

  return [...guideMap.values()]
})

const officialDangerCount = computed(() => {
  return officialWarningStore.warnings.filter((warning) => warning.level === 'warning').length
})

const affectedCityCount = computed(() => {
  return cityConfigs.filter((city) => officialWarningStore.getWarningsForCity(city.id).length > 0).length
})

const lastUpdatedText = computed(() => {
  if (!officialWarningStore.lastUpdatedAt) {
    return '아직 조회되지 않음'
  }

  return new Date(officialWarningStore.lastUpdatedAt).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
})

const isRefreshing = computed(() => weatherStore.isLoading || officialWarningStore.isLoading)

const goToDetail = (city) => {
  router.push('/weather/' + city.id)
}

const handleGoHome = () => {
  router.push('/')
}

const handleOfficialRefresh = () => {
  officialWarningStore.fetchOfficialWarnings()
}

const handleRefreshAll = async () => {
  await Promise.all([weatherStore.fetchWeatherList(), officialWarningStore.fetchOfficialWarnings()])
}

const resetFilters = () => {
  selectedHazard.value = 'all'
  selectedCityId.value = 'all'
}

onMounted(async () => {
  const initialRequests = []

  if (weatherStore.weatherList.length === 0 && !weatherStore.isLoading) {
    initialRequests.push(weatherStore.fetchWeatherList())
  }

  if (!officialWarningStore.lastUpdatedAt && !officialWarningStore.isLoading) {
    initialRequests.push(officialWarningStore.fetchOfficialWarnings())
  }

  if (initialRequests.length > 0) {
    await Promise.all(initialRequests)
  }
})
</script>

<template>
  <div class="warning-container">
    <section class="page-heading">
      <div>
        <p class="page-eyebrow">WEATHER SAFETY CENTER</p>
        <h1>날씨 안전 센터</h1>
        <p>기상청 공식 특보와 사용자 설정값에 따른 체감온도 주의 정보를 구분해 확인하세요.</p>
      </div>

      <div class="heading-actions">
        <el-button type="primary" round :loading="isRefreshing" @click="handleRefreshAll">
          <RefreshCw v-if="!isRefreshing" :size="16" />
          전체 새로고침
        </el-button>
        <el-button plain round @click="handleGoHome">
          <ArrowLeft :size="16" />
          대시보드
        </el-button>
      </div>
    </section>

    <section class="safety-summary-grid" aria-label="날씨 안전 정보 요약">
      <article class="summary-card official-summary">
        <span><Siren :size="20" /></span>
        <div>
          <small>기상청 공식 특보</small>
          <strong>{{ officialWarningStore.warningCount }}건</strong>
        </div>
      </article>

      <article class="summary-card danger-summary">
        <span><TriangleAlert :size="20" /></span>
        <div>
          <small>경보 수준</small>
          <strong>{{ officialDangerCount }}건</strong>
        </div>
      </article>

      <article class="summary-card city-summary">
        <span><Building2 :size="20" /></span>
        <div>
          <small>관측 도시 중 특보 지역</small>
          <strong>{{ affectedCityCount }}곳</strong>
        </div>
      </article>

      <article class="summary-card app-summary">
        <span><Thermometer :size="20" /></span>
        <div>
          <small>앱 기준 체감온도 주의</small>
          <strong>{{ weatherStore.warningCities.length }}곳</strong>
        </div>
      </article>
    </section>

    <section class="surface-card official-section">
      <div class="section-heading">
        <div>
          <span class="section-kicker official-kicker">KMA OFFICIAL WARNING</span>
          <h2>기상청 공식 특보</h2>
          <p>기상청의 현재 발표·발효 현황을 지역과 위험 유형별로 확인합니다.</p>
        </div>

        <div class="official-meta">
          <el-tag type="danger" effect="dark" round>공식 정보</el-tag>
          <span>마지막 조회 {{ lastUpdatedText }}</span>
        </div>
      </div>

      <div class="warning-filters">
        <label>
          <span>지역</span>
          <el-select v-model="selectedCityId" aria-label="특보 지역 선택">
            <el-option label="전국" value="all" />
            <el-option v-for="city in cityConfigs" :key="city.id" :label="city.name" :value="city.id" />
          </el-select>
        </label>

        <label>
          <span>위험 유형</span>
          <el-select v-model="selectedHazard" aria-label="특보 위험 유형 선택">
            <el-option label="전체 유형" value="all" />
            <el-option v-for="hazard in hazardOptions" :key="hazard" :label="hazard" :value="hazard" />
          </el-select>
        </label>

        <el-button plain round @click="resetFilters">필터 초기화</el-button>
      </div>

      <OfficialWeatherAlert
        :warnings="filteredOfficialWarnings"
        :issued-at="officialWarningStore.issuedAt"
        :is-loading="officialWarningStore.isLoading"
        :error-message="officialWarningStore.errorMessage"
        :context-label="filterContextLabel"
        compact
        @refresh="handleOfficialRefresh"
      />

      <div v-if="displayedSafetyGuides.length > 0" class="safety-guide-area">
        <div class="subsection-heading">
          <div>
            <span>OFFICIAL SAFETY GUIDE</span>
            <h3>지금 확인할 행동 요령</h3>
          </div>
          <el-tag effect="plain" round>{{ displayedSafetyGuides.length }}개 위험 유형</el-tag>
        </div>

        <div class="safety-guide-grid">
          <SafetyActionGuide v-for="guide in displayedSafetyGuides" :key="guide.id" :guide="guide" />
        </div>
      </div>

      <p class="official-source-note">
        특보 내용과 발표 기준은
        <a href="https://www.weather.go.kr/w/special-report/overall.do" target="_blank" rel="noopener noreferrer">기상청 날씨누리</a>를, 실제 대피와 현장 통제는 재난문자 및 관계기관 안내를 우선하세요.
      </p>
    </section>

    <section class="surface-card app-analysis-section">
      <div class="section-heading">
        <div>
          <span class="section-kicker">APP THRESHOLD ANALYSIS</span>
          <h2>앱 기준 체감온도 주의</h2>
          <p>사용자가 설정한 기준과 현재 관측값을 비교해 보여주는 앱 참고 정보입니다.</p>
        </div>

        <el-tag type="warning" effect="plain" round>공식 특보 아님</el-tag>
      </div>

      <section v-if="weatherStore.isLoading" class="threshold-state">
        <el-skeleton :rows="6" animated />
      </section>

      <section v-else-if="weatherStore.errorMessage" class="threshold-state error-state">
        <el-alert :title="weatherStore.errorMessage" type="error" show-icon :closable="false" />
        <el-button type="danger" plain round @click="weatherStore.fetchWeatherList()">현재 날씨 다시 조회</el-button>
      </section>

      <template v-else>
        <el-alert
          :title="`사용자가 설정한 앱 주의 기준은 체감온도 ${formatTemp(weatherStore.feelsLikeThreshold)} 이상입니다.`"
          :type="weatherStore.warningCities.length > 0 ? 'warning' : 'success'"
          show-icon
          :closable="false"
        />

        <div v-if="weatherStore.warningCities.length > 0" class="warning-grid">
          <article v-for="city in weatherStore.warningCities" :key="city.id" class="warning-card">
            <div class="warning-card-header">
              <span class="warning-icon"><TriangleAlert :size="21" /></span>
              <div>
                <p>앱 기준 체감온도 주의</p>
                <h3>{{ city.name }}</h3>
              </div>
              <el-tag type="danger" effect="light" round>{{ formatTemp(city.feelsLike) }}</el-tag>
            </div>

            <div class="warning-metrics">
              <div>
                <Thermometer :size="18" />
                <span>실제 기온</span>
                <strong>{{ formatTemp(city.temp) }}</strong>
              </div>
              <div>
                <Droplets :size="18" />
                <span>습도</span>
                <strong>{{ formatNumber(city.humidity, 0) }}%</strong>
              </div>
              <div>
                <Wind :size="18" />
                <span>풍속</span>
                <strong>{{ formatNumber(city.wind, 1) }}m/s</strong>
              </div>
            </div>

            <el-button type="danger" plain round @click="goToDetail(city)">도시 상세보기</el-button>
          </article>
        </div>

        <div v-else class="safe-state">
          <span class="safe-icon"><ShieldCheck :size="34" /></span>
          <div>
            <h3>현재 앱 기준 주의 대상 도시가 없습니다</h3>
            <p>관측 도시의 체감온도가 사용자가 설정한 기준보다 낮습니다.</p>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<style scoped>
.warning-container {
  display: grid;
  gap: 18px;
}

.page-heading,
.section-heading,
.warning-card-header,
.subsection-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.page-heading {
  margin-bottom: 6px;
}

.page-heading h1 {
  margin: 2px 0 6px;
  color: var(--weather-navy);
  font-size: clamp(1.7rem, 4vw, 2.3rem);
  letter-spacing: -0.04em;
}

.page-heading p:not(.page-eyebrow),
.section-heading p {
  color: var(--weather-muted);
}

.heading-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.heading-actions .el-button,
.warning-card > .el-button,
.error-state .el-button {
  gap: 6px;
}

.page-eyebrow,
.section-kicker,
.subsection-heading span {
  color: var(--weather-primary);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.official-kicker {
  color: #dc2626;
}

.surface-card {
  padding: 24px;
  background: var(--weather-surface);
  border: 1px solid var(--weather-border);
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(51, 65, 85, 0.06);
}

.safety-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid var(--weather-border);
  border-radius: 14px;
}

.summary-card > span {
  display: grid;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  color: #ffffff;
  background: var(--weather-primary);
  border-radius: 11px;
  place-items: center;
}

.official-summary > span,
.danger-summary > span {
  background: #dc2626;
}

.city-summary > span {
  background: #0f766e;
}

.app-summary > span {
  background: #d97706;
}

.summary-card div {
  display: flex;
  flex-direction: column;
}

.summary-card small {
  color: var(--weather-muted);
  font-size: 0.68rem;
}

.summary-card strong {
  color: var(--weather-navy);
  font-size: 1.18rem;
}

.section-heading {
  align-items: flex-end;
  margin-bottom: 18px;
}

.section-heading h2 {
  margin: 2px 0;
  color: var(--weather-navy);
  font-size: 1.25rem;
}

.official-meta {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  gap: 6px;
  color: var(--weather-muted);
  font-size: 0.72rem;
}

.warning-filters {
  display: grid;
  grid-template-columns: minmax(160px, 1fr) minmax(160px, 1fr) auto;
  align-items: end;
  gap: 12px;
  margin-bottom: 15px;
  padding: 15px;
  background: var(--weather-surface-soft);
  border-radius: 14px;
}

.warning-filters label {
  display: grid;
  gap: 6px;
}

.warning-filters label > span {
  color: var(--weather-navy);
  font-size: 0.75rem;
  font-weight: 800;
}

.warning-filters .el-select {
  width: 100%;
}

.safety-guide-area {
  margin-top: 20px;
  padding-top: 19px;
  border-top: 1px solid var(--weather-border);
}

.subsection-heading {
  align-items: flex-end;
  margin-bottom: 13px;
}

.subsection-heading h3 {
  margin-top: 2px;
  color: var(--weather-navy);
  font-size: 1.05rem;
}

.safety-guide-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.official-source-note {
  margin-top: 16px;
  color: var(--weather-muted);
  font-size: 0.74rem;
  line-height: 1.6;
}

.official-source-note a {
  color: var(--weather-primary);
  font-weight: 800;
}

.threshold-state {
  padding: 6px 0;
}

.error-state {
  display: grid;
  gap: 12px;
}

.error-state .el-button {
  justify-self: start;
}

.warning-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 15px;
}

.warning-card {
  display: flex;
  align-items: stretch;
  flex-direction: column;
  padding: 19px;
  background: linear-gradient(145deg, #ffffff, #fff7f7);
  border: 1px solid #fecaca;
  border-radius: 15px;
}

.warning-card-header {
  align-items: center;
  justify-content: flex-start;
}

.warning-card-header > .el-tag {
  margin-left: auto;
}

.warning-icon {
  display: grid;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  color: #ffffff;
  background: linear-gradient(135deg, #f97316, #dc2626);
  border-radius: 12px;
  place-items: center;
}

.warning-card-header p {
  color: var(--weather-danger);
  font-size: 0.72rem;
  font-weight: 700;
}

.warning-card-header h3 {
  color: var(--weather-navy);
  font-size: 1.15rem;
}

.warning-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 7px;
  margin: 17px 0;
}

.warning-metrics > div {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 2px;
  padding: 10px 4px;
  color: var(--weather-danger);
  background: #ffffff;
  border-radius: 10px;
  text-align: center;
}

.warning-metrics span {
  color: var(--weather-muted);
  font-size: 0.68rem;
}

.warning-metrics strong {
  color: var(--weather-navy);
  font-size: 0.78rem;
}

.warning-card > .el-button {
  margin-top: auto;
}

.safe-state {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-top: 15px;
  padding: 18px;
  color: #166534;
  background: #ecfdf5;
  border: 1px solid #bbf7d0;
  border-radius: 14px;
}

.safe-icon {
  display: grid;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  background: #dcfce7;
  border-radius: 15px;
  place-items: center;
}

.safe-state h3 {
  color: #14532d;
}

.safe-state p {
  margin-top: 2px;
  color: #166534;
  font-size: 0.8rem;
}

@media (max-width: 900px) {
  .safety-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .warning-grid,
  .safety-guide-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .page-heading,
  .section-heading,
  .subsection-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .heading-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .warning-filters,
  .safety-summary-grid {
    grid-template-columns: 1fr;
  }

  .official-meta {
    align-items: flex-start;
  }
}
</style>
