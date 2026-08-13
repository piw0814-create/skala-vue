<script setup>
import { ArrowRight, ChartNoAxesCombined, CloudRainWind, Compass, ShieldCheck, Sparkles } from '@lucide/vue'

defineProps({
  weatherSummary: {
    type: Object,
    default: null,
  },
  isWeatherLoading: {
    type: Boolean,
    default: false,
  },
  weatherError: {
    type: String,
    default: '',
  },
  warningCount: {
    type: Number,
    default: 0,
  },
  majorWarnings: {
    type: Array,
    default: () => [],
  },
  isWarningLoading: {
    type: Boolean,
    default: false,
  },
  warningError: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['enter-dashboard', 'open-travel', 'open-warnings'])
</script>

<template>
  <section class="weather-intro" aria-labelledby="intro-title">
    <div class="intro-atmosphere" aria-hidden="true">
      <i v-for="index in 18" :key="index"></i>
    </div>

    <header class="intro-header">
      <div class="intro-brand">
        <span><CloudRainWind :size="26" /></span>
        <div>
          <small>SKALA WEATHER</small>
          <strong>생활·여행 날씨 코치</strong>
        </div>
      </div>

      <span class="intro-live"><i></i> LIVE DATA</span>
    </header>

    <div class="intro-content">
      <div class="intro-copy">
        <p class="intro-eyebrow"><Sparkles :size="15" /> WEATHER FOR YOUR DAY</p>
        <h1 id="intro-title">
          <span>날씨를 보는 것에서</span>
          <em>오늘을 준비하는 것까지.</em>
        </h1>
        <p class="intro-description">실시간 도시 날씨, 생활 주의 요소, 여행 기간 예보와 기상청 공식 특보를 한곳에서 빠르게 확인하세요.</p>

        <div class="intro-actions">
          <button type="button" class="intro-primary" @click="emit('enter-dashboard')">
            오늘 날씨 시작하기
            <ArrowRight :size="18" />
          </button>
          <button type="button" class="intro-secondary" @click="emit('open-travel')">
            <Compass :size="17" />
            여행 계획하기
          </button>
        </div>
      </div>

      <div class="intro-preview" aria-label="서비스 핵심 기능">
        <div class="preview-orbit orbit-one"></div>
        <div class="preview-orbit orbit-two"></div>

        <article class="preview-main-card">
          <span class="preview-label">TODAY · SOUTH KOREA</span>
          <div class="preview-weather-row">
            <div>
              <p v-if="weatherSummary">전국 {{ weatherSummary.cityCount }}개 도시 평균</p>
              <p v-else-if="isWeatherLoading">전국 도시 날씨 집계 중</p>
              <p v-else>{{ weatherError ? '날씨 데이터 연결 확인' : '전국 도시 날씨' }}</p>
              <strong>{{ weatherSummary?.averageTemp ?? (isWeatherLoading ? '···' : '-') }}</strong>
              <small class="preview-status">{{ weatherSummary?.representativeStatus ?? (weatherError ? '조회하지 못함' : '정보 준비 중') }}</small>
            </div>
            <CloudRainWind :size="58" />
          </div>
          <div class="preview-metrics">
            <span>
              평균 습도
              <strong>{{ weatherSummary?.averageHumidity ?? '-' }}</strong>
            </span>
            <span>
              평균 풍속
              <strong>{{ weatherSummary?.averageWind ?? '-' }}</strong>
            </span>
            <span>
              관측 도시
              <strong>{{ weatherSummary ? `${weatherSummary.cityCount}곳` : '-' }}</strong>
            </span>
          </div>
        </article>

        <button type="button" class="preview-float-card safety-card" aria-label="안전 센터에서 공식 특보 확인" @click="emit('open-warnings')">
          <ShieldCheck :size="19" />
          <div>
            <small>기상청 주요 특보</small>
            <strong v-if="isWarningLoading">특보 현황 확인 중</strong>
            <strong v-else-if="warningError">특보 정보를 확인해 주세요</strong>
            <strong v-else-if="majorWarnings.length > 0" :title="majorWarnings.map((warning) => warning.title).join(', ')">
              {{ majorWarnings.map((warning) => warning.title).join(' · ') }}
            </strong>
            <strong v-else>현재 발효된 특보 없음</strong>
            <span v-if="!isWarningLoading && !warningError && warningCount > 0">전체 {{ warningCount }}건 · 안전 센터 보기</span>
          </div>
          <ArrowRight :size="15" class="safety-arrow" />
        </button>

        <article class="preview-float-card coach-card">
          <ChartNoAxesCombined :size="19" />
          <div>
            <small>생활 날씨 코치</small>
            <strong>주의 요소와 준비물</strong>
          </div>
        </article>
      </div>
    </div>

    <footer class="intro-footer">
      <span>OPENWEATHER · KMA · OPEN-METEO</span>
      <span>Vue 3 Interactive Weather Dashboard</span>
    </footer>
  </section>
</template>

<style scoped>
.weather-intro {
  position: fixed;
  inset: 0;
  z-index: 5000;
  display: flex;
  min-width: 320px;
  min-height: 100vh;
  overflow: hidden;
  color: #f3fbf8;
  background:
    linear-gradient(110deg, rgba(4, 24, 23, 0.98) 0%, rgba(11, 45, 42, 0.92) 54%, rgba(31, 74, 68, 0.82) 100%), radial-gradient(circle at 78% 15%, rgba(175, 222, 211, 0.2), transparent 28%), #071f1e;
  flex-direction: column;
  isolation: isolate;
}

.weather-intro::before,
.weather-intro::after {
  position: absolute;
  z-index: -1;
  content: '';
  border-radius: 50%;
  filter: blur(4px);
}

.weather-intro::before {
  top: -24vw;
  right: -11vw;
  width: 72vw;
  height: 72vw;
  background: radial-gradient(circle, rgba(117, 187, 172, 0.25), rgba(47, 101, 93, 0.05) 56%, transparent 70%);
}

.weather-intro::after {
  bottom: -32vw;
  left: 12vw;
  width: 62vw;
  height: 62vw;
  border: 1px solid rgba(201, 239, 230, 0.09);
  box-shadow:
    0 0 0 8vw rgba(181, 224, 214, 0.025),
    0 0 0 18vw rgba(181, 224, 214, 0.018);
}

.intro-atmosphere {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  opacity: 0.68;
}

.intro-atmosphere i {
  position: absolute;
  top: -15%;
  width: 1px;
  height: 19vh;
  background: linear-gradient(transparent, rgba(210, 239, 232, 0.22), transparent);
  transform: rotate(17deg);
  animation: rain-line 9s linear infinite;
}

.intro-atmosphere i:nth-child(1) {
  left: 4%;
  animation-delay: -1s;
}
.intro-atmosphere i:nth-child(2) {
  left: 10%;
  animation-delay: -5s;
}
.intro-atmosphere i:nth-child(3) {
  left: 16%;
  animation-delay: -3s;
}
.intro-atmosphere i:nth-child(4) {
  left: 23%;
  animation-delay: -8s;
}
.intro-atmosphere i:nth-child(5) {
  left: 30%;
  animation-delay: -2s;
}
.intro-atmosphere i:nth-child(6) {
  left: 36%;
  animation-delay: -6s;
}
.intro-atmosphere i:nth-child(7) {
  left: 43%;
  animation-delay: -4s;
}
.intro-atmosphere i:nth-child(8) {
  left: 49%;
  animation-delay: -9s;
}
.intro-atmosphere i:nth-child(9) {
  left: 55%;
  animation-delay: -1.5s;
}
.intro-atmosphere i:nth-child(10) {
  left: 61%;
  animation-delay: -5.5s;
}
.intro-atmosphere i:nth-child(11) {
  left: 67%;
  animation-delay: -7s;
}
.intro-atmosphere i:nth-child(12) {
  left: 73%;
  animation-delay: -2.5s;
}
.intro-atmosphere i:nth-child(13) {
  left: 79%;
  animation-delay: -6.5s;
}
.intro-atmosphere i:nth-child(14) {
  left: 84%;
  animation-delay: -4.5s;
}
.intro-atmosphere i:nth-child(15) {
  left: 89%;
  animation-delay: -8.5s;
}
.intro-atmosphere i:nth-child(16) {
  left: 93%;
  animation-delay: -3.5s;
}
.intro-atmosphere i:nth-child(17) {
  left: 97%;
  animation-delay: -7.5s;
}
.intro-atmosphere i:nth-child(18) {
  left: 52%;
  animation-delay: -0.5s;
}

.intro-header,
.intro-footer,
.intro-content {
  width: min(1540px, 100%);
  margin: 0 auto;
}

.intro-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 28px clamp(24px, 5vw, 76px);
}

