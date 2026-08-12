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
})

const emit = defineEmits(['select-card', 'click-detail'])

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
    <h4>
      {{ cityItem.name }}
      ({{ cityItem.status }})
    </h4>

    <p>
      현재 기온:
      {{ formatTemp(cityItem.temp) }}
    </p>

    <span v-if="cityItem.temp >= 25" class="badge hot"> 🔥 더움 ({{ formatTemp(25) }} 이상) </span>

    <span v-else class="badge cool"> ❄️ 선선함 ({{ formatTemp(25) }} 미만) </span>

    <p class="feels-like">
      🌡️ 체감온도:
      {{ formatTemp(cityItem.feelsLike) }}
    </p>

    <p v-if="cityItem.feelsLike >= feelsLikeThreshold" class="heat-warning">🚨 체감온도가 경고 기준 이상입니다.</p>

    <button class="btn-detail" @click.stop="emit('click-detail', cityItem)">상세보기</button>
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
  position: relative;
}

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

.btn-detail {
  position: absolute;
  right: 12px;
  top: 15px;
  padding: 6px 10px;
  cursor: pointer;
}

.weather-card.selected {
  border: 2px solid #333;
}

.heat-warning {
  font-weight: bold;
}
</style>
