<script setup>
import { computed, ref } from 'vue'
import { Clock3, PackageCheck, RefreshCw, ShieldCheck, Sparkles, TriangleAlert } from '@lucide/vue'

import OfficialWeatherAlert from '@/components/OfficialWeatherAlert.vue'
import { useTemperature } from '@/composables/useTemperature'
import { useTravelCoach } from '@/composables/useTravelCoach'
import { roundNumber } from '@/utils/numberFormat'

const props = defineProps({
  city: {
    type: Object,
    default: null,
  },
  dailyForecast: {
    type: Object,
    default: null,
  },
  hourlyForecast: {
    type: Array,
    default: () => [],
  },
  forecastSource: {
    type: String,
    default: '',
  },
  isFallbackForecast: {
    type: Boolean,
    default: false,
  },
  fallbackMessage: {
    type: String,
    default: '',
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  officialWarnings: {
    type: Array,
    default: () => [],
  },
  officialWarningIssuedAt: {
    type: [Number, String],
    default: null,
  },
  officialWarningLoading: {
    type: Boolean,
    default: false,
  },
  officialWarningError: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['request-forecast', 'refresh-official-warnings'])

const activityProfiles = [
  { id: 'outdoor', label: '야외활동', coachType: 'city-tour', hourRanges: [[6, 22]], description: '산책·러닝 등 야외활동에 영향을 줄 수 있는 날씨와 준비물을 정리합니다.' },
  { id: 'laundry', label: '빨래', coachType: 'city-tour', hourRanges: [[8, 20]], description: '야외 건조에 영향을 주는 비·눈·바람과 필요한 준비를 확인합니다.' },
  {
    id: 'commute',
    label: '출퇴근',
    coachType: 'drive',
    hourRanges: [
      [6, 10],
      [16, 21],
    ],
    description: '시간 변경을 권하지 않고 오전·오후 출퇴근 시간의 주의 요소만 안내합니다.',
  },
]

const selectedActivityId = ref('outdoor')

const selectedActivity = computed(() => {
  return activityProfiles.find((activity) => activity.id === selectedActivityId.value) ?? activityProfiles[0]
})

const mappedCoachType = computed(() => selectedActivity.value.coachType)

const activityHourlyForecast = computed(() => {
  return props.hourlyForecast.filter((hour) => {
    const hourNumber = Number(hour.time.slice(11, 13))
    return selectedActivity.value.hourRanges.some(([start, end]) => hourNumber >= start && hourNumber < end)
  })
})

const firstAvailableForecastHour = computed(() => {
  const firstTime = activityHourlyForecast.value[0]?.time

  return firstTime ? `${firstTime.slice(11, 13)}시` : ''
})

const fallbackForecastDescription = computed(() => {
  if (!firstAvailableForecastHour.value) {
    return '대체 예보는 3시간 간격 자료를 코칭용 시간 단위로 환산한 참고값입니다.'
  }

  return `오늘 분석 가능한 첫 예보는 ${firstAvailableForecastHour.value}입니다. 이 시각부터 주의 조건이 확인된 항목은 실제 시작 시각이 아니라 '첫 예보부터 감지'로 표시합니다.`
})

const getNumbers = (values) => values.filter(Number.isFinite)

const getMax = (values) => {
  const numbers = getNumbers(values)
  return numbers.length > 0 ? Math.max(...numbers) : null
}

const getMin = (values) => {
  const numbers = getNumbers(values)
  return numbers.length > 0 ? Math.min(...numbers) : null
}

const getSum = (values) => {
  const numbers = getNumbers(values)
  return numbers.length > 0
    ? roundNumber(
        numbers.reduce((sum, value) => sum + value, 0),
        2,
      )
    : null
}

const activityDailyForecast = computed(() => {
  if (!props.dailyForecast || activityHourlyForecast.value.length === 0) {
    return props.dailyForecast
  }

  const hours = activityHourlyForecast.value

  return {
    ...props.dailyForecast,
    tempMax: getMax(hours.map((hour) => hour.temp)),
    tempMin: getMin(hours.map((hour) => hour.temp)),
    feelsLikeMax: getMax(hours.map((hour) => hour.feelsLike)),
    feelsLikeMin: getMin(hours.map((hour) => hour.feelsLike)),
    precipitationSum: getSum(hours.map((hour) => hour.precipitation)),
    precipitationProbabilityMax: getMax(hours.map((hour) => hour.precipitationProbability)),
    snowfallSum: getSum(hours.map((hour) => hour.snowfall)),
    windMax: getMax(hours.map((hour) => hour.wind)),
    windGustMax: getMax(hours.map((hour) => hour.windGust)),
    uvIndexMax: getMax(hours.map((hour) => hour.uvIndex)),
  }
})

const { risks, packingItems } = useTravelCoach({
  dailyForecast: activityDailyForecast,
  hourlyForecast: activityHourlyForecast,
  travelType: mappedCoachType,
})

const { formatTemp } = useTemperature()

const hasForecast = computed(() => Boolean(props.dailyForecast && props.hourlyForecast.length > 0))

const getLifeRiskAction = (risk) => {
  const activityActions = {
    outdoor: {
      precipitation: '우산이나 우비를 챙기고 젖은 노면과 미끄러운 구간을 주의하세요.',
      wind: '강변·교량처럼 바람에 노출된 곳을 피하고 간판과 나뭇가지 등 낙하물을 주의하세요.',
      visibility: '밝은 색상이나 반사 소재 의류를 착용해 차량과 자전거에 잘 보이도록 하세요.',
      snow: '결빙된 보행로와 코스를 피하고 미끄럼 방지 신발을 준비하세요.',
      'air-quality': '대기질이 나쁜 시간은 장시간 야외활동을 줄이고 필요하면 보건용 마스크를 챙기세요.',
      heat: '한낮 활동을 줄이고 물을 챙겨 그늘에서 자주 쉬세요.',
      cold: '방한 의류를 챙기고 오래 머무르는 야외활동은 줄이세요.',
      uv: '선크림과 모자를 준비하고 자외선이 강한 시간에는 그늘을 이용하세요.',
    },
    laundry: {
      precipitation: '비가 시작되기 전에 세탁물을 거둘 수 있도록 실내 건조 공간을 준비하세요.',
      wind: '세탁물이 떨어지거나 날리지 않도록 강한 빨래집게로 고정하세요.',
      snow: '야외 건조 대신 실내 건조대나 건조 공간을 준비하세요.',
    },
    commute: {
      precipitation: '우산이나 우비를 챙기고 미끄러운 보행로와 교통 지연에 대비하세요.',
      wind: '간판과 낙하물을 주의하고 버스·지하철 등 교통 운행 정보를 확인하세요.',
      visibility: '횡단보도와 골목길에서 주변 차량을 충분히 확인하고 밝은 옷을 착용하세요.',
      snow: '미끄럼 방지 신발을 준비하고 대중교통 지연 및 도로 상황을 확인하세요.',
      'air-quality': '보건용 마스크를 준비하고 환승 대기 중 장시간 야외 노출을 줄이세요.',
      heat: '물을 챙기고 이동 중 그늘이나 냉방이 되는 공간에서 잠시 쉬세요.',
      cold: '장갑과 목도리 등 방한용품을 챙기고 정류장 대기 중 보온에 유의하세요.',
    },
  }

  return activityActions[selectedActivityId.value]?.[risk.id] ?? risk.action
}

const primaryRisks = computed(() => {
  let selectedRisks

  if (selectedActivityId.value === 'laundry') {
    selectedRisks = risks.value.filter((risk) => ['precipitation', 'wind', 'snow'].includes(risk.id)).slice(0, 3)
  } else {
    selectedRisks = risks.value.slice(0, 4)
  }

  return selectedRisks.map((risk) => ({
    ...risk,
    action: getLifeRiskAction(risk),
  }))
})

const preparationItems = computed(() => {
  if (selectedActivityId.value === 'laundry') {
    const items = []
    const riskIds = new Set(primaryRisks.value.map((risk) => risk.id))

    if (riskIds.has('precipitation') || riskIds.has('snow')) {
      items.push({ id: 'indoor-drying', label: '실내 건조대 또는 건조 공간', reason: '비나 눈이 시작될 때 바로 옮길 수 있도록 준비하세요.' })
    }

    if (riskIds.has('wind')) {
      items.push({ id: 'laundry-clips', label: '강한 빨래집게', reason: '바람에 세탁물이 떨어지거나 날리지 않도록 고정하세요.' })
    }

    return items
  }

  const excludedItemIds = new Set(['camping-light', 'camping-anchor', 'hiking-light', 'drive-kit'])
  const items = packingItems.value.filter((item) => !excludedItemIds.has(item.id))

  return items
})

const attentionTimes = computed(() => {
  return primaryRisks.value.map((risk) => {
    const startsAtFirstForecast = props.isFallbackForecast && firstAvailableForecastHour.value && risk.timeRange.startsWith(`${firstAvailableForecastHour.value}~`)

    return {
      id: risk.id,
      title: risk.title,
      timeRange: risk.timeRange,
      startsAtFirstForecast,
    }
  })
})

const getStatusTagType = (level) => {
  if (level === 'danger') {
    return 'danger'
  }

  if (level === 'caution') {
    return 'warning'
  }

  return 'success'
}

const handleRequestForecast = (forceRefresh = false) => {
  emit('request-forecast', forceRefresh)
}

const handleOfficialWarningRefresh = () => {
  emit('refresh-official-warnings')
}
</script>

<template>
  <section class="life-coach-panel">
    <div class="coach-heading">
      <span class="coach-icon"><Sparkles :size="24" /></span>
      <div>
        <span>TODAY'S LIFE COACH</span>
        <h2>오늘의 생활 날씨 코치</h2>
        <p>도시 카드 선택 후 활동 시간대의 주의 요소와 준비물을 확인하세요.</p>
      </div>

      <el-tag v-if="city" effect="plain" round>{{ city.name }} · 현재 {{ formatTemp(city.temp) }}</el-tag>
    </div>

    <div v-if="!city" class="select-city-state">
      <el-empty description="아래 도시 카드에서 코칭을 받을 지역을 먼저 선택해 주세요." :image-size="78" />
    </div>

    <template v-else>
      <OfficialWeatherAlert
        :warnings="officialWarnings"
        :issued-at="officialWarningIssuedAt"
        :is-loading="officialWarningLoading"
        :error-message="officialWarningError"
        :context-label="city.name"
        :show-safe="false"
        compact
        class="life-official-alert"
        @refresh="handleOfficialWarningRefresh"
      />

      <div class="activity-control">
        <span>오늘 할 일</span>
        <el-radio-group v-model="selectedActivityId" size="large">
          <el-radio-button v-for="activity in activityProfiles" :key="activity.id" :value="activity.id">
            {{ activity.label }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <el-alert
        v-if="hasForecast && isFallbackForecast"
        class="fallback-notice"
        :title="fallbackMessage || 'OpenWeather 대체 예보를 사용하고 있습니다.'"
        :description="fallbackForecastDescription"
        type="warning"
        show-icon
        :closable="false"
      />

      <div v-if="isLoading" class="coach-state">
        <el-skeleton :rows="4" animated />
      </div>

      <div v-else-if="errorMessage" class="coach-state error-state">
        <el-alert :title="errorMessage" type="error" show-icon :closable="false" />
        <el-button type="danger" plain round @click="handleRequestForecast(true)">
          <RefreshCw :size="15" />
          다시 시도
        </el-button>
      </div>

      <div v-else-if="!hasForecast" class="coach-state request-state">
        <p>{{ city.name }}의 시간별 예보를 조회하면 생활 날씨 대비 정보가 표시됩니다.</p>
        <el-button type="primary" round @click="handleRequestForecast(false)">
          <Sparkles :size="16" />
          오늘의 대비 정보 보기
        </el-button>
      </div>

      <div v-else class="coach-result">
        <div class="coach-context">
          <div>
            <span>WEATHER INFORMATION · {{ selectedActivity.label }}</span>
            <h3>{{ selectedActivity.label }} 날씨 대비 정보</h3>
            <p>{{ selectedActivity.description }}</p>
          </div>
          <el-tag effect="plain" round>예보 기반 정보</el-tag>
        </div>

        <div class="life-info-grid">
          <section class="attention-panel">
            <div class="info-heading">
              <TriangleAlert :size="20" />
              <div>
                <span>주의 요소</span>
                <h3>이 시간대에 확인하세요</h3>
              </div>
            </div>

            <div v-if="primaryRisks.length > 0" class="attention-list">
              <article v-for="risk in primaryRisks" :key="risk.id" class="attention-item" :class="`risk-${risk.level}`">
                <div>
                  <el-tag :type="getStatusTagType(risk.level)" effect="light" round size="small">
                    {{ risk.level === 'danger' ? '위험' : '주의' }}
                  </el-tag>
                  <strong>{{ risk.title }}</strong>
                </div>
                <p>{{ risk.reason }}</p>
                <small>{{ risk.action }}</small>
              </article>
            </div>

            <div v-else class="no-attention-message">
              <ShieldCheck :size="22" />
              <span>현재 설정 기준을 넘는 주요 주의 요소가 없습니다.</span>
            </div>
          </section>

          <div class="support-info-column">
            <section class="time-panel">
              <div class="info-heading">
                <Clock3 :size="20" />
                <div>
                  <span>오늘의 주의 구간</span>
                  <h3>오늘 언제 조심해야 하나요?</h3>
                </div>
              </div>

              <ul v-if="attentionTimes.length > 0">
                <li v-for="item in attentionTimes" :key="item.id">
                  <strong>{{ item.timeRange }}</strong>
                  <span>{{ item.title }}</span>
                  <small v-if="item.startsAtFirstForecast">대체 예보의 첫 제공 시각부터 조건이 확인됨</small>
                </li>
              </ul>
              <p v-else class="empty-info">별도로 표시할 주의 시간대가 없습니다.</p>
            </section>

            <section class="preparation-panel">
              <div class="info-heading">
                <PackageCheck :size="20" />
                <div>
                  <span>준비물</span>
                  <h3>미리 챙겨 두세요</h3>
                </div>
              </div>

              <ul v-if="preparationItems.length > 0">
                <li v-for="item in preparationItems" :key="item.id">
                  <strong>{{ item.label }}</strong>
                  <span>{{ item.reason }}</span>
                </li>
              </ul>
              <p v-else class="empty-info">현재 예보에서 추가로 권할 준비물이 없습니다.</p>
            </section>
          </div>
        </div>

        <div class="coach-footer">
          <span>기상청 공식 특보가 아닌 {{ forecastSource || '외부 예보' }} 기반 참고 정보입니다.</span>
          <el-button plain round size="small" @click="handleRequestForecast(true)">
            <RefreshCw :size="14" />
            예보 새로고침
          </el-button>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.life-coach-panel {
  padding: 24px;
  background: #ffffff;
  border: 1px solid var(--weather-border);
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(51, 65, 85, 0.06);
}

.coach-heading {
  display: flex;
  align-items: flex-start;
  gap: 13px;
}

.coach-heading > .el-tag {
  margin-left: auto;
}

.coach-icon {
  display: grid;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  color: #ffffff;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  border-radius: 13px;
  place-items: center;
}

.coach-heading span:not(.coach-icon) {
  color: #7c3aed;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.13em;
}

.coach-heading h2 {
  margin-top: 1px;
  color: var(--weather-navy);
  font-size: 1.28rem;
}

.coach-heading p {
  color: var(--weather-muted);
  font-size: 0.83rem;
}

.select-city-state {
  margin-top: 16px;
  border-top: 1px solid var(--weather-border);
}

.activity-control {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid var(--weather-border);
}

.fallback-notice {
  margin-top: 16px;
}

.life-official-alert {
  margin-top: 18px;
}

.activity-control > span {
  color: var(--weather-navy);
  font-weight: 800;
  white-space: nowrap;
}

.activity-control :deep(.el-radio-group) {
  display: flex;
  width: 100%;
}

.activity-control :deep(.el-radio-button) {
  flex: 1;
}

.activity-control :deep(.el-radio-button__inner) {
  width: 100%;
}

.coach-state {
  margin-top: 16px;
  padding: 18px;
  background: var(--weather-surface-soft);
  border-radius: 13px;
}

.error-state,
.request-state {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.error-state {
  align-items: stretch;
  flex-direction: column;
}

.error-state .el-button {
  align-self: flex-start;
}

.request-state p {
  color: var(--weather-muted);
}

.request-state .el-button,
.error-state .el-button,
.coach-footer .el-button {
  gap: 6px;
}

.coach-result {
  display: grid;
  gap: 13px;
  margin-top: 16px;
}

.coach-context {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 17px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 14px;
}

.coach-context span {
  color: var(--weather-primary);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.coach-context h3 {
  margin: 1px 0 2px;
  color: var(--weather-navy);
  font-size: 1.16rem;
}

.coach-context p {
  color: var(--weather-muted);
  font-size: 0.8rem;
}

.life-info-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 11px;
  align-items: start;
}

.attention-panel,
.time-panel,
.preparation-panel {
  padding: 17px;
  background: #ffffff;
  border: 1px solid var(--weather-border);
  border-radius: 13px;
}

.info-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--weather-primary);
}

.info-heading > svg {
  flex-shrink: 0;
}

.info-heading span {
  color: var(--weather-primary);
  font-size: 0.66rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.info-heading h3 {
  margin-top: 1px;
  color: var(--weather-navy);
  font-size: 0.96rem;
}

.attention-list {
  display: grid;
  gap: 9px;
  margin-top: 14px;
}

.attention-item {
  padding: 13px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 11px;
}

.attention-item.risk-danger {
  background: #fff1f2;
  border-color: #fecdd3;
}

.attention-item > div {
  display: flex;
  align-items: center;
  gap: 7px;
}

.attention-item strong {
  color: var(--weather-navy);
  font-size: 0.84rem;
}

.attention-item p {
  margin-top: 7px;
  color: var(--weather-text);
  font-size: 0.76rem;
}

.attention-item small {
  display: block;
  margin-top: 5px;
  color: var(--weather-muted);
  font-size: 0.7rem;
  line-height: 1.5;
}

.no-attention-message {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding: 16px;
  color: #166534;
  background: #ecfdf5;
  border-radius: 11px;
  font-size: 0.78rem;
  font-weight: 700;
}

.support-info-column {
  display: grid;
  gap: 11px;
}

.time-panel ul,
.preparation-panel ul {
  display: grid;
  gap: 8px;
  margin-top: 13px;
  padding: 0;
  list-style: none;
}

.time-panel li,
.preparation-panel li {
  display: flex;
  flex-direction: column;
  padding: 10px 11px;
  background: var(--weather-surface-soft);
  border-radius: 9px;
}

.time-panel li strong,
.preparation-panel li strong {
  color: var(--weather-navy);
  font-size: 0.78rem;
}

.time-panel li span,
.preparation-panel li span,
.empty-info {
  color: var(--weather-muted);
  font-size: 0.7rem;
}

.time-panel li small {
  margin-top: 4px;
  color: #b45309;
  font-size: 0.66rem;
}

.empty-info {
  margin-top: 13px;
  padding: 13px;
  background: var(--weather-surface-soft);
  border-radius: 9px;
  text-align: center;
}

.coach-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--weather-muted);
  font-size: 0.72rem;
}

@media (max-width: 720px) {
  .coach-heading,
  .activity-control,
  .request-state,
  .coach-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .coach-heading > .el-tag {
    margin-left: 57px;
  }

  .activity-control :deep(.el-radio-group) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 7px;
  }

  .activity-control :deep(.el-radio-button__inner) {
    border: 1px solid var(--weather-border);
    border-radius: 9px;
    box-shadow: none;
  }

  .request-state .el-button {
    width: 100%;
  }

  .life-info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 500px) {
  .coach-context {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
