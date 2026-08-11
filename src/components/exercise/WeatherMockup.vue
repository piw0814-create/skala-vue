<script setup>
import { ref } from 'vue'

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

const searchCity = ref('')

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
</script>

<template>
  <div class="dashboard-wrapper">
    <section class="search-box">
      <h3>🔍 도시 검색</h3>

      <input v-model.trim="searchCity" placeholder="검색할 도시 이름 입력" />

      <p>검색 중인 도시: {{ searchCity }}</p>
    </section>

    <section class="list-box">
      <h3>🏙️ 지역별 날씨 현황</h3>

      <template v-for="city in weatherList" :key="city.id">
        <div
          v-if="city.name.includes(searchCity)"
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
          </div>
        </div>
      </template>
    </section>

    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>
  </div>
</template>
