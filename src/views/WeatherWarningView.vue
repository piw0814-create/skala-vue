<script setup>
import { useRouter } from 'vue-router'
import { useWeatherStore } from '@/stores/weatherStore'
import { useTemperature } from '@/composables/useTemperature'

const router = useRouter()
const weatherStore = useWeatherStore()

// 온도를 현재 설정 단위로 변환
const { formatTemp } = useTemperature()

// 도시 상세페이지 이동
const goToDetail = (city) => {
  router.push('/weather/' + city.id)
}

// 메인 대시보드로 이동
const handleGoHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="warning-container">
    <h3>🚨 체감온도 경고 현황</h3>
    <hr />

    <!-- 현재 경고 기준 -->
    <div class="threshold-info">
      현재 경고 기준:
      <strong> {{ formatTemp(weatherStore.feelsLikeThreshold) }} 이상 </strong>
    </div>

    <!-- 경고 도시 없음 -->
    <div v-if="weatherStore.warningCities.length === 0" class="no-warning">현재 체감온도 경고 대상 도시가 없습니다.</div>

    <!-- 경고 도시 목록 -->
    <div v-else>
      <p>
        현재 경고 도시:
        <strong> {{ weatherStore.warningCities.length }}개 </strong>
      </p>

      <div v-for="city in weatherStore.warningCities" :key="city.id" class="warning-card">
        <h4>🚨 {{ city.name }}</h4>

        <p>
          실제 기온:
          <strong>
            {{ formatTemp(city.temp) }}
          </strong>
        </p>

        <p>
          체감온도:
          <strong>
            {{ formatTemp(city.feelsLike) }}
          </strong>
        </p>

        <p>
          습도:
          {{ city.humidity }}%
        </p>

        <p>
          풍속:
          {{ city.wind }}m/s
        </p>

        <button @click="goToDetail(city)" class="detail-btn">상세보기</button>
      </div>
    </div>

    <button @click="handleGoHome" class="home-btn">← 메인 대시보드로 돌아가기</button>
  </div>
</template>

<style scoped>
.warning-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.threshold-info {
  background: #fff3cd;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.warning-card {
  background: #fff5f5;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 12px;
}

.warning-card h4 {
  margin-top: 0;
}

.no-warning {
  background: #f1f2f6;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.detail-btn {
  padding: 6px 10px;
  cursor: pointer;
}

.home-btn {
  width: 100%;
  margin-top: 15px;
  padding: 10px;
  cursor: pointer;
}
</style>
