<script setup>
import { TriangleAlert } from '@lucide/vue'

defineProps({
  threshold: {
    type: Number,
    default: 30,
  },
})

const emit = defineEmits(['update-threshold'])

const handleThresholdChange = (value) => {
  if (typeof value === 'number') {
    emit('update-threshold', value)
  }
}
</script>

<template>
  <div class="threshold-field">
    <label class="field-label" for="feels-like-threshold">
      <TriangleAlert :size="18" />
      체감온도 주의 기준 (앱)
    </label>

    <div class="threshold-control">
      <el-input-number id="feels-like-threshold" :model-value="threshold" :min="-20" :max="60" :step="1" size="large" @change="handleThresholdChange" />
      <strong>℃ 이상</strong>
    </div>

    <p class="field-help">공식 특보 기준이 아닌 사용자 설정값이며, 계산은 섭씨 원본값으로 처리됩니다.</p>
  </div>
</template>

<style scoped>
.field-label {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 9px;
  color: var(--weather-navy);
  font-weight: 800;
}

.threshold-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.threshold-control strong {
  color: var(--weather-danger);
}

.field-help {
  margin: 8px 2px 0;
  color: var(--weather-muted);
  font-size: 0.82rem;
}
</style>
