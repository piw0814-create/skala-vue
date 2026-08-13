<script setup>
import { ShieldCheck, TriangleAlert } from '@lucide/vue'

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
    <div class="warning-header">
      <span class="summary-icon" :class="{ safe: cities.length === 0 }">
        <ShieldCheck v-if="cities.length === 0" :size="21" />
        <TriangleAlert v-else :size="21" />
      </span>

      <div>
        <p class="summary-label">앱 기준 체감온도 주의 도시</p>
        <h3>{{ cities.length }}개 도시</h3>
        <p class="threshold-text">기준 {{ formatTemp(threshold) }} 이상</p>
      </div>
    </div>

    <p v-if="cities.length === 0" class="safe-message">현재 앱 기준 주의 대상 도시가 없습니다.</p>

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
  height: 100%;
  padding: 18px;
  background: #f8fafc;
  border: 1px solid var(--weather-border);
  border-radius: 15px;
}

.warning-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.summary-icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  color: #ffffff;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  border-radius: 13px;
  place-items: center;
}

.summary-icon.safe {
  background: linear-gradient(135deg, #10b981, #059669);
}

.summary-label {
  color: var(--weather-muted);
  font-size: 0.78rem;
  font-weight: 800;
}

h3 {
  margin: 1px 0 2px;
  color: var(--weather-navy);
  font-size: 1.3rem;
}

.threshold-text,
.safe-message {
  color: var(--weather-muted);
  font-size: 0.84rem;
}

.safe-message {
  margin-top: 10px;
}

ul {
  display: grid;
  gap: 6px;
  max-height: 92px;
  margin-top: 11px;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 9px;
  color: var(--weather-muted);
  background: #ffffff;
  border-radius: 8px;
  font-size: 0.78rem;
}
</style>
