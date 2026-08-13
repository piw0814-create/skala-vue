<script setup>
import { CloudSun, Droplets, Gauge, Star, Thermometer, Wind } from '@lucide/vue'

import { useTemperature } from '@/composables/useTemperature'
import { formatNumber } from '@/utils/numberFormat'

const props = defineProps({
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

const handleSelectCard = () => {
  emit('select-card', props.cityItem)
}

const handleToggleFavorite = () => {
  emit('toggle-favorite', props.cityItem.id)
}

const handleClickDetail = () => {
  emit('click-detail', props.cityItem)
}

const getAqiTagType = (aqi) => {
  if (aqi <= 2) {
    return 'success'
  }

  if (aqi === 3) {
    return 'warning'
  }

  return 'danger'
}
</script>

<template>
  <article
    class="weather-card"
    :class="{
      selected: selected,
    }"
    role="button"
    tabindex="0"
    @click="handleSelectCard"
    @keydown.enter="handleSelectCard"
  >
    <!-- 카드 상단 -->
    <div class="card-header">
      <div class="city-heading">
        <span class="weather-icon">
          <CloudSun :size="25" />
        </span>

        <div>
          <h3>{{ cityItem.name }}</h3>
          <p>{{ cityItem.fullName }}</p>
        </div>
      </div>

      <!-- 카드 우측 기능 -->
      <div class="card-actions">
        <!-- native checkbox를 이용한 즐겨찾기 -->
        <label class="favorite-checkbox" :class="{ favorite }" title="즐겨찾기" @click.stop>
          <Star :size="18" :fill="favorite ? 'currentColor' : 'none'" />
          <input type="checkbox" :checked="favorite" @change="handleToggleFavorite" />
          <span class="visually-hidden">{{ favorite ? '즐겨찾기 해제' : '즐겨찾기 추가' }}</span>
        </label>

        <el-button type="primary" plain round size="small" @click.stop="handleClickDetail">상세보기</el-button>
      </div>
    </div>

    <div class="temperature-row">
      <div>
        <p class="weather-status">{{ cityItem.status }}</p>
        <strong class="current-temperature">{{ formatTemp(cityItem.temp) }}</strong>
      </div>

      <!-- 더움 / 선선함 -->
      <span v-if="cityItem.temp >= 25" class="temperature-badge hot">더운 날씨</span>
      <span v-else class="temperature-badge cool">선선한 날씨</span>
    </div>

    <div class="weather-metrics">
      <div class="metric-item">
        <Thermometer :size="18" />
        <span>체감</span>
        <strong>{{ formatTemp(cityItem.feelsLike) }}</strong>
      </div>

      <div class="metric-item">
        <Droplets :size="18" />
        <span>습도</span>
        <strong>{{ formatNumber(cityItem.humidity, 0) }}%</strong>
      </div>

      <div class="metric-item">
        <Wind :size="18" />
        <span>풍속</span>
        <strong>{{ formatNumber(cityItem.wind, 1) }}m/s</strong>
      </div>
    </div>

    <div class="card-footer">
      <div v-if="cityItem.airQuality" class="air-quality">
        <Gauge :size="16" />
        <span>대기질</span>
        <el-tag :type="getAqiTagType(cityItem.airQuality.aqi)" effect="light" round size="small">
          {{ cityItem.airQuality.label }} · OpenWeather {{ formatNumber(cityItem.airQuality.aqi, 0) }}/5
        </el-tag>
      </div>

      <el-tag v-if="cityItem.feelsLike >= feelsLikeThreshold" type="warning" effect="light" round size="small">앱 기준 체감온도 주의</el-tag>
    </div>

    <p v-if="cityItem.feelsLike >= feelsLikeThreshold" class="heat-warning">현재 체감온도가 사용자가 설정한 앱 주의 기준 이상입니다.</p>
  </article>
</template>

<style scoped>
.weather-card {
  position: relative;
  height: 100%;
  padding: 14px;
  background: #ffffff;
  border: 1px solid var(--weather-border);
  border-radius: 13px;
  cursor: pointer;
  outline: none;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.weather-card:hover {
  border-color: #78aaa1;
  box-shadow: 0 14px 28px rgba(18, 65, 61, 0.12);
  transform: translateY(-2px);
}

.weather-card:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.24);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 10px;
}

.city-heading {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
}

.weather-icon {
  display: grid;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  color: var(--weather-primary);
  background: var(--weather-primary-soft);
  border-radius: 10px;
  place-items: center;
}

.city-heading h3 {
  margin: 0;
  color: var(--weather-navy);
  font-size: 0.96rem;
  font-weight: 800;
}

.city-heading p {
  overflow: hidden;
  color: var(--weather-muted);
  font-size: 0.68rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.favorite-checkbox {
  display: grid;
  width: 30px;
  height: 30px;
  color: #94a3b8;
  background: #f8fafc;
  border: 1px solid var(--weather-border);
  border-radius: 50%;
  cursor: pointer;
  place-items: center;
  transition: all 0.2s ease;
}

.favorite-checkbox input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.favorite-checkbox.favorite {
  color: #f59e0b;
  background: #fffbeb;
  border-color: #fde68a;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.temperature-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 11px;
}

.weather-status {
  margin-bottom: 1px;
  color: var(--weather-muted);
  font-size: 0.72rem;
}

.current-temperature {
  color: var(--weather-navy);
  font-size: 2rem;
  line-height: 1;
  letter-spacing: -0.05em;
}

.temperature-badge {
  padding: 4px 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
}

.hot {
  color: #c2410c;
  background: #ffedd5;
}

.cool {
  color: #0369a1;
  background: #e0f2fe;
}

.weather-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5px;
  margin-bottom: 10px;
}

.metric-item {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 2px;
  padding: 7px 3px;
  color: var(--weather-primary);
  background: #f8fafc;
  border-radius: 10px;
  text-align: center;
}

.metric-item span {
  color: var(--weather-muted);
  font-size: 0.63rem;
}

.metric-item strong {
  color: var(--weather-navy);
  font-size: 0.72rem;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}

.air-quality {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--weather-muted);
  font-size: 0.68rem;
}

.weather-card.selected {
  border-color: var(--weather-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.13);
}

.heat-warning {
  margin: 12px 0 0;
  padding-top: 10px;
  color: var(--weather-danger);
  border-top: 1px dashed #fecaca;
  font-size: 0.78rem;
  font-weight: 700;
}

@media (max-width: 520px) {
  .card-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .card-actions {
    justify-content: space-between;
    width: 100%;
  }

  .temperature-row {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
