<script setup>
import { Search } from '@lucide/vue'

// 1. 상위로 입력 텍스트를 전달할 커스텀 이벤트 등록 (매크로)
const emit = defineEmits(['update-query'])

// 2. 상위로부터 현재 검색 상태 값을 수신 (한글 동기화 상태 유지용)
defineProps({
  currentQuery: {
    type: String,
    default: '',
  },
})

const handleQueryInput = (value) => {
  emit('update-query', value)
}
</script>

<template>
  <div class="search-inner">
    <label class="field-label" for="city-search">도시 검색</label>

    <el-input id="city-search" :model-value="currentQuery" clearable placeholder="도시 이름을 입력하세요" size="large" @input="handleQueryInput">
      <template #prefix>
        <Search :size="18" />
      </template>
    </el-input>

    <p class="field-help">{{ currentQuery ? `'${currentQuery}' 검색 중` : '전국 주요 관측 도시를 검색할 수 있습니다.' }}</p>
  </div>
</template>

<style scoped>
.field-label {
  display: block;
  margin-bottom: 9px;
  color: var(--weather-navy);
  font-weight: 800;
}

.field-help {
  margin: 8px 2px 0;
  color: var(--weather-muted);
  font-size: 0.82rem;
}
</style>
