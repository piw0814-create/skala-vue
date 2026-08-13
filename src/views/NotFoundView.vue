<script setup>
import { CloudOff, Home } from '@lucide/vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="not-found-container">
    <el-result title="페이지를 찾을 수 없습니다" sub-title="요청한 주소가 존재하지 않거나 아직 준비되지 않은 화면입니다.">
      <template #icon>
        <span class="error-icon"><CloudOff :size="52" /></span>
      </template>

      <template #extra>
        <el-button type="primary" round @click="goHome">
          <Home :size="16" />
          날씨 대시보드로 이동
        </el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped>
.not-found-container {
  display: grid;
  min-height: 520px;
  background: #ffffff;
  border: 1px solid var(--weather-border);
  border-radius: 18px;
  place-items: center;
}

.error-icon {
  display: grid;
  width: 96px;
  height: 96px;
  color: var(--weather-primary);
  background: var(--weather-primary-soft);
  border-radius: 30px;
  place-items: center;
}

.not-found-container :deep(.el-button) {
  gap: 6px;
}
</style>
