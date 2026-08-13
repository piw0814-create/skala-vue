<script setup>
import { ArrowLeft, Boxes, Cloud, Database, Route, Sparkles } from '@lucide/vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleGoHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="about-container">
    <section class="page-heading">
      <div>
        <p class="page-eyebrow">ABOUT PROJECT</p>
        <h1>서비스 소개</h1>
        <p>Vue 수업에서 배운 개념을 실제 날씨 데이터와 연결한 학습 프로젝트입니다.</p>
      </div>

      <el-button plain round @click="handleGoHome">
        <ArrowLeft :size="16" />
        대시보드
      </el-button>
    </section>

    <section class="about-hero">
      <span class="hero-icon"><Sparkles :size="30" /></span>
      <div>
        <span>HANDS-ON WEATHER DASHBOARD</span>
        <h2>기능을 만드는 과정에서 Vue의 반응형 흐름을 확인합니다.</h2>
        <p>완성된 서비스만을 목표로 하지 않고 Component, Router, Store, API 통신의 역할을 코드에서 직접 확인할 수 있도록 구성했습니다.</p>
      </div>
    </section>

    <section class="concept-grid">
      <article>
        <span class="concept-icon blue"><Boxes :size="23" /></span>
        <h3>Component</h3>
        <p>Props와 Emits, Slot으로 화면과 이벤트의 역할을 분리했습니다.</p>
        <div class="tag-list">
          <el-tag size="small" effect="plain">Props</el-tag>
          <el-tag size="small" effect="plain">Emits</el-tag>
          <el-tag size="small" effect="plain">Scoped Slot</el-tag>
        </div>
      </article>

      <article>
        <span class="concept-icon violet"><Route :size="23" /></span>
        <h3>Vue Router</h3>
        <p>URL과 View를 연결하고 새로고침 없이 필요한 화면을 교체합니다.</p>
        <div class="tag-list">
          <el-tag size="small" type="info" effect="plain">RouterLink</el-tag>
          <el-tag size="small" type="info" effect="plain">Dynamic Route</el-tag>
        </div>
      </article>

      <article>
        <span class="concept-icon green"><Database :size="23" /></span>
        <h3>Pinia Store</h3>
        <p>여러 View가 사용하는 날씨 상태와 계산 결과를 중앙에서 공유합니다.</p>
        <div class="tag-list">
          <el-tag size="small" type="success" effect="plain">State</el-tag>
          <el-tag size="small" type="success" effect="plain">Getter</el-tag>
          <el-tag size="small" type="success" effect="plain">Action</el-tag>
        </div>
      </article>

      <article>
        <span class="concept-icon orange"><Cloud :size="23" /></span>
        <h3>REST API</h3>
        <p>Axios와 Promise.all로 날씨·대기질·일출 데이터를 동시에 조회합니다.</p>
        <div class="tag-list">
          <el-tag size="small" type="warning" effect="plain">Axios</el-tag>
          <el-tag size="small" type="warning" effect="plain">async/await</el-tag>
        </div>
      </article>
    </section>

    <section class="surface-card">
      <div class="section-heading">
        <span class="section-kicker">DATA FLOW</span>
        <h2>데이터가 화면에 표시되는 과정</h2>
      </div>

      <el-steps :active="4" finish-status="success" align-center>
        <el-step title="onMounted" description="View가 마운트된 후 조회" />
        <el-step title="Axios" description="외부 REST API 요청" />
        <el-step title="Pinia" description="State와 Getter 계산" />
        <el-step title="Component" description="반응형 화면 렌더링" />
      </el-steps>
    </section>
  </div>
</template>

<style scoped>
.about-container {
  display: grid;
  gap: 18px;
}

.page-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
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

.about-hero {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding: 28px;
  color: #ffffff;
  background: linear-gradient(135deg, #1e40af, #0891b2);
  border-radius: 18px;
  box-shadow: 0 18px 38px rgba(37, 99, 235, 0.2);
}

.hero-icon {
  display: grid;
  width: 54px;
  height: 54px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 16px;
  place-items: center;
}

.about-hero span:not(.hero-icon) {
  color: #bfdbfe;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.about-hero h2 {
  max-width: 680px;
  margin: 4px 0 8px;
  font-size: clamp(1.3rem, 3vw, 1.75rem);
  line-height: 1.35;
}

.about-hero p {
  max-width: 760px;
  color: #dbeafe;
}

.concept-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.concept-grid article,
.surface-card {
  padding: 22px;
  background: #ffffff;
  border: 1px solid var(--weather-border);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(51, 65, 85, 0.05);
}

.concept-icon {
  display: grid;
  width: 42px;
  height: 42px;
  margin-bottom: 12px;
  border-radius: 13px;
  place-items: center;
}

.concept-icon.blue {
  color: #2563eb;
  background: #eff6ff;
}

.concept-icon.violet {
  color: #7c3aed;
  background: #f5f3ff;
}

.concept-icon.green {
  color: #059669;
  background: #ecfdf5;
}

.concept-icon.orange {
  color: #ea580c;
  background: #fff7ed;
}

.concept-grid h3,
.section-heading h2 {
  color: var(--weather-navy);
}

.concept-grid p {
  margin: 5px 0 14px;
  color: var(--weather-muted);
  font-size: 0.88rem;
}

.tag-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.section-heading {
  margin-bottom: 24px;
}

.section-heading h2 {
  margin-top: 2px;
  font-size: 1.25rem;
}

@media (max-width: 700px) {
  .page-heading,
  .about-hero {
    flex-direction: column;
  }

  .concept-grid {
    grid-template-columns: 1fr;
  }

  .surface-card {
    overflow-x: auto;
  }

  .surface-card :deep(.el-steps) {
    min-width: 620px;
  }
}
</style>