.intro-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.intro-brand > span {
  display: grid;
  width: 44px;
  height: 44px;
  color: #133c38;
  background: #d7ebe6;
  border-radius: 13px;
  place-items: center;
}

.intro-brand div {
  display: flex;
  flex-direction: column;
}

.intro-brand small,
.intro-label,
.intro-eyebrow,
.intro-footer {
  font-size: 0.66rem;
  font-weight: 850;
  letter-spacing: 0.16em;
}

.intro-brand small {
  color: #91bbb2;
}

.intro-brand strong {
  margin-top: 1px;
  font-size: 0.92rem;
}

.intro-live {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 11px;
  color: #c5ddd7;
  border: 1px solid rgba(205, 237, 230, 0.17);
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.intro-live i {
  width: 7px;
  height: 7px;
  background: #79d5bb;
  border-radius: 50%;
  box-shadow: 0 0 0 5px rgba(121, 213, 187, 0.1);
}

.intro-content {
  display: grid;
  align-items: center;
  grid-template-columns: minmax(0, 1fr) minmax(420px, 0.9fr);
  gap: clamp(42px, 8vw, 130px);
  flex: 1;
  padding: 44px clamp(24px, 7vw, 110px) 70px;
}

.intro-copy {
  max-width: 760px;
}

.intro-eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8ed2c3;
}

