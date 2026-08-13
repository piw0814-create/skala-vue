<script setup>
import { computed, onMounted } from 'vue'
import { ArrowLeft, Building2, Droplets, Flame, Snowflake, Thermometer, Wind } from '@lucide/vue'
import { useRouter } from 'vue-router'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

import { useWeatherStore } from '@/stores/weatherStore'
import { useConfigStore } from '@/stores/configStore'
import { useTemperature } from '@/composables/useTemperature'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, LegendComponent])

const router = useRouter()
const weatherStore = useWeatherStore()
const configStore = useConfigStore()

// 온도를 현재 설정 단위로 변환
const { convertTemp, formatTemp } = useTemperature()

const chartOption = computed(() => {
  const cities = weatherStore.weatherWithFeelsLike

  return {
    color: ['#2563eb', '#f97316'],
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value) => `${value}${configStore.unitSymbol}`,
    },
    legend: {
      bottom: 0,
      data: ['현재 기온', '체감온도'],
    },
    grid: {
      top: 24,
      right: 16,
      bottom: 54,
      left: 48,
    },
    xAxis: {
      type: 'category',
      data: cities.map((city) => city.name),
      axisTick: { show: false },
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisLabel: { color: '#64748b' },
    },
    yAxis: {
      type: 'value',
      name: configStore.unitSymbol,
      axisLabel: { color: '#64748b' },
      splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } },
    },
    series: [
      {
        name: '현재 기온',
        type: 'bar',
        data: cities.map((city) => convertTemp(city.temp)),
        barMaxWidth: 24,
        itemStyle: { borderRadius: [6, 6, 0, 0] },
      },
      {
        name: '체감온도',
        type: 'bar',
        data: cities.map((city) => convertTemp(city.feelsLike)),
        barMaxWidth: 24,
        itemStyle: { borderRadius: [6, 6, 0, 0] },
      },
    ],
  }
})

// 상세페이지 이동
const goToDetail = (city) => {
  router.push('/weather/' + city.id)
}

// 메인 이동
const handleGoHome = () => {
  router.push('/')
}

onMounted(() => {
  if (weatherStore.weatherList.length === 0 && !weatherStore.isLoading) {
    weatherStore.fetchWeatherList()
  }
})
</script>

<template>
  <div class="stats-container">
    <section class="page-heading">
      <div>
        <p class="page-eyebrow">WEATHER ANALYTICS</p>
        <h1>날씨 통계</h1>
        <p>Pinia Getter로 계산한 전국 도시 관측값을 비교합니다.</p>
      </div>

      <el-button plain round @click="handleGoHome">
        <ArrowLeft :size="16" />
        대시보드
      </el-button>
    </section>

    <section v-if="weatherStore.isLoading" class="surface-card">
      <el-skeleton :rows="10" animated />
    </section>

    <section v-else-if="weatherStore.errorMessage" class="surface-card">
      <el-alert :title="weatherStore.errorMessage" type="error" show-icon :closable="false" />
    </section>

    <template v-else-if="weatherStore.cityCount > 0">
      <section class="stat-grid">
        <div class="stat-card blue-card">
          <Building2 :size="22" />
          <el-statistic title="관측 도시" :value="weatherStore.cityCount" suffix="개" />
        </div>

        <div class="stat-card orange-card">
          <Thermometer :size="22" />
          <el-statistic title="평균 기온" :value="convertTemp(weatherStore.averageTemp)" :suffix="configStore.unitSymbol" />
        </div>

        <div class="stat-card cyan-card">
          <Droplets :size="22" />
          <el-statistic title="평균 습도" :value="weatherStore.averageHumidity" suffix="%" />
        </div>

        <div class="stat-card violet-card">
          <Wind :size="22" />
          <el-statistic title="평균 풍속" :value="weatherStore.averageWind" suffix="m/s" />
        </div>
      </section>

      <section class="surface-card chart-panel">
        <div class="section-heading">
          <div>
            <span class="section-kicker">CITY COMPARISON</span>
            <h2>도시별 기온 비교</h2>
          </div>

          <el-tag effect="plain" round>{{ configStore.unit === 'celsius' ? '섭씨 기준' : '화씨 기준' }}</el-tag>
        </div>

        <VChart class="weather-chart" :option="chartOption" autoresize />
      </section>

      <section class="extreme-grid">
        <article class="extreme-card hot-card">
          <span class="extreme-icon"><Flame :size="23" /></span>
          <p>최고 기온 도시</p>
          <h3>{{ weatherStore.hottestCity.name }}</h3>
          <strong>{{ formatTemp(weatherStore.hottestCity.temp) }}</strong>
          <el-button type="danger" plain round size="small" @click="goToDetail(weatherStore.hottestCity)">상세보기</el-button>
        </article>

        <article class="extreme-card cold-card">
          <span class="extreme-icon"><Snowflake :size="23" /></span>
          <p>최저 기온 도시</p>
          <h3>{{ weatherStore.coldestCity.name }}</h3>
          <strong>{{ formatTemp(weatherStore.coldestCity.temp) }}</strong>
          <el-button type="primary" plain round size="small" @click="goToDetail(weatherStore.coldestCity)">상세보기</el-button>
        </article>

        <article class="extreme-card feels-card">
          <span class="extreme-icon"><Thermometer :size="23" /></span>
          <p>최고 체감온도 도시</p>
          <h3>{{ weatherStore.hottestFeelsLikeCity.name }}</h3>
          <strong>{{ formatTemp(weatherStore.hottestFeelsLikeCity.feelsLike) }}</strong>
          <el-button type="warning" plain round size="small" @click="goToDetail(weatherStore.hottestFeelsLikeCity)">상세보기</el-button>
        </article>
      </section>
    </template>

    <section v-else class="surface-card">
      <el-empty description="표시할 날씨 통계 데이터가 없습니다." />
    </section>
  </div>
