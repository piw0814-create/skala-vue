<script setup>
import { computed, ref } from 'vue'
import { CheckCheck, PackageCheck, RotateCcw } from '@lucide/vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

const checkedItemIds = ref([])

const completedCount = computed(() => checkedItemIds.value.length)

const progressPercentage = computed(() => {
  if (props.items.length === 0) {
    return 0
  }

  return Math.round((completedCount.value / props.items.length) * 100)
})

const resetChecklist = () => {
  checkedItemIds.value = []
}
</script>

<template>
  <section class="packing-panel">
    <div class="packing-heading">
      <span class="packing-icon"><PackageCheck :size="23" /></span>
      <div>
        <span>WEATHER PACKING</span>
        <h2>날씨 맞춤 준비물</h2>
        <p>체크박스는 현재 화면의 로컬 반응형 상태로 관리됩니다.</p>
      </div>

      <el-button v-if="checkedItemIds.length > 0" plain round size="small" @click="resetChecklist">
        <RotateCcw :size="14" />
        초기화
      </el-button>
    </div>

    <template v-if="items.length > 0">
      <div class="progress-row">
        <span>{{ completedCount }} / {{ items.length }}개 준비 완료</span>
        <el-progress :percentage="progressPercentage" :stroke-width="8" :show-text="false" />
      </div>

      <ul class="packing-list">
        <li v-for="item in items" :key="item.id" :class="{ checked: checkedItemIds.includes(item.id) }">
          <label>
            <input v-model="checkedItemIds" type="checkbox" :value="item.id" />
            <span class="custom-checkbox">
              <CheckCheck v-if="checkedItemIds.includes(item.id)" :size="16" />
            </span>
            <span>
              <strong>{{ item.label }}</strong>
              <small>{{ item.reason }}</small>
            </span>
          </label>
        </li>
      </ul>
    </template>

    <el-empty v-else description="현재 예보에서 추가로 추천할 준비물이 없습니다." :image-size="72" />
  </section>
</template>

<style scoped>
.packing-panel {
  padding: 22px;
  background: #ffffff;
  border: 1px solid var(--weather-border);
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(51, 65, 85, 0.06);
}

.packing-heading {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.packing-heading > .el-button {
  gap: 5px;
  margin-left: auto;
}

.packing-icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  color: #ffffff;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  border-radius: 12px;
  place-items: center;
}

.packing-heading span:not(.packing-icon) {
  color: #7c3aed;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.packing-heading h2 {
  margin-top: 1px;
  color: var(--weather-navy);
  font-size: 1.2rem;
}

.packing-heading p {
  color: var(--weather-muted);
  font-size: 0.78rem;
}

.progress-row {
  display: grid;
  grid-template-columns: auto minmax(120px, 1fr);
  align-items: center;
  gap: 12px;
  margin: 18px 0 12px;
  color: var(--weather-muted);
  font-size: 0.78rem;
}

.packing-list {
  display: grid;
  gap: 8px;
  padding: 0;
  list-style: none;
}

.packing-list li {
  background: var(--weather-surface-soft);
  border: 1px solid var(--weather-border);
  border-radius: 11px;
  transition:
    border-color 0.2s ease,
    background 0.2s ease;
}

.packing-list li.checked {
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.packing-list label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  cursor: pointer;
}

.packing-list input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.custom-checkbox {
  display: grid;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  color: #ffffff;
  background: #ffffff;
  border: 2px solid #cbd5e1;
  border-radius: 7px;
  place-items: center;
}

.checked .custom-checkbox {
  background: var(--weather-success);
  border-color: var(--weather-success);
}

.packing-list label > span:last-child {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.packing-list strong {
  color: var(--weather-navy);
  font-size: 0.86rem;
}

.packing-list small {
  color: var(--weather-muted);
  font-size: 0.74rem;
}

.checked strong,
.checked small {
  text-decoration: line-through;
  opacity: 0.7;
}

@media (max-width: 540px) {
  .packing-heading {
    flex-wrap: wrap;
  }

  .packing-heading > .el-button {
    margin-left: 54px;
  }

  .progress-row {
    grid-template-columns: 1fr;
  }
}
</style>
