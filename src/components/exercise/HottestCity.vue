<script setup>
import { Flame, Thermometer } from '@lucide/vue'

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
    <span class="summary-icon hot-icon">
      <Flame :size="22" />
    </span>

    <div>
      <p class="summary-label">최고 체감온도 도시</p>
      <h3>{{ city.name }}</h3>
      <p class="summary-value">
        <Thermometer :size="17" />
        체감 {{ formatTemp(city.feelsLike) }} · 실제 {{ formatTemp(city.temp) }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.hottest-city-box {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  height: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #fff7ed, #fff1f2);
  border: 1px solid #fed7aa;
  border-radius: 15px;
}

.summary-icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 13px;
  place-items: center;
}

.hot-icon {
  color: #ffffff;
  background: linear-gradient(135deg, #f97316, #ef4444);
}

.summary-label {
  color: #9a3412;
  font-size: 0.78rem;
  font-weight: 800;
}

h3 {
  margin: 1px 0 5px;
  color: var(--weather-navy);
  font-size: 1.3rem;
}

.summary-value {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #7c2d12;
  font-size: 0.88rem;
}
</style>
