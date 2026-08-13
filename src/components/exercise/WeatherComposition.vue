<script setup>
import { ref, computed, watch, watchEffect } from 'vue'

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
    status: '구름많음',
    humidity: 70,
    wind: 4.1,
  },
])
const filteredWeatherList = computed(() => {
  return weatherWithFeelsLike.value.filter((city) => city.name.includes(searchQuery.value))
})
const searchQuery = ref('')

const selectedCityId = ref('')
const selectedCityInfo = ref('카드를 클릭해 보세요.')

const detailCityId = ref('')

const selectCity = (city) => {
  selectedCityId.value = city.id
  selectedCityInfo.value = `${city.name}이 선택되었습니다.`
}

const toggleDetail = (city) => {
  alert(`${city.name}의 현재 날씨는 [${city.status}] 상태입니다.`)

  if (detailCityId.value === city.id) {
    detailCityId.value = ''
  } else {
    detailCityId.value = city.id
  }
}

const calculateFeelsLike = (temp, humidity, wind) => {
  const vaporPressure = (humidity / 100) * 6.105 * Math.exp((17.27 * temp) / (237.7 + temp))

  const feelsLike = temp + 0.33 * vaporPressure - 0.7 * wind - 4

  return Number(feelsLike.toFixed(1))
}

const weatherWithFeelsLike = computed(() => {
  return weatherList.value.map((city) => {
    return {
      ...city,
      feelsLike: calculateFeelsLike(city.temp, city.humidity, city.wind),
    }
  })
})
const feelsLikeThreshold = ref(30)

const hottestFeelsLikeCity = computed(() => {
  return weatherWithFeelsLike.value.reduce((hottest, city) => {
    return city.feelsLike > hottest.feelsLike ? city : hottest
  })
})

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
    <section class="search-box">
      <h3>🔍 도시 검색</h3>

      <input v-model.trim="searchQuery" placeholder="검색할 도시 이름 입력" />

      <p>검색 중인 도시: {{ searchQuery }}</p>
    </section>
    <section class="threshold-box">
      <h3>⚠️ 체감온도 경고 기준</h3>

      <input v-model.number="feelsLikeThreshold" type="number" />

      <span>℃ 이상</span>
    </section>

    <section class="list-box">
      <div class="hottest-city-box">
        <h3>🥵 현재 체감온도가 가장 높은 도시</h3>

        <p>
          {{ hottestFeelsLikeCity.name }}
          - 실제 {{ hottestFeelsLikeCity.temp }}°C / 체감 {{ hottestFeelsLikeCity.feelsLike }}°C
        </p>
      </div>
      <h3>🏙️ 지역별 날씨 현황</h3>

      <template v-for="city in filteredWeatherList" :key="city.id">
        <div
          class="weather-card"
          :class="{
            selected: selectedCityId === city.id,
          }"
          @click="selectCity(city)"
        >
          <h4>{{ city.name }} ({{ city.status }})</h4>

          <p>현재 기온: {{ city.temp }}°C</p>

          <span v-if="city.temp >= 25" class="badge hot"> 🔥 더움 (25도 이상) </span>

          <span v-else class="badge cool"> ❄️ 선선함 (25도 미만) </span>

          <button class="btn-detail" @click.stop="toggleDetail(city)">상세보기</button>

          <div v-show="detailCityId === city.id" class="detail-box">
            <p>날씨: {{ city.status }}</p>
            <p>습도: {{ city.humidity }}%</p>
            <p>풍속: {{ city.wind }}m/s</p>
            <p>🌡️ 체감온도: {{ city.feelsLike }}°C</p>
            <p v-if="city.feelsLike >= feelsLikeThreshold" class="heat-warning">🚨 체감온도가 경고 기준 이상입니다.</p>
          </div>
        </div>
      </template>
      <p v-if="searchQuery !== '' && filteredWeatherList.length === 0" class="no-result">검색 결과가 일치하는 도시가 없습니다.</p>
    </section>

    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>
  </div>
</template>