</template>

<style scoped>
.stats-container {
  display: grid;
  gap: 18px;
}

.page-heading,
.section-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.page-heading {
  margin-bottom: 6px;
}

.page-heading h1 {
  margin: 2px 0 6px;
  color: var(--weather-navy);
  font-size: clamp(1.7rem, 4vw, 2.3rem);
  letter-spacing: -0.04em;
}

.page-heading p:not(.page-eyebrow) {
  color: var(--weather-muted);
}

.page-heading .el-button {
  gap: 6px;
}

.page-eyebrow,
.section-kicker {
  color: var(--weather-primary);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.surface-card {
  padding: 24px;
  background: var(--weather-surface);
  border: 1px solid var(--weather-border);
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(51, 65, 85, 0.06);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 13px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 19px;
  border: 1px solid transparent;
  border-radius: 15px;
}

.stat-card :deep(.el-statistic__head) {
  margin-bottom: 1px;
  color: var(--weather-muted);
  font-size: 0.75rem;
}

.stat-card :deep(.el-statistic__number),
.stat-card :deep(.el-statistic__suffix) {
  color: var(--weather-navy);
  font-weight: 800;
}

.blue-card {
  color: #2563eb;
  background: #eff6ff;
  border-color: #bfdbfe;
}

.orange-card {
  color: #ea580c;
  background: #fff7ed;
  border-color: #fed7aa;
}

.cyan-card {
  color: #0891b2;
  background: #ecfeff;
  border-color: #a5f3fc;
}

.violet-card {
  color: #7c3aed;
  background: #f5f3ff;
  border-color: #ddd6fe;
}

.section-heading {
  align-items: flex-end;
  margin-bottom: 12px;
}

.section-heading h2 {
  margin-top: 2px;
  color: var(--weather-navy);
  font-size: 1.25rem;
}

.weather-chart {
  width: 100%;
  height: 390px;
}

.extreme-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.extreme-card {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  padding: 21px;
  background: #ffffff;
  border: 1px solid var(--weather-border);
  border-radius: 16px;
}

.extreme-icon {
  display: grid;
  width: 42px;
  height: 42px;
  margin-bottom: 12px;
  border-radius: 13px;
  place-items: center;
}

.extreme-card p {
  color: var(--weather-muted);
  font-size: 0.78rem;
}

.extreme-card h3 {
  margin: 1px 0;
  color: var(--weather-navy);
  font-size: 1.18rem;
}

.extreme-card > strong {
  margin-bottom: 15px;
  font-size: 1.6rem;
}

.extreme-card .el-button {
  margin-top: auto;
}

.hot-card .extreme-icon {
  color: #dc2626;
  background: #fef2f2;
}

.hot-card > strong {
  color: #dc2626;
}

.cold-card .extreme-icon {
  color: #2563eb;
  background: #eff6ff;
}

.cold-card > strong {
  color: #2563eb;
}

.feels-card .extreme-icon {
  color: #d97706;
  background: #fffbeb;
}

.feels-card > strong {
  color: #d97706;
}

@media (max-width: 900px) {
  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .page-heading,
  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .extreme-grid {
    grid-template-columns: 1fr;
  }

  .weather-chart {
    height: 340px;
  }
}

@media (max-width: 430px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
