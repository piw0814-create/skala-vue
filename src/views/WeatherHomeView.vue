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

// 현재 도시 목록 탭
const activeTab = ref('all')

// =========================
// 현재 View에서만 필요한 computed
// =========================

// 현재 탭 + 검색어에 따라 표시할 도시 목록
const displayedWeatherList = computed(() => {
  const query = searchQuery.value.trim()

  const sourceList = activeTab.value === 'favorite' ? weatherStore.favoriteCities : weatherStore.weatherWithFeelsLike

  const filteredList = sourceList.filter((city) => city.name.includes(query))

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

      <!-- 전체 / 즐겨찾기 탭 -->
      <div class="weather-tabs">
        <button class="tab-button" :class="{ active: activeTab === 'all' }" @click="changeTab('all')">🏙️ 전체 도시</button>

        <button class="tab-button" :class="{ active: activeTab === 'favorite' }" @click="changeTab('favorite')">⭐ 즐겨찾기 ({{ weatherStore.favoriteCities.length }})</button>
      </div>

      <!-- 즐겨찾기 없음 -->
      <p v-if="activeTab === 'favorite' && weatherStore.favoriteCities.length === 0" class="no-result">⭐ 즐겨찾기한 도시가 없습니다.</p>

      <!-- 검색 결과 없음 -->
      <p v-else-if="searchQuery !== '' && displayedWeatherList.length === 0" class="no-result">검색 결과가 일치하는 도시가 없습니다.</p>

      <!-- 도시별 날씨 카드 -->
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

/* 전체 / 즐겨찾기 탭 */
.weather-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dee2e6;
}

.tab-button {
  padding: 8px 14px;
  background: #f1f2f6;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  cursor: pointer;
}

.tab-button.active {
  background: #2c3e50;
  color: white;
  font-weight: bold;
}

.no-result {
  padding: 15px;
  text-align: center;
  color: #777;
  background: #f8f9fa;
  border-radius: 6px;
}
</style>
