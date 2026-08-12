<script setup>
import { useRouter } from 'vue-router'
import { useWeatherStore } from '@/stores/weatherStore'
import { useTemperature } from '@/composables/useTemperature'

const router = useRouter()
const weatherStore = useWeatherStore()

// 온도를 현재 설정 단위로 변환
const { formatTemp } = useTemperature()

// 상세페이지 이동
const goToDetail = (city) => {
  router.push('/weather/' + city.id)
}

// 메인 이동
const handleGoHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="stats-container">
    <h3>📊 날씨 통계</h3>
    <hr />

    <!-- 전체 날씨 통계 -->
    <div class="summary-box">
      <p>
        🏙️ 관측 도시:
        <strong>{{ weatherStore.cityCount }}개</strong>
      </p>

      <p>
        🌡️ 평균 기온:
        <strong>{{ formatTemp(weatherStore.averageTemp) }}</strong>
      </p>

      <p>
        💧 평균 습도:
        <strong>{{ weatherStore.averageHumidity }}%</strong>
      </p>

      <p>
        💨 평균 풍속:
        <strong>{{ weatherStore.averageWind }}m/s</strong>
      </p>
    </div>

    <!-- 최고 기온 도시 -->
    <div class="city-stat">
      <h4>🔥 최고 기온 도시</h4>

      <p>
        {{ weatherStore.hottestCity.name }}
        {{ formatTemp(weatherStore.hottestCity.temp) }}
      </p>

      <button @click="goToDetail(weatherStore.hottestCity)">상세보기</button>
    </div>

    <!-- 최저 기온 도시 -->
    <div class="city-stat">
      <h4>❄️ 최저 기온 도시</h4>

      <p>
        {{ weatherStore.coldestCity.name }}
        {{ formatTemp(weatherStore.coldestCity.temp) }}
      </p>

      <button @click="goToDetail(weatherStore.coldestCity)">상세보기</button>
    </div>

    <!-- 최고 체감온도 도시 -->
    <div class="city-stat">
      <h4>🌡️ 최고 체감온도 도시</h4>

      <p>
        {{ weatherStore.hottestFeelsLikeCity.name }}
        {{ formatTemp(weatherStore.hottestFeelsLikeCity.feelsLike) }}
      </p>

      <button @click="goToDetail(weatherStore.hottestFeelsLikeCity)">상세보기</button>
    </div>

    <button class="home-btn" @click="handleGoHome">← 메인 대시보드로 돌아가기</button>
  </div>
</template>

<style scoped>
.stats-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.summary-box {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.city-stat {
  background: #f1f2f6;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 10px;
}

.city-stat h4 {
  margin-top: 0;
}

.city-stat button {
  cursor: pointer;
}

.home-btn {
  width: 100%;
  margin-top: 15px;
  padding: 10px;
  cursor: pointer;
}
</style>
