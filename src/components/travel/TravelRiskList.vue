<script setup>
import { Clock3, ShieldCheck, TriangleAlert } from '@lucide/vue'

defineProps({
  status: {
    type: Object,
    required: true,
  },
  risks: {
    type: Array,
    default: () => [],
  },
})

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
  <section class="risk-panel" :class="`status-${status.level}`">
    <div class="status-summary">
      <span class="status-icon">
        <ShieldCheck v-if="status.level === 'good'" :size="28" />
        <TriangleAlert v-else :size="28" />
      </span>

      <div>
        <span class="status-label">APP WEATHER ANALYSIS</span>
        <h2>{{ status.title }}</h2>
        <p>{{ status.description }}</p>
      </div>

      <el-tag :type="getStatusTagType(status.level)" effect="dark" round>앱 분석</el-tag>
    </div>

    <div v-if="risks.length > 0" class="risk-list">
      <article v-for="risk in risks" :key="risk.id" class="risk-item" :class="`risk-${risk.level}`">
        <div class="risk-heading">
          <span class="risk-icon"><TriangleAlert :size="19" /></span>
          <div>
            <span>{{ risk.level === 'danger' ? '위험' : '주의' }}</span>
            <h3>{{ risk.title }}</h3>
          </div>
          <el-tag :type="getStatusTagType(risk.level)" effect="light" round size="small">앱 분석</el-tag>
        </div>

        <p class="risk-reason">{{ risk.reason }}</p>
        <p class="risk-action">{{ risk.action }}</p>

        <span class="risk-time">
          <Clock3 :size="15" />
          주의 시간대 {{ risk.timeRange }}
        </span>
      </article>
    </div>

    <div v-else class="safe-message">
      <ShieldCheck :size="20" />
      <span>설정된 앱 분석 기준을 넘는 위험 요소가 없습니다. 출발 전 최신 예보는 다시 확인해 주세요.</span>
    </div>
  </section>
</template>

<style scoped>
.risk-panel {
  padding: 24px;
  background: #ffffff;
  border: 1px solid var(--weather-border);
  border-top-width: 4px;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(51, 65, 85, 0.06);
}

.status-good {
  border-top-color: var(--weather-success);
}

.status-caution {
  border-top-color: var(--weather-warning);
}

.status-danger {
  border-top-color: var(--weather-danger);
}

.status-summary {
  display: flex;
  align-items: center;
  gap: 14px;
}

.status-summary > .el-tag {
  margin-left: auto;
}

.status-icon {
  display: grid;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  color: #ffffff;
  border-radius: 16px;
  place-items: center;
}

.status-good .status-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.status-caution .status-icon {
  background: linear-gradient(135deg, #f59e0b, #ea580c);
}

.status-danger .status-icon {
  background: linear-gradient(135deg, #f97316, #dc2626);
}

.status-label {
  color: var(--weather-primary);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.status-summary h2 {
  margin: 1px 0 2px;
  color: var(--weather-navy);
  font-size: 1.35rem;
}

.status-summary p {
  color: var(--weather-muted);
  font-size: 0.86rem;
}

.risk-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--weather-border);
}

.risk-item {
  padding: 17px;
  border: 1px solid;
  border-radius: 14px;
}

.risk-caution {
  background: #fffbeb;
  border-color: #fde68a;
}

.risk-danger {
  background: #fff7f7;
  border-color: #fecaca;
}

.risk-heading {
  display: flex;
  align-items: center;
  gap: 9px;
}

.risk-heading > .el-tag {
  margin-left: auto;
}

.risk-icon {
  display: grid;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  place-items: center;
}

.risk-caution .risk-icon {
  color: #b45309;
  background: #fef3c7;
}

.risk-danger .risk-icon {
  color: #dc2626;
  background: #fee2e2;
}

.risk-heading span:not(.risk-icon) {
  color: var(--weather-muted);
  font-size: 0.68rem;
  font-weight: 700;
}

.risk-heading h3 {
  color: var(--weather-navy);
  font-size: 1rem;
}

.risk-reason,
.risk-action {
  margin-top: 10px;
  font-size: 0.82rem;
}

.risk-reason {
  color: var(--weather-text);
}

.risk-action {
  padding: 10px;
  color: var(--weather-navy);
  background: rgba(255, 255, 255, 0.78);
  border-radius: 9px;
  font-weight: 700;
}

.risk-time {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  color: var(--weather-muted);
  font-size: 0.75rem;
}

.safe-message {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  padding: 13px;
  color: #166534;
  background: #ecfdf5;
  border-radius: 11px;
  font-size: 0.83rem;
  font-weight: 700;
}

@media (max-width: 760px) {
  .risk-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .status-summary {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .status-summary > .el-tag {
    margin-left: 0;
  }
}
</style>
