<script setup>
import { useTemperature } from '@/composables/useTemperature'

defineProps({
  city: {
    type: Object,
    required: true,
  },
})

// 온도를 현재 설정 단위로 변환
const { formatTemp } = useTemperature()
</script>

<template>
  <div class="hottest-city-box">
    <h3>🥵 현재 체감온도가 가장 높은 도시</h3>

    <p>
      {{ city.name }}
      - 실제 {{ formatTemp(city.temp) }} / 체감 {{ formatTemp(city.feelsLike) }}
    </p>
  </div>
</template>

<style scoped>
.hottest-city-box {
  margin-bottom: 20px;
}
</style>
