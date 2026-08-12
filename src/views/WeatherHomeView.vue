<script setup>
import { ref, computed, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

import { useWeatherStore } from '@/stores/weatherStore'
import { useTemperature } from '@/composables/useTemperature'

import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import FeelsLikeThreshold from '@/components/exercise/FeelsLikeThreshold.vue'
import HottestCity from '@/components/exercise/HottestCity.vue'
import HeatWarningList from '@/components/exercise/HeatWarningList.vue'

// Router
const router = useRouter()

// Pinia Store
const weatherStore = useWeatherStore()

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

// =========================
// 현재 View에서만 필요한 computed
// =========================

// 검색 결과
const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()

  const filteredList = weatherStore.weatherWithFeelsLike.filter((city) => city.name.includes(query))

  return filteredList
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
}

// 상세 페이지 이동
const goToDetail = (city) => {
  router.push('/weather/' + city.id)
}

// =========================
// watch
// =========================

watch(selectedCityInfo, (newValue, oldValue) => {
  console.log(`[watch 감지] 상태 바 문구가 업데이트되었습니다: "${oldValue}" → "${newValue}"`)
})

watchEffect(() => {
  console.log(`[watchEffect 자동 호출] 현재 검색어: "${searchQuery.value}" / 매칭 도시 수: ${filteredWeatherList.value.length}`)
})

watch(
  () => weatherStore.feelsLikeThreshold,
  (newValue, oldValue) => {
    console.log(`⚠️ 체감온도 경고 기준이 ${oldValue}℃에서 ${newValue}℃로 변경되었습니다.`)
  },
)
</script>

<template>
  <div class="dashboard-wrapper">
    <!-- 검색 -->
    <BaseDashboardCard>
      <SearchBar :current-query="searchQuery" @update-query="updateQuery" />
    </BaseDashboardCard>

    <!-- 체감온도 경고 기준 -->
    <BaseDashboardCard>
      <FeelsLikeThreshold :threshold="weatherStore.feelsLikeThreshold" @update-threshold="updateThreshold" />
    </BaseDashboardCard>

    <!-- 날씨 목록 -->
    <BaseDashboardCard>
      <!-- 체감온도 최고 도시 -->
      <HottestCity :city="weatherStore.hottestFeelsLikeCity" />

      <!-- 체감온도 경고 도시 -->
      <HeatWarningList :cities="weatherStore.warningCities" :threshold="weatherStore.feelsLikeThreshold">
        <!-- Scoped Slot 사용 -->
        <template #default="{ city }"> 🚨 {{ city.name }} - 체감 {{ formatTemp(city.feelsLike) }} / 실제 {{ formatTemp(city.temp) }} </template>
      </HeatWarningList>

      <h3>🏙️ 지역별 날씨 현황</h3>

      <!-- 도시별 날씨 카드 -->
      <WeatherCard
        v-for="city in filteredWeatherList"
        :key="city.id"
        :city-item="city"
        :selected="selectedCityId === city.id"
        :feels-like-threshold="weatherStore.feelsLikeThreshold"
        @select-card="selectCity"
        @click-detail="goToDetail"
      />

      <!-- 검색 결과 없음 -->
      <p v-if="searchQuery !== '' && filteredWeatherList.length === 0" class="no-result">검색 결과가 일치하는 도시가 없습니다.</p>
    </BaseDashboardCard>

    <!-- 선택 상태 -->
    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>
  </div>
</template>

<style scoped>
.status-bar {
  background: #e8f5e9;
  padding: 10px;
  text-align: center;
  color: #2e7d32;
  font-weight: bold;
  border-radius: 6px;
}
</style>
