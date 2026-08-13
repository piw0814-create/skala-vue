<script setup>
import { RefreshCw, Thermometer } from '@lucide/vue'

import { useConfigStore } from '@/stores/configStore'

const configStore = useConfigStore()

const handleToggleUnit = () => {
  configStore.toggleUnit()
}
</script>

<template>
  <div class="unit-toggler">
    <span class="unit-label">
      <Thermometer :size="17" />
      <strong>{{ configStore.unit === 'celsius' ? '섭씨 ℃' : '화씨 ℉' }}</strong>
    </span>

    <el-button class="toggle-btn" plain round @click="handleToggleUnit">
      <RefreshCw :size="15" />
      단위 변경
    </el-button>
  </div>
</template>

<style scoped>
.unit-toggler {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  text-align: center;
}

.unit-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--weather-muted);
  white-space: nowrap;
}

.unit-label strong {
  color: var(--weather-navy);
}

.toggle-btn {
  gap: 5px;
}

@media (max-width: 720px) {
  .unit-toggler {
    justify-content: space-between;
    width: 100%;
    margin-left: 0;
  }
}
</style>
