<script setup>
import { computed, onMounted } from 'vue'
import { ArrowLeft, CloudSun, Droplets, Gauge, MapPin, Sunrise, Sunset, Thermometer, Wind } from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'

import { useWeatherStore } from '@/stores/weatherStore'
import { useTemperature } from '@/composables/useTemperature'
import { formatNumber } from '@/utils/numberFormat'

const route = useRoute()
const router = useRouter()

const weatherStore = useWeatherStore()

// 온도를 현재 설정 단위로 변환
const { formatTemp } = useTemperature()

// URL의 cityId를 이용해서 Store에서 도시 찾기
const cityData = computed(() => weatherStore.getCityById(route.params.cityId))

const pollutants = computed(() => {
  if (!cityData.value?.airQuality) {
    return []
  }

  const air = cityData.value.airQuality

  return [
    { name: '초미세먼지', code: 'PM2.5', value: air.pm2_5 },
    { name: '미세먼지', code: 'PM10', value: air.pm10 },
    { name: '일산화탄소', code: 'CO', value: air.co },
    { name: '일산화질소', code: 'NO', value: air.no },
    { name: '이산화질소', code: 'NO₂', value: air.no2 },
    { name: '오존', code: 'O₃', value: air.o3 },
    { name: '이산화황', code: 'SO₂', value: air.so2 },
    { name: '암모니아', code: 'NH₃', value: air.nh3 },
  ]
})

