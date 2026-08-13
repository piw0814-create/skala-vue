<script setup>
import { CalendarDays, Clock3, CloudRain, ShieldCheck, Thermometer, TriangleAlert, Wind } from '@lucide/vue'

import { useTemperature } from '@/composables/useTemperature'
import { formatNumber } from '@/utils/numberFormat'

defineProps({
  days: {
    type: Array,
    default: () => [],
  },
})

const { formatTemp } = useTemperature()

const formatMetric = (value, suffix, maximumFractionDigits = 1) => {
  return Number.isFinite(value) ? `${formatNumber(value, maximumFractionDigits)}${suffix}` : '-'
}

const getStatusTagType = (level) => {
  if (level === 'danger') {
    return 'danger'
  }

  if (level === 'caution') {
    return 'warning'
  }

  return 'success'
}
</script>

<template>
  <section class="daily-forecast-panel">
    <div class="daily-heading">
      <span class="heading-icon"><CalendarDays :size="22" /></span>
      <div>
        <span>DAILY TRIP FORECAST</span>
        <h2>날짜별 여행 예보</h2>
        <p>각 날짜의 주의 요소와 날씨 부담이 적은 3시간을 확인하세요.</p>
      </div>
    </div>

    <div class="daily-card-grid">
      <article v-for="day in days" :key="day.date" class="daily-card" :class="`status-${day.status.level}`">
        <div class="day-title-row">
          <div>
            <span>{{ day.date }}</span>
            <h3>{{ day.formattedDate }}</h3>
          </div>
          <el-tag :type="getStatusTagType(day.status.level)" effect="light" round size="small">
            {{ day.status.label }}
          </el-tag>
        </div>

        <div class="day-metrics">
          <span><Thermometer :size="15" />{{ formatTemp(day.tempMin) }} / {{ formatTemp(day.tempMax) }}</span>
          <span><CloudRain :size="15" />강수 {{ formatMetric(day.precipitationProbabilityMax, '%', 0) }}</span>
          <span><Wind :size="15" />돌풍 {{ formatMetric(day.windGustMax, 'm/s') }}</span>
        </div>

        <ul v-if="day.risks.length > 0" class="day-risk-list">
          <li v-for="risk in day.risks.slice(0, 2)" :key="risk.id">
            <TriangleAlert :size="14" />
            <strong>{{ risk.title }}</strong>
            <span>{{ risk.timeRange }}</span>
          </li>
          <li v-if="day.risks.length > 2" class="more-risk">+ {{ day.risks.length - 2 }}개 주의 요소</li>
        </ul>

        <div v-else class="safe-day">
          <ShieldCheck :size="16" />
          <span>주요 주의 요소 없음</span>
        </div>

        <div class="recommended-time" :class="{ unavailable: !day.recommendedWindow.available }">
          <Clock3 :size="15" />
          <span>추천 시간</span>
          <strong>{{ day.recommendedWindow.label }}</strong>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.daily-forecast-panel {
  padding: 24px;
  background: #ffffff;
  border: 1px solid var(--weather-border);
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(51, 65, 85, 0.06);
}

.daily-heading {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.heading-icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  color: #ffffff;
  background: linear-gradient(135deg, #0f766e, #0891b2);
  border-radius: 12px;
  place-items: center;
}

.daily-heading span:not(.heading-icon) {
  color: #0f766e;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.daily-heading h2 {
  margin-top: 1px;
  color: var(--weather-navy);
  font-size: 1.2rem;
}

.daily-heading p {
  color: var(--weather-muted);
  font-size: 0.8rem;
}

.daily-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--weather-border);
}

.daily-card {
  padding: 17px;
  background: var(--weather-surface-soft);
  border: 1px solid var(--weather-border);
  border-left-width: 4px;
  border-radius: 14px;
}

.status-good {
  border-left-color: var(--weather-success);
}

.status-caution {
  border-left-color: var(--weather-warning);
}

.status-danger {
  border-left-color: var(--weather-danger);
}

.day-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.day-title-row span:not(.el-tag__content) {
  color: var(--weather-muted);
  font-size: 0.66rem;
}

.day-title-row h3 {
  color: var(--weather-navy);
  font-size: 1rem;
}

.day-metrics {
  display: flex;
  gap: 9px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.day-metrics span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--weather-text);
  font-size: 0.72rem;
  font-weight: 700;
}

.day-risk-list {
  display: grid;
  gap: 6px;
  margin-top: 13px;
  padding: 0;
  list-style: none;
}

.day-risk-list li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px;
  color: #b45309;
  font-size: 0.72rem;
}

.status-danger .day-risk-list li {
  color: #b91c1c;
}

.day-risk-list strong {
  color: var(--weather-navy);
}

.day-risk-list .more-risk {
  display: block;
  color: var(--weather-muted);
}

.safe-day {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 13px;
  color: #047857;
  font-size: 0.74rem;
  font-weight: 800;
}

.recommended-time {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 14px;
  padding-top: 11px;
  color: #0f766e;
  border-top: 1px solid var(--weather-border);
  font-size: 0.72rem;
}

.recommended-time span {
  color: var(--weather-muted);
}

.recommended-time strong {
  margin-left: auto;
}

.recommended-time.unavailable {
  color: var(--weather-muted);
}

@media (max-width: 720px) {
  .daily-card-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .daily-forecast-panel {
    padding: 19px 16px;
  }

  .day-risk-list li {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .day-risk-list li span {
    grid-column: 2;
  }
}
</style>