.intro-copy h1 {
  margin-top: 20px;
  color: #f8fdfb;
  font-size: clamp(3rem, 4.8vw, 5.6rem);
  font-weight: 470;
  line-height: 1.02;
  letter-spacing: -0.07em;
}

.intro-copy h1 span,
.intro-copy h1 em {
  display: block;
  white-space: nowrap;
}

.intro-copy h1 em {
  color: #acd9cf;
  font-style: normal;
}

.intro-description {
  max-width: 610px;
  margin-top: 25px;
  color: #afc7c1;
  font-size: clamp(0.92rem, 1.3vw, 1.08rem);
  line-height: 1.75;
}

.intro-actions {
  display: flex;
  gap: 10px;
  margin-top: 34px;
  flex-wrap: wrap;
}

.intro-actions button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 48px;
  padding: 0 20px;
  color: #ffffff;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.84rem;
  font-weight: 780;
  transition: 180ms ease;
}

.intro-primary {
  background: #e7f4f0;
  border: 1px solid #e7f4f0;
  color: #103a36 !important;
}

.intro-primary:hover {
  background: #ffffff;
  transform: translateY(-2px);
}

.intro-secondary {
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.19);
  backdrop-filter: blur(14px);
}

.intro-secondary:hover {
  background: rgba(255, 255, 255, 0.13);
}

.intro-preview {
  position: relative;
  display: grid;
  min-height: 460px;
  place-items: center;
}

.preview-orbit {
  position: absolute;
  border: 1px solid rgba(186, 225, 216, 0.12);
  border-radius: 50%;
}

.orbit-one {
  width: 430px;
  height: 430px;
}

.orbit-two {
  width: 330px;
  height: 330px;
  border-style: dashed;
  animation: orbit-spin 45s linear infinite;
}

.preview-main-card {
  position: relative;
  z-index: 2;
  width: min(350px, 78%);
  padding: 27px;
  background: linear-gradient(150deg, rgba(223, 241, 236, 0.18), rgba(74, 132, 122, 0.08));
  border: 1px solid rgba(221, 242, 236, 0.2);
  border-radius: 24px;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(24px);
  transform: rotate(-3deg);
}

.preview-label {
  color: #a8d2c8;
  font-size: 0.63rem;
  font-weight: 850;
  letter-spacing: 0.15em;
}

.preview-weather-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 32px;
}

.preview-weather-row p {
  color: #b7cdc7;
  font-size: 0.78rem;
}

.preview-weather-row strong {
  display: block;
  margin-top: 3px;
  font-size: 2.2rem;
  font-weight: 550;
  letter-spacing: -0.05em;
}

.preview-status {
  display: block;
  max-width: 190px;
  margin-top: 5px;
  overflow: hidden;
  color: #9fc0b8;
  font-size: 0.7rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-top: 27px;
}

