<script setup>
import { computed } from 'vue'
import { CalendarDays, Compass, MapPin, Search } from '@lucide/vue'

import { TRAVEL_FORECAST_MAX_DAYS } from '@/data/travelTypes'
import { addDaysToDateValue, getDaysBetween, getTodayDateValue, getTripDurationLabel } from '@/utils/travelDate'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  cities: {
    type: Array,
    default: () => [],
  },
  travelTypes: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'analyze'])

const todayDateValue = getTodayDateValue()
const lastForecastDateValue = addDaysToDateValue(todayDateValue, TRAVEL_FORECAST_MAX_DAYS)
const today = new Date(`${todayDateValue}T00:00:00`)
const lastForecastDate = new Date(`${lastForecastDateValue}T00:00:00`)

const tripDurationLabel = computed(() => {
  return getTripDurationLabel(props.modelValue.startDate, props.modelValue.endDate)
})

const isPlanComplete = computed(() => {
  const nights = getDaysBetween(props.modelValue.startDate, props.modelValue.endDate)

  return Boolean(
    props.modelValue.cityId && props.modelValue.startDate && props.modelValue.endDate && props.modelValue.travelType && Number.isFinite(nights) && nights >= 0 && nights <= TRAVEL_FORECAST_MAX_DAYS,
  )
})

const updatePlan = (field, value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

const cityModel = computed({
  get: () => props.modelValue.cityId,
  set: (value) => updatePlan('cityId', value),
})

const startDateModel = computed({
  get: () => props.modelValue.startDate,
  set: (startDate) => {
    emit('update:modelValue', {
      ...props.modelValue,
      startDate,
      endDate: !props.modelValue.endDate || props.modelValue.endDate < startDate ? startDate : props.modelValue.endDate,
    })
  },
})

const endDateModel = computed({
  get: () => props.modelValue.endDate,
  set: (endDate) => updatePlan('endDate', endDate),
})

const travelTypeModel = computed({
  get: () => props.modelValue.travelType,
  set: (value) => updatePlan('travelType', value),
})

const disableStartDate = (date) => {
  return date < today || date > lastForecastDate
}

const disableEndDate = (date) => {
  const selectedStartDate = new Date(`${props.modelValue.startDate || todayDateValue}T00:00:00`)
  return date < selectedStartDate || date > lastForecastDate
}

const handleSubmit = () => {
  if (isPlanComplete.value) {
    emit('analyze')
  }
}
</script>

<template>
  <form class="planner-form" @submit.prevent="handleSubmit">
    <div class="form-heading">
      <span class="heading-icon"><Compass :size="23" /></span>
      <div>
        <span>TRAVEL PLAN</span>
        <h2>여행 조건을 선택해 주세요</h2>
        <p>당일부터 최대 4박 5일까지 국내 주요 도시 예보를 분석합니다.</p>
      </div>
    </div>

    <div class="field-grid">
      <div class="field-group">
        <label for="travel-city">
          <MapPin :size="17" />
          여행지
        </label>
        <el-select id="travel-city" v-model="cityModel" placeholder="여행지를 선택하세요" size="large" filterable>
          <el-option v-for="city in cities" :key="city.id" :label="city.fullName" :value="city.id" />
        </el-select>
      </div>

      <div class="field-group">
        <label for="travel-start-date">
          <CalendarDays :size="17" />
          출발일
        </label>
        <el-date-picker
          id="travel-start-date"
          v-model="startDateModel"
          type="date"
          value-format="YYYY-MM-DD"
          format="YYYY년 M월 D일"
          placeholder="출발일을 선택하세요"
          size="large"
          :disabled-date="disableStartDate"
          :clearable="false"
        />
      </div>

      <div class="field-group">
        <label for="travel-end-date">
          <CalendarDays :size="17" />
          도착일
        </label>
        <el-date-picker
          id="travel-end-date"
          v-model="endDateModel"
          type="date"
          value-format="YYYY-MM-DD"
          format="YYYY년 M월 D일"
          placeholder="도착일을 선택하세요"
          size="large"
          :disabled-date="disableEndDate"
          :clearable="false"
        />
        <p v-if="tripDurationLabel" class="field-help">선택한 일정: {{ tripDurationLabel }}</p>
      </div>
    </div>

    <fieldset class="travel-type-field">
      <legend>여행 유형</legend>
      <el-radio-group v-model="travelTypeModel" size="large">
        <el-radio-button v-for="type in travelTypes" :key="type.id" :value="type.id">
          {{ type.label }}
        </el-radio-button>
      </el-radio-group>
      <p>여행 유형에 따라 다음 단계에서 위험 요소의 중요도를 다르게 분석합니다.</p>
    </fieldset>

    <el-button class="analyze-button" type="primary" size="large" native-type="submit" :loading="isLoading" :disabled="!isPlanComplete" round>
      <Search v-if="!isLoading" :size="18" />
      여행 날씨 확인
    </el-button>
  </form>
</template>

<style scoped>
.planner-form {
  display: grid;
  gap: 22px;
  padding: 24px;
  background: var(--weather-surface);
  border: 1px solid var(--weather-border);
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(51, 65, 85, 0.06);
}

.form-heading {
  display: flex;
  align-items: flex-start;
  gap: 13px;
}

.heading-icon {
  display: grid;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  color: #ffffff;
  background: linear-gradient(135deg, var(--weather-primary), var(--weather-cyan));
  border-radius: 13px;
  place-items: center;
}

.form-heading span:not(.heading-icon) {
  color: var(--weather-primary);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.form-heading h2 {
  margin-top: 1px;
  color: var(--weather-navy);
  font-size: 1.28rem;
}

.form-heading p,
.travel-type-field p {
  color: var(--weather-muted);
  font-size: 0.83rem;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.field-group {
  min-width: 0;
}

.field-group label,
.travel-type-field legend {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  color: var(--weather-navy);
  font-weight: 800;
}

.field-group :deep(.el-select),
.field-group :deep(.el-date-editor) {
  width: 100%;
}

.travel-type-field {
  min-width: 0;
  padding: 0;
  border: 0;
}

.travel-type-field :deep(.el-radio-group) {
  display: flex;
  width: 100%;
}

.travel-type-field :deep(.el-radio-button) {
  flex: 1;
}

.travel-type-field :deep(.el-radio-button__inner) {
  width: 100%;
}

.travel-type-field p {
  margin-top: 8px;
}

.field-help {
  margin-top: 7px;
  color: var(--weather-primary);
  font-size: 0.76rem;
  font-weight: 800;
}

.analyze-button {
  justify-self: start;
  gap: 7px;
  min-width: 180px;
}

@media (max-width: 900px) {
  .field-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .field-group:first-child {
    grid-column: 1 / -1;
  }
}

@media (max-width: 680px) {
  .field-grid {
    grid-template-columns: 1fr;
  }

  .travel-type-field :deep(.el-radio-group) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px;
  }

  .travel-type-field :deep(.el-radio-button__inner) {
    border: 1px solid var(--weather-border);
    border-radius: 9px;
    box-shadow: none;
  }

  .analyze-button {
    justify-self: stretch;
    width: 100%;
  }
}
</style>
