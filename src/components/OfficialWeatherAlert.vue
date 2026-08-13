<script setup>
import { computed } from 'vue'
import { RefreshCw, ShieldCheck, Siren } from '@lucide/vue'

const props = defineProps({
  warnings: {
    type: Array,
    default: () => [],
  },
  issuedAt: {
    type: [Number, String],
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  contextLabel: {
    type: String,
    default: '전국',
  },
  compact: {
    type: Boolean,
    default: false,
  },
  showSafe: {
    type: Boolean,
    default: true,
  },
  summaryOnly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['refresh'])

const issuedAtText = computed(() => {
  if (!props.issuedAt) {
    return ''
  }

  const value = String(props.issuedAt).padStart(12, '0')
  const date = new Date(Number(value.slice(0, 4)), Number(value.slice(4, 6)) - 1, Number(value.slice(6, 8)), Number(value.slice(8, 10)), Number(value.slice(10, 12)))

  return date.toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const hasWarnings = computed(() => props.warnings.length > 0)

const safeMessage = computed(() => {
  if (props.contextLabel === '전국') {
    return '현재 조회 결과, 전국에 발효 중인 기상청 공식 특보가 없습니다.'
  }

  return `현재 조회 결과, ${props.contextLabel}에 해당하는 기상청 공식 특보가 없습니다.`
})

const handleRefresh = () => {
  emit('refresh')
}
</script>

<template>
  <section v-if="isLoading" class="official-alert loading-alert" :class="{ compact }">
    <el-skeleton :rows="compact ? 1 : 2" animated />
  </section>

  <section v-else-if="errorMessage" class="official-alert error-alert" :class="{ compact }">
    <el-alert :title="errorMessage" type="error" show-icon :closable="false" />
    <el-button plain round size="small" @click="handleRefresh">
      <RefreshCw :size="14" />
      다시 조회
    </el-button>
  </section>

  <section v-else-if="hasWarnings" class="official-alert warning-alert" :class="{ compact }">
    <div class="alert-heading">
      <span class="alert-icon"><Siren :size="23" /></span>
      <div>
        <span>KMA OFFICIAL WARNING</span>
        <h2>{{ contextLabel }} 기상청 공식 특보 {{ warnings.length }}건</h2>
        <p v-if="issuedAtText && !summaryOnly">{{ issuedAtText }} 발표 기준</p>
      </div>
      <RouterLink v-if="summaryOnly" to="/warnings" class="warning-detail-link">안전 센터에서 확인</RouterLink>
      <el-tag v-else type="danger" effect="dark" round>공식 특보</el-tag>
    </div>

    <ul v-if="!summaryOnly" class="warning-list">
      <li v-for="warning in warnings" :key="warning.id">
        <el-tag :type="warning.level === 'warning' ? 'danger' : 'warning'" effect="light" round size="small">
          {{ warning.title }}
        </el-tag>
        <span>{{ warning.regions }}</span>
      </li>
    </ul>
  </section>

  <section v-else-if="showSafe" class="official-alert safe-alert" :class="{ compact }">
    <ShieldCheck :size="20" />
    <span>{{ safeMessage }}</span>
    <el-tag type="success" effect="plain" round size="small">기상청 현황</el-tag>
  </section>
</template>

<style scoped>
.official-alert {
  padding: 17px 20px;
  border: 1px solid;
  border-radius: 16px;
}

.loading-alert,
.error-alert {
  background: #ffffff;
  border-color: var(--weather-border);
}

.error-alert {
  display: grid;
  gap: 10px;
}

.error-alert .el-button {
  justify-self: start;
  gap: 5px;
}

.warning-alert {
  background: linear-gradient(135deg, #fff7ed, #fff1f2);
  border-color: #fdba74;
  box-shadow: 0 9px 24px rgba(234, 88, 12, 0.1);
}

.alert-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.alert-heading > .el-tag {
  margin-left: auto;
}

.warning-detail-link {
  margin-left: auto;
  padding: 7px 10px;
  color: #9a3412;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid #fdba74;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 800;
  white-space: nowrap;
}

.alert-icon {
  display: grid;
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  color: #ffffff;
  background: linear-gradient(135deg, #f97316, #dc2626);
  border-radius: 13px;
  place-items: center;
}

.alert-heading span:not(.alert-icon) {
  color: #c2410c;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.alert-heading h2 {
  margin: 1px 0;
  color: var(--weather-navy);
  font-size: 1.05rem;
}

.alert-heading p {
  color: var(--weather-muted);
  font-size: 0.73rem;
}

.warning-list {
  display: grid;
  gap: 7px;
  max-height: 180px;
  margin-top: 13px;
  padding: 12px 0 0;
  overflow-y: auto;
  border-top: 1px solid #fed7aa;
  list-style: none;
}

.warning-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--weather-text);
  font-size: 0.78rem;
}

.warning-list .el-tag {
  flex-shrink: 0;
}

.safe-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #166534;
  background: #ecfdf5;
  border-color: #bbf7d0;
  font-size: 0.8rem;
  font-weight: 700;
}

.safe-alert .el-tag {
  margin-left: auto;
}

.compact {
  padding: 14px 16px;
  border-radius: 13px;
}

.compact .warning-list {
  max-height: 135px;
}

@media (max-width: 620px) {
  .alert-heading,
  .safe-alert,
  .warning-list li {
    align-items: flex-start;
    flex-direction: column;
  }

  .alert-heading > .el-tag,
  .safe-alert .el-tag,
  .warning-detail-link {
    margin-left: 0;
  }
}
</style>