.preview-metrics span {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 9px 4px;
  color: #b8cfca;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 8px;
  font-size: 0.65rem;
  text-align: center;
}

.preview-metrics strong {
  color: #f1faf7;
  font-size: 0.72rem;
}

.preview-float-card {
  position: absolute;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 215px;
  padding: 13px 15px;
  background: rgba(6, 30, 28, 0.72);
  border: 1px solid rgba(209, 239, 232, 0.18);
  border-radius: 13px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(18px);
  text-align: left;
}

.preview-float-card div {
  display: flex;
  flex-direction: column;
}

.preview-float-card small {
  color: #91aaa4;
  font-size: 0.62rem;
}

.preview-float-card strong {
  display: block;
  max-width: 250px;
  margin-top: 2px;
  overflow: hidden;
  font-size: 0.75rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-float-card div > span {
  margin-top: 3px;
  color: #91aaa4;
  font-size: 0.59rem;
}

.safety-card {
  top: 66px;
  right: 0;
  min-width: 275px;
  color: #ffc8a3;
  cursor: pointer;
  transition: 180ms ease;
}

.safety-card:hover {
  background: rgba(14, 49, 45, 0.9);
  border-color: rgba(255, 200, 163, 0.34);
  transform: translateY(-2px);
}

.safety-card div {
  min-width: 0;
  flex: 1;
}

.safety-arrow {
  flex-shrink: 0;
}

.coach-card {
  bottom: 62px;
  left: -5px;
  color: #9bd8ca;
}

.intro-footer {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 20px clamp(24px, 5vw, 76px);
  color: #789b94;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.58rem;
}

@keyframes rain-line {
  from {
    transform: translateY(-30vh) rotate(17deg);
  }
  to {
    transform: translateY(140vh) rotate(17deg);
  }
}

@keyframes orbit-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 960px) {
  .intro-content {
    grid-template-columns: 1fr;
    gap: 30px;
    overflow-y: auto;
  }

  .intro-copy {
    width: 100%;
    min-width: 0;
    overflow: hidden;
    text-align: center;
    margin-inline: auto;
  }

  .intro-eyebrow,
  .intro-actions {
    justify-content: center;
  }

  .intro-preview {
    min-height: 330px;
  }

  .orbit-one {
    width: 320px;
    height: 320px;
  }

  .orbit-two {
    width: 250px;
    height: 250px;
  }

  .safety-card {
    top: 18px;
    right: 10%;
  }

  .coach-card {
    bottom: 18px;
    left: 10%;
  }
}

@media (max-width: 620px) {
  .weather-intro,
  .intro-header,
  .intro-content,
  .intro-footer {
    width: 100%;
    max-width: 100vw;
  }

  .intro-header {
    padding: 18px;
  }

  .intro-content {
    display: block;
    padding: 38px 18px 30px;
  }

  .intro-copy h1 {
    width: 100%;
    font-size: clamp(2rem, 9vw, 2.35rem);
    line-height: 1.08;
  }

  .intro-copy h1 span,
  .intro-copy h1 em {
    width: 100%;
    max-width: 100%;
    white-space: normal;
    word-break: keep-all;
    overflow-wrap: anywhere;
  }

  .intro-description {
    font-size: 0.84rem;
  }

  .intro-actions {
    display: grid;
  }

  .intro-preview {
    display: grid;
    gap: 10px;
    min-height: 0;
    margin-top: 28px;
    place-items: stretch;
  }

  .preview-orbit,
  .coach-card {
    display: none;
  }

  .preview-main-card {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    padding: 22px;
    transform: none;
  }

  .preview-weather-row {
    margin-top: 22px;
  }

  .preview-float-card {
    position: static;
    width: 100%;
    max-width: 100%;
  }

  .preview-metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .preview-metrics span {
    min-width: 0;
  }

  .safety-card {
    min-width: 0;
  }

  .intro-footer {
    align-items: flex-start;
    flex-direction: column;
    padding: 15px 18px;
  }

  .intro-footer span {
    max-width: 100%;
    overflow-wrap: anywhere;
  }

  .intro-live {
    padding: 7px;
    font-size: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .intro-atmosphere i,
  .orbit-two {
    animation: none;
  }
}
</style>
