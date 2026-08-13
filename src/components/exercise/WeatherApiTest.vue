<script setup>
import { computed, ref } from 'vue'
import axios from 'axios'

import { OPENWEATHER_API_KEY } from '@/config/env'
import { getOpenWeatherStatus } from '@/utils/weatherCondition'

const weatherData = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

const weatherStatus = computed(() => {
  if (!weatherData.value) return ''

  return getOpenWeatherStatus({
    code: weatherData.value.weather[0].id,
    cloudiness: weatherData.value.clouds?.all,
    fallback: weatherData.value.weather[0].description,
  })
})

const handleFetchWeather = async () => {
  isLoading.value = true
  errorMessage.value = ''

  const API_KEY = OPENWEATHER_API_KEY

  if (!API_KEY) {
    isLoading.value = false
    errorMessage.value = 'VITE_OPENWEATHER_API_KEY 환경 변수를 설정해 주세요.'
    return
  }

  const URL = 'https://api.openweathermap.org/data/2.5/weather'

  try {
    const response = await axios.get(URL, {
      params: {
        lat: 37.5665,
        lon: 126.978,
        appid: API_KEY,
        units: 'metric',
        lang: 'kr',
      },
    })

    console.log('Axios 전체 응답:', response)
    console.log('날씨 JSON:', response.data)

    weatherData.value = response.data
  } catch (error) {
    console.error('날씨 API 호출 실패:', error)

    errorMessage.value = '날씨 데이터를 가져오지 못했습니다.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="practice-section">
    <h2>🌦️ OpenWeather API 테스트</h2>

    <button @click="handleFetchWeather" :disabled="isLoading">
      {{ isLoading ? '데이터 로딩 중...' : '서울 실시간 날씨 가져오기' }}
    </button>

    <p v-if="errorMessage">
      {{ errorMessage }}
    </p>

    <div v-if="weatherData">
      <p>
        📍 위치:
        <strong>{{ weatherData.name }}</strong>
      </p>

      <p>
        🌡️ 현재 기온:
        <strong>{{ weatherData.main.temp }}℃</strong>
      </p>

      <p>
        ☁️ 날씨:
        <strong>
          {{ weatherStatus }}
        </strong>
      </p>

      <p>
        💧 습도:
        <strong>{{ weatherData.main.humidity }}%</strong>
      </p>

      <p>
        💨 풍속:
        <strong>{{ weatherData.wind.speed }}m/s</strong>
      </p>
    </div>
  </div>
</template>
