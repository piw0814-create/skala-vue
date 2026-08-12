<script setup>
import { useTemperature } from '@/composables/useTemperature'

defineProps({
  cities: {
    type: Array,
    default: () => [],
  },

  threshold: {
    type: Number,
    required: true,
  },
})

// 온도를 현재 설정 단위로 변환
const { formatTemp } = useTemperature()
</script>

<template>
  <div class="warning-list">
    <h3>🚨 체감온도 경고 도시</h3>

    <p>
      현재 경고 기준:
      {{ formatTemp(threshold) }} 이상
    </p>

    <p v-if="cities.length === 0">현재 경고 대상 도시가 없습니다.</p>

    <ul v-else>
      <li v-for="city in cities" :key="city.id">
        <slot :city="city">
          {{ city.name }}
          - 실제 {{ formatTemp(city.temp) }} / 체감 {{ formatTemp(city.feelsLike) }}
        </slot>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.warning-list {
  margin-bottom: 15px;
}
</style>
