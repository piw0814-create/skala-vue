<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useWeatherStore } from '@/stores/weatherStore'
import { useTemperature } from '@/composables/useTemperature'

const route = useRoute()
const router = useRouter()

const weatherStore = useWeatherStore()

// 온도를 현재 설정 단위로 변환
const { formatTemp } = useTemperature()

// 현재 상세페이지에서 보여줄 도시
const cityData = ref(null)

// URL의 cityId를 이용해서 Store에서 도시 찾기
onMounted(() => {
  const id = route.params.cityId

  cityData.value = weatherStore.getCityById(id)
})

// 메인으로 이동
const handleGoHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="detail-container">
    <h3>📊 지역별 상세 기상 관측 정보</h3>
    <hr />

    <div v-if="cityData" class="info-card">
      <h4>
        📍 지정 지역:
        {{ cityData.fullName }}
      </h4>

      <p>
        실시간 기온:
        <strong>
          {{ formatTemp(cityData.temp) }}
        </strong>
      </p>

      <p>
        🌡️ 체감온도:
        <strong>
          {{ formatTemp(cityData.feelsLike) }}
        </strong>
      </p>

      <p>
        기상 현황:
        {{ cityData.status }}
      </p>

      <p>
        대기 습도:
        {{ cityData.humidity }}%
      </p>

      <p>
        현재 풍속:
        {{ cityData.wind }}m/s
      </p>

      <p v-if="cityData.feelsLike >= weatherStore.feelsLikeThreshold" class="heat-warning">
        🚨 현재 체감온도가 경고 기준
        {{ formatTemp(weatherStore.feelsLikeThreshold) }}
        이상입니다.
      </p>
    </div>

    <div v-else>
      <p>해당 지역의 상세 데이터가 존재하지 않습니다.</p>
    </div>

    <button @click="handleGoHome" class="back-btn">← 메인 대시보드로 돌아가기</button>
  </div>
</template>

<style scoped>
.detail-container {
  margin: 0 auto;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.info-card {
  background: #f1f2f6;
  padding: 15px;
  border-radius: 6px;
  margin: 15px 0;
}

.heat-warning {
  margin-top: 12px;
  padding: 10px;
  background: #fff3cd;
  border-radius: 6px;
  font-weight: bold;
}

.back-btn {
  padding: 8px 12px;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