const formatTime = (dateTime) => {
  if (!dateTime) {
    return '-'
  }

  return new Date(dateTime).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDayLength = (seconds) => {
  if (!Number.isFinite(seconds)) {
    return '-'
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  return `${hours}시간 ${minutes}분`
}

const getAqiTagType = (aqi) => {
  if (aqi <= 2) {
    return 'success'
  }

  if (aqi === 3) {
    return 'warning'
  }

  return 'danger'
}

// 메인으로 이동
const handleGoHome = () => {
  router.push('/')
}

onMounted(() => {
  if (weatherStore.weatherList.length === 0 && !weatherStore.isLoading) {
    weatherStore.fetchWeatherList()
  }
})
</script>

<template>
  <div class="detail-container">
    <section class="page-heading">
      <div>
        <p class="page-eyebrow">CITY DETAIL</p>
        <h1>지역별 상세 기상 관측</h1>
        <p>날씨와 대기질, 일출·일몰 정보를 함께 확인합니다.</p>
      </div>

      <el-button plain round @click="handleGoHome">
        <ArrowLeft :size="16" />
        대시보드
      </el-button>
    </section>

    <section v-if="weatherStore.isLoading" class="surface-card">
      <el-skeleton :rows="9" animated />
    </section>

    <section v-else-if="weatherStore.errorMessage" class="surface-card">
      <el-alert :title="weatherStore.errorMessage" type="error" show-icon :closable="false" />
    </section>

    <template v-else-if="cityData">
      <section class="detail-hero">
        <div class="city-identity">
          <span class="hero-icon">
            <CloudSun :size="34" />
          </span>

          <div>
            <span class="location-line">
              <MapPin :size="15" />
              {{ cityData.fullName }}
            </span>
            <h2>{{ cityData.name }}</h2>
            <p>{{ cityData.status }}</p>
          </div>
        </div>

        <div class="hero-temperature">
          <strong>{{ formatTemp(cityData.temp) }}</strong>
          <span>체감 {{ formatTemp(cityData.feelsLike) }}</span>
        </div>
      </section>

      <section class="surface-card">
        <div class="section-heading">
          <div>
            <span class="section-kicker">CURRENT CONDITIONS</span>
            <h2>현재 관측 정보</h2>
          </div>
        </div>

        <div class="condition-grid">
          <div class="condition-item">
            <Thermometer :size="22" />
            <span>체감온도</span>
            <strong>{{ formatTemp(cityData.feelsLike) }}</strong>
          </div>
          <div class="condition-item">
            <Droplets :size="22" />
            <span>대기 습도</span>
            <strong>{{ formatNumber(cityData.humidity, 0) }}%</strong>
          </div>
          <div class="condition-item">
            <Wind :size="22" />
            <span>현재 풍속</span>
            <strong>{{ formatNumber(cityData.wind, 1) }}m/s</strong>
          </div>
          <div v-if="cityData.airQuality" class="condition-item">
            <Gauge :size="22" />
            <span>대기질</span>
            <el-tag :type="getAqiTagType(cityData.airQuality.aqi)" effect="light" round> {{ cityData.airQuality.label }} · OpenWeather {{ formatNumber(cityData.airQuality.aqi, 0) }}/5 </el-tag>
          </div>
        </div>
      </section>

      <section v-if="cityData.airQuality" class="surface-card">
        <div class="section-heading">
          <div>
            <span class="section-kicker">AIR QUALITY</span>
            <h2>대기질 상세 정보</h2>
          </div>

          <el-tag :type="getAqiTagType(cityData.airQuality.aqi)" effect="dark" round>{{ cityData.airQuality.label }}</el-tag>
        </div>

        <div class="pollutant-grid">
          <div v-for="item in pollutants" :key="item.code" class="pollutant-item">
            <span>{{ item.name }}</span>
            <strong>{{ item.code }}</strong>
            <p>{{ formatNumber(item.value, 2) }} <small>μg/m³</small></p>
          </div>
        </div>
      </section>

      <section v-if="cityData.sunInfo" class="surface-card">
        <div class="section-heading">
          <div>
            <span class="section-kicker">SUN SCHEDULE</span>
            <h2>일출 · 일몰 정보</h2>
          </div>
        </div>

        <div class="sun-grid">
          <div class="sun-item sunrise-card">
            <Sunrise :size="26" />
            <span>일출</span>
            <strong>{{ formatTime(cityData.sunInfo.sunrise) }}</strong>
          </div>
          <div class="sun-item sunset-card">
            <Sunset :size="26" />
            <span>일몰</span>
            <strong>{{ formatTime(cityData.sunInfo.sunset) }}</strong>
          </div>
          <div class="sun-item daylight-card">
            <CloudSun :size="26" />
            <span>낮 길이</span>
            <strong>{{ formatDayLength(cityData.sunInfo.dayLength) }}</strong>
          </div>
        </div>
      </section>

      <el-alert
        v-if="cityData.feelsLike >= weatherStore.feelsLikeThreshold"
        :title="`현재 체감온도가 사용자가 설정한 앱 주의 기준 ${formatTemp(weatherStore.feelsLikeThreshold)} 이상입니다.`"
        type="warning"
        show-icon
        :closable="false"
      />
    </template>

    <section v-else class="surface-card">
      <el-empty description="해당 지역의 상세 데이터가 존재하지 않습니다.">
        <el-button type="primary" @click="handleGoHome">대시보드로 이동</el-button>
      </el-empty>
    </section>
  </div>
</template>

<style scoped>
.detail-container {
  display: grid;
  gap: 18px;
}

.page-heading,
.section-heading,
.detail-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.page-heading {
  align-items: flex-start;
  margin-bottom: 6px;
}

.page-heading h1 {
  margin: 2px 0 6px;
  color: var(--weather-navy);
  font-size: clamp(1.7rem, 4vw, 2.3rem);
  letter-spacing: -0.04em;
}

.page-heading p:not(.page-eyebrow) {
  color: var(--weather-muted);
}

.page-heading .el-button {
  gap: 6px;
}

.page-eyebrow,
.section-kicker {
  color: var(--weather-primary);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.surface-card,
.detail-hero {
  padding: 24px;
  background: var(--weather-surface);
  border: 1px solid var(--weather-border);
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(51, 65, 85, 0.06);
}

.detail-hero {
  color: #ffffff;
  background: linear-gradient(135deg, #1d4ed8, #0891b2);
  border: 0;
  box-shadow: 0 18px 38px rgba(37, 99, 235, 0.22);
}

.city-identity {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hero-icon {
  display: grid;
  width: 60px;
  height: 60px;
  color: #fef3c7;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 18px;
  place-items: center;
}

.location-line {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #dbeafe;
  font-size: 0.8rem;
}

.city-identity h2 {
  margin: 1px 0;
  font-size: 1.65rem;
}

.city-identity p {
  color: #e0f2fe;
}

.hero-temperature {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
}

.hero-temperature strong {
  font-size: clamp(2.4rem, 7vw, 3.5rem);
  line-height: 1;
  letter-spacing: -0.06em;
}

.hero-temperature span {
  margin-top: 6px;
  color: #dbeafe;
}

.section-heading {
  margin-bottom: 17px;
}

.section-heading h2 {
  margin-top: 2px;
  color: var(--weather-navy);
  font-size: 1.25rem;
}

.condition-grid,
.pollutant-grid,
.sun-grid {
  display: grid;
  gap: 12px;
}

.condition-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.condition-item {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 5px;
  padding: 18px 10px;
  color: var(--weather-primary);
  background: #f8fafc;
  border-radius: 13px;
  text-align: center;
}

.condition-item span {
  color: var(--weather-muted);
  font-size: 0.78rem;
}

.condition-item strong {
  color: var(--weather-navy);
}

.pollutant-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.pollutant-item {
  padding: 15px;
  background: #f8fafc;
  border: 1px solid #edf2f7;
  border-radius: 12px;
}

.pollutant-item span {
  display: block;
  color: var(--weather-muted);
  font-size: 0.72rem;
}

.pollutant-item strong {
  color: var(--weather-navy);
}

.pollutant-item p {
  margin-top: 7px;
  color: var(--weather-primary);
  font-size: 1rem;
  font-weight: 800;
}

.pollutant-item small {
  color: var(--weather-muted);
  font-size: 0.66rem;
  font-weight: 500;
}

.sun-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.sun-item {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 5px;
  padding: 19px;
  border-radius: 14px;
}

.sun-item span {
  font-size: 0.76rem;
}

.sunrise-card {
  color: #c2410c;
  background: #fff7ed;
}

.sunset-card {
  color: #7c3aed;
  background: #f5f3ff;
}

.daylight-card {
  color: #0369a1;
  background: #f0f9ff;
}

@media (max-width: 800px) {
  .condition-grid,
  .pollutant-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 580px) {
  .page-heading,
  .detail-hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .hero-temperature {
    align-items: flex-start;
  }

  .sun-grid {
    grid-template-columns: 1fr;
  }
}
</style>
