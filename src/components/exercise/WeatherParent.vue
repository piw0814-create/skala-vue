<script setup>
import { ref, computed, watch, watchEffect } from 'vue'

import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'
import FeelsLikeThreshold from './FeelsLikeThreshold.vue'
import HottestCity from './HottestCity.vue'
import HeatWarningList from './HeatWarningList.vue'

const weatherList = ref([
  {
    id: 'city_01',
    name: '서울',
    temp: 28,
    status: '맑음',
    humidity: 60,
    wind: 2.5,
  },
  {
    id: 'city_02',
    name: '수원',
    temp: 24,
    status: '비',
    humidity: 80,
    wind: 3.2,
  },
  {
    id: 'city_03',
    name: '부산',
    temp: 26,
    status: '구름',
    humidity: 70,
    wind: 4.1,
  },
])

const searchQuery = ref('')

const selectedCityId = ref('')
const selectedCityInfo = ref('카드를 클릭해 보세요.')

const detailCityId = ref('')

const feelsLikeThreshold = ref(30)

// 체감온도 계산
const calculateFeelsLike = (temp, humidity, wind) => {
  const vaporPressure = (humidity / 100) * 6.105 * Math.exp((17.27 * temp) / (237.7 + temp))

  const feelsLike = temp + 0.33 * vaporPressure - 0.7 * wind - 4

  return Number(feelsLike.toFixed(1))
}

// 원본 weatherList에 feelsLike 추가
const weatherWithFeelsLike = computed(() => {
  const newWeatherList = weatherList.value.map((city) => ({
    ...city,
    feelsLike: calculateFeelsLike(city.temp, city.humidity, city.wind),
  }))

  return newWeatherList
})

// 검색 결과
const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()

  const filteredList = weatherWithFeelsLike.value.filter((city) => city.name.includes(query))

  return filteredList
})

// 가장 체감온도가 높은 도시
const hottestFeelsLikeCity = computed(() => {
  const hottestCity = weatherWithFeelsLike.value.reduce((hottest, city) => (city.feelsLike > hottest.feelsLike ? city : hottest))

  return hottestCity
})

// 체감온도가 경고 기준 이상인 도시 목록
const warningCities = computed(() => {
  const warningList = weatherWithFeelsLike.value.filter((city) => city.feelsLike >= feelsLikeThreshold.value)

  return warningList
})

// SearchBar에서 emit된 값 처리
const updateQuery = (value) => {
  searchQuery.value = value.trim()
}

// FeelsLikeThreshold에서 emit된 값 처리
const updateThreshold = (value) => {
  feelsLikeThreshold.value = value
}

// WeatherCard 선택
const selectCity = (city) => {
  selectedCityId.value = city.id
  selectedCityInfo.value = `${city.name}이 선택되었습니다.`
}

// 상세보기
const toggleDetail = (city) => {
  alert(`${city.name}의 현재 날씨는 [${city.status}] 상태입니다.`)

  if (detailCityId.value === city.id) {
    detailCityId.value = ''
  } else {
    detailCityId.value = city.id
  }
}

watch(selectedCityInfo, (newValue, oldValue) => {
  console.log(`[watch 감지] 상태 바 문구가 업데이트되었습니다: "${oldValue}" → "${newValue}"`)
})

watchEffect(() => {
  console.log(`[watchEffect 자동 호출] 현재 검색어: "${searchQuery.value}" / 매칭 도시 수: ${filteredWeatherList.value.length}`)
})

watch(feelsLikeThreshold, (newValue, oldValue) => {
  console.log(`⚠️ 체감온도 경고 기준이 ${oldValue}℃에서 ${newValue}℃로 변경되었습니다.`)
})
</script>

<template>
  <div class="dashboard-wrapper">
    <!-- 검색 -->
    <BaseDashboardCard>
      <SearchBar :current-query="searchQuery" @update-query="updateQuery" />
    </BaseDashboardCard>

    <!-- 체감온도 경고 기준 -->
    <BaseDashboardCard>
      <FeelsLikeThreshold :threshold="feelsLikeThreshold" @update-threshold="updateThreshold" />
    </BaseDashboardCard>

    <!-- 날씨 목록 -->
    <BaseDashboardCard>
      <HottestCity :city="hottestFeelsLikeCity" />

      <HeatWarningList :cities="warningCities" :threshold="feelsLikeThreshold">
        <template #default="{ city }"> 🚨 {{ city.name }} - 체감 {{ city.feelsLike }}℃ / 실제 {{ city.temp }}℃ </template>
      </HeatWarningList>

      <h3>🏙️ 지역별 날씨 현황</h3>

      <WeatherCard
        v-for="city in filteredWeatherList"
        :key="city.id"
        :city-item="city"
        :selected="selectedCityId === city.id"
        :detail-open="detailCityId === city.id"
        :feels-like-threshold="feelsLikeThreshold"
        @select-card="selectCity"
        @click-detail="toggleDetail"
      />

      <p v-if="searchQuery !== '' && filteredWeatherList.length === 0" class="no-result">검색 결과가 일치하는 도시가 없습니다.</p>
    </BaseDashboardCard>

    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>
  </div>
</template>
