<script setup>
import { computed } from 'vue'
import { BookmarkCheck, CalendarClock, MapPin, Play, Trash2 } from '@lucide/vue'

import { TRAVEL_FORECAST_MAX_DAYS } from '@/data/travelTypes'
import { addDaysToDateValue, formatTravelPeriod, getDaysBetween, getTodayDateValue, getTripDurationLabel } from '@/utils/travelDate'

const props = defineProps({
  plans: {
    type: Array,
    default: () => [],
  },
  cities: {
    type: Array,
    default: () => [],
  },
  travelTypes: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['load-plan', 'remove-plan'])

const enrichedPlans = computed(() => {
  const today = getTodayDateValue()
  const lastForecastDate = addDaysToDateValue(today, TRAVEL_FORECAST_MAX_DAYS)

  return props.plans.map((plan) => {
    const city = props.cities.find((item) => item.id === plan.cityId)
    const travelType = props.travelTypes.find((item) => item.id === plan.travelType)
    const daysUntil = getDaysBetween(today, plan.startDate)
    const isExpired = plan.endDate < today
    const isOngoing = plan.startDate < today && !isExpired
    const isOutsideForecastRange = plan.endDate > lastForecastDate

    return {
      ...plan,
      cityName: city?.name ?? '알 수 없는 도시',
      cityFullName: city?.fullName ?? '',
      travelTypeLabel: travelType?.label ?? '기타 일정',
      formattedPeriod: formatTravelPeriod(plan.startDate, plan.endDate),
      durationLabel: getTripDurationLabel(plan.startDate, plan.endDate),
      daysUntil,
      isExpired,
      isOngoing,
      isOutsideForecastRange,
      dayLabel: isExpired ? '지난 일정' : isOngoing ? '여행 중' : isOutsideForecastRange ? '예보 범위 밖' : daysUntil === 0 ? '오늘' : `D-${daysUntil}`,
    }
  })
})

const handleLoad = (plan) => {
  if (!plan.isExpired && !plan.isOutsideForecastRange) {
    emit('load-plan', plan)
  }
}

const handleRemove = (planId) => {
  emit('remove-plan', planId)
}
</script>

<template>
  <section class="saved-plans-panel">
    <div class="saved-heading">
      <span class="saved-icon"><BookmarkCheck :size="22" /></span>
      <div>
        <span>SAVED TRAVEL PLANS</span>
        <h2>저장한 여행 일정</h2>
        <p>이 브라우저에 일정을 보관하고, 불러올 때 최신 예보로 재분석합니다.</p>
      </div>
      <el-tag effect="plain" round>{{ plans.length }}/12</el-tag>
    </div>

    <div v-if="enrichedPlans.length > 0" class="saved-plan-list">
      <article v-for="plan in enrichedPlans" :key="plan.id" class="saved-plan-card" :class="{ expired: plan.isExpired }">
        <div class="plan-main">
          <span class="location-icon"><MapPin :size="18" /></span>
          <div>
            <span>{{ plan.cityFullName }}</span>
            <h3>{{ plan.cityName }} · {{ plan.travelTypeLabel }}</h3>
          </div>
        </div>

        <div class="plan-date">
          <CalendarClock :size="16" />
          <span>{{ plan.formattedPeriod }} · {{ plan.durationLabel }}</span>
          <el-tag :type="plan.isExpired || plan.isOutsideForecastRange ? 'info' : plan.daysUntil === 0 ? 'danger' : 'success'" effect="light" round size="small">
            {{ plan.dayLabel }}
          </el-tag>
        </div>

        <div class="plan-actions">
          <el-button type="primary" plain round size="small" :disabled="plan.isExpired || plan.isOutsideForecastRange" @click="handleLoad(plan)">
            <Play :size="14" />
            불러오기
          </el-button>

          <el-popconfirm title="이 저장 일정을 삭제할까요?" confirm-button-text="삭제" cancel-button-text="취소" @confirm="handleRemove(plan.id)">
            <template #reference>
              <el-button type="danger" text circle aria-label="저장 일정 삭제">
                <Trash2 :size="15" />
              </el-button>
            </template>
          </el-popconfirm>
        </div>
      </article>
    </div>

    <div v-else class="saved-empty">
      <BookmarkCheck :size="28" />
      <div>
        <strong>아직 저장한 일정이 없습니다</strong>
        <p>여행 날씨를 확인한 후 결과의 ‘일정 저장’ 버튼을 눌러보세요.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.saved-plans-panel {
  padding: 22px 24px;
  background: #ffffff;
  border: 1px solid var(--weather-border);
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(51, 65, 85, 0.06);
}

.saved-heading {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.saved-heading > .el-tag {
  margin-left: auto;
}

.saved-icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  color: #ffffff;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  border-radius: 12px;
  place-items: center;
}

.saved-heading span:not(.saved-icon) {
  color: #7c3aed;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.saved-heading h2 {
  margin-top: 1px;
  color: var(--weather-navy);
  font-size: 1.2rem;
}

.saved-heading p,
.saved-empty p {
  color: var(--weather-muted);
  font-size: 0.8rem;
}

.saved-plan-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 11px;
  margin-top: 17px;
  padding-top: 17px;
  border-top: 1px solid var(--weather-border);
}

.saved-plan-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  padding: 15px;
  background: #f8fafc;
  border: 1px solid var(--weather-border);
  border-radius: 13px;
}

.saved-plan-card.expired {
  opacity: 0.65;
}

.plan-main {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.location-icon {
  display: grid;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  color: #2563eb;
  background: #dbeafe;
  border-radius: 10px;
  place-items: center;
}

.plan-main div {
  min-width: 0;
}

.plan-main span:not(.location-icon) {
  display: block;
  overflow: hidden;
  color: var(--weather-muted);
  font-size: 0.66rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plan-main h3 {
  overflow: hidden;
  color: var(--weather-navy);
  font-size: 0.93rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plan-date {
  display: flex;
  align-items: center;
  grid-column: 1 / -1;
  gap: 6px;
  color: var(--weather-muted);
  font-size: 0.74rem;
}

.plan-date .el-tag {
  margin-left: auto;
}

.plan-actions {
  display: flex;
  align-items: center;
  grid-column: 2;
  grid-row: 1;
  gap: 2px;
}

.plan-actions .el-button {
  gap: 4px;
}

.saved-empty {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-top: 16px;
  padding: 15px;
  color: #7c3aed;
  background: #f5f3ff;
  border-radius: 13px;
}

.saved-empty svg {
  flex-shrink: 0;
}

.saved-empty strong {
  color: var(--weather-navy);
  font-size: 0.85rem;
}

@media (max-width: 800px) {
  .saved-plan-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 540px) {
  .saved-plans-panel {
    padding: 19px 16px;
  }

  .saved-heading {
    flex-wrap: wrap;
  }

  .saved-plan-card {
    grid-template-columns: 1fr;
  }

  .plan-actions {
    justify-content: space-between;
    grid-column: 1;
    grid-row: auto;
  }
}
</style>
