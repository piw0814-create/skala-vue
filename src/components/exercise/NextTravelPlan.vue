<script setup>
import { computed } from 'vue'
import { ArrowRight, CalendarDays, MapPin, ShieldAlert, Sparkles } from '@lucide/vue'

import { formatTravelPeriod, getDaysBetween, getTodayDateValue, getTripDurationLabel } from '@/utils/travelDate'

const props = defineProps({
  plan: {
    type: Object,
    required: true,
  },
  city: {
    type: Object,
    required: true,
  },
  travelType: {
    type: Object,
    required: true,
  },
  savedCount: {
    type: Number,
    default: 1,
  },
  officialWarnings: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['check-weather'])

const dateInfo = computed(() => {
  const today = getTodayDateValue()
  const daysUntil = getDaysBetween(today, props.plan.startDate)
  const isOngoing = props.plan.startDate < today && props.plan.endDate >= today

  return {
    label: isOngoing ? '여행 중' : daysUntil === 0 ? '오늘 출발' : `D-${daysUntil}`,
    formatted: formatTravelPeriod(props.plan.startDate, props.plan.endDate),
    durationLabel: getTripDurationLabel(props.plan.startDate, props.plan.endDate),
  }
})

const handleCheckWeather = () => {
  emit('check-weather', props.plan)
}
</script>

<template>
  <section class="next-travel-card">
    <div class="travel-visual">
      <span class="visual-icon"><Sparkles :size="26" /></span>
      <span>NEXT TRIP</span>
      <strong>{{ dateInfo.label }}</strong>
    </div>

    <div class="travel-copy">
      <div class="travel-title-row">
        <div>
          <span>가장 가까운 저장 일정</span>
          <h2>{{ city.name }} {{ travelType.label }}</h2>
        </div>
        <el-tag effect="plain" round>저장 일정 {{ savedCount }}개</el-tag>
      </div>

      <div class="travel-meta">
        <span><CalendarDays :size="16" />{{ dateInfo.formatted }} · {{ dateInfo.durationLabel }}</span>
        <span><MapPin :size="16" />{{ city.fullName }}</span>
      </div>

      <div v-if="officialWarnings.length > 0" class="official-warning-note">
        <ShieldAlert :size="17" />
        <span>현재 이 지역에 기상청 공식 특보 {{ officialWarnings.length }}건이 있습니다.</span>
      </div>

      <div class="travel-action-row">
        <p>최신 예보와 위험 요소를 다시 확인해 보세요.</p>
        <el-button type="primary" round @click="handleCheckWeather">
          여행 날씨 확인
          <ArrowRight :size="16" />
        </el-button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.next-travel-card {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  margin-bottom: 18px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #c7d2fe;
  border-radius: 18px;
  box-shadow: 0 10px 28px rgba(79, 70, 229, 0.1);
}

.travel-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  min-height: 178px;
  padding: 22px;
  color: #ffffff;
  background: linear-gradient(145deg, #7c3aed, #2563eb);
  text-align: center;
}

.visual-icon {
  display: grid;
  width: 47px;
  height: 47px;
  margin-bottom: 4px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 14px;
  place-items: center;
}

.travel-visual > span:not(.visual-icon) {
  color: #ddd6fe;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.15em;
}

.travel-visual strong {
  font-size: 1.45rem;
}

.travel-copy {
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 22px 24px;
}

.travel-title-row,
.travel-action-row,
.travel-meta,
.official-warning-note {
  display: flex;
  align-items: center;
}

.travel-title-row {
  justify-content: space-between;
  gap: 16px;
}

.travel-title-row span:not(.el-tag__content) {
  color: #7c3aed;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.11em;
}

.travel-title-row h2 {
  margin-top: 2px;
  color: var(--weather-navy);
  font-size: 1.35rem;
}

.travel-meta {
  gap: 15px;
  margin-top: 11px;
  color: var(--weather-muted);
  font-size: 0.78rem;
}

.travel-meta span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.official-warning-note {
  gap: 7px;
  margin-top: 11px;
  padding: 9px 11px;
  color: #b91c1c;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  border-radius: 10px;
  font-size: 0.76rem;
  font-weight: 800;
}

.travel-action-row {
  justify-content: space-between;
  gap: 14px;
  margin-top: 14px;
  padding-top: 13px;
  border-top: 1px solid var(--weather-border);
}

.travel-action-row p {
  color: var(--weather-muted);
  font-size: 0.8rem;
}

.travel-action-row .el-button {
  gap: 5px;
  flex-shrink: 0;
}

@media (max-width: 680px) {
  .next-travel-card {
    grid-template-columns: 1fr;
  }

  .travel-visual {
    min-height: 130px;
  }

  .travel-title-row,
  .travel-action-row,
  .travel-meta {
    align-items: flex-start;
    flex-direction: column;
  }

  .travel-action-row .el-button {
    width: 100%;
  }
}
</style>
