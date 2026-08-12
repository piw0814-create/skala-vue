<script setup>
import { useTemperature } from '@/composables/useTemperature'

defineProps({
  cityItem: {
    type: Object,
    required: true,
  },

  selected: {
    type: Boolean,
    default: false,
  },

  feelsLikeThreshold: {
    type: Number,
    default: 30,
  },

  // 즐겨찾기 여부
  favorite: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-card', 'click-detail', 'toggle-favorite'])

// 온도를 현재 설정 단위로 변환
const { formatTemp } = useTemperature()
</script>

<template>
  <div
    class="weather-card"
    :class="{
      selected: selected,
    }"
    @click="emit('select-card', cityItem)"
  >
    <!-- 카드 상단 -->
    <div class="card-header">
      <!-- 도시명 -->
      <h4>
        {{ cityItem.name }}
        ({{ cityItem.status }})
      </h4>

      <!-- 카드 우측 기능 -->
      <div class="card-actions">
        <!-- 즐겨찾기 -->
        <label class="favorite-checkbox" @click.stop>
          <span> ⭐ </span>
          <input type="checkbox" :checked="favorite" @change="emit('toggle-favorite', cityItem.id)" />
        </label>

        <!-- 상세보기 -->
        <button class="btn-detail" @click.stop="emit('click-detail', cityItem)">상세보기</button>
      </div>
    </div>

    <!-- 실제 기온 -->
    <p>
      현재 기온:
      {{ formatTemp(cityItem.temp) }}
    </p>

    <!-- 더움 / 선선함 -->
    <span v-if="cityItem.temp >= 25" class="badge hot"> 🔥 더움 ({{ formatTemp(25) }} 이상) </span>

    <span v-else class="badge cool"> ❄️ 선선함 ({{ formatTemp(25) }} 미만) </span>

    <!-- 체감온도 -->
    <p class="feels-like">
      🌡️ 체감온도:
      {{ formatTemp(cityItem.feelsLike) }}
    </p>

    <!-- 체감온도 경고 -->
    <p v-if="cityItem.feelsLike >= feelsLikeThreshold" class="heat-warning">🚨 체감온도가 경고 기준 이상입니다.</p>
  </div>
</template>

<style scoped>
.weather-card {
  background: #fff;
  border: 1px solid #dee2e6;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 6px;
  cursor: pointer;
}

/* 카드 상단 */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 10px;
}

/* 도시 이름 */
.card-header h4 {
  margin: 0;
  flex: 1;
  min-width: 0;
}

/* 즐겨찾기 + 상세보기 */
.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;

  /* 공간이 부족해도 버튼 영역은 찌그러지지 않음 */
  flex-shrink: 0;
}

/* 즐겨찾기 */
.favorite-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 5px;

  font-size: 13px;
  white-space: nowrap;

  cursor: pointer;
}

.favorite-checkbox input {
  margin: 0;
  cursor: pointer;
}

.favorite-checkbox span {
  white-space: nowrap;
}

/* 상세보기 */
.btn-detail {
  padding: 6px 10px;

  white-space: nowrap;
  cursor: pointer;
}

/* 온도 상태 */
.badge {
  display: inline-block;
  padding: 4px 8px;

  font-size: 12px;
  border-radius: 4px;

  color: #fff;
}

.hot {
  background-color: #ff7675;
}

.cool {
  background-color: #74b9ff;
}

.feels-like {
  margin-top: 10px;
}

.weather-card.selected {
  border: 2px solid #333;
}

.heat-warning {
  font-weight: bold;
}

/* 카드 폭이 좁을 경우 */
@media (max-width: 520px) {
  .card-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .card-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
