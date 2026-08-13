<script setup>
import { CheckCircle2, ExternalLink, ShieldAlert } from '@lucide/vue'

defineProps({
  guide: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <article class="safety-guide" :class="`tone-${guide.tone}`">
    <div class="guide-heading">
      <span class="guide-icon"><ShieldAlert :size="21" /></span>
      <div>
        <span>{{ guide.hazard }} 행동 요령</span>
        <h3>{{ guide.title }}</h3>
      </div>
    </div>

    <p class="guide-summary">{{ guide.summary }}</p>

    <ul>
      <li v-for="action in guide.actions" :key="action">
        <CheckCircle2 :size="15" />
        <span>{{ action }}</span>
      </li>
    </ul>

    <a :href="guide.sourceUrl" target="_blank" rel="noopener noreferrer">
      국민안전24 행동 요령
      <ExternalLink :size="13" />
    </a>
  </article>
</template>

<style scoped>
.safety-guide {
  --guide-color: #475569;
  --guide-soft: #f8fafc;
  padding: 18px;
  background: linear-gradient(145deg, #ffffff, var(--guide-soft));
  border: 1px solid color-mix(in srgb, var(--guide-color) 24%, #ffffff);
  border-radius: 15px;
}

.tone-heat,
.tone-danger {
  --guide-color: #dc2626;
  --guide-soft: #fff1f2;
}

.tone-rain,
.tone-wave {
  --guide-color: #2563eb;
  --guide-soft: #eff6ff;
}

.tone-wind {
  --guide-color: #0f766e;
  --guide-soft: #f0fdfa;
}

.tone-cold {
  --guide-color: #0369a1;
  --guide-soft: #f0f9ff;
}

.tone-dry,
.tone-dust {
  --guide-color: #a16207;
  --guide-soft: #fffbeb;
}

.guide-heading {
  display: flex;
  align-items: center;
  gap: 11px;
}

.guide-icon {
  display: grid;
  width: 39px;
  height: 39px;
  flex-shrink: 0;
  color: #ffffff;
  background: var(--guide-color);
  border-radius: 11px;
  place-items: center;
}

.guide-heading span:not(.guide-icon) {
  color: var(--guide-color);
  font-size: 0.68rem;
  font-weight: 800;
}

.guide-heading h3 {
  margin-top: 1px;
  color: var(--weather-navy);
  font-size: 1rem;
}

.guide-summary {
  margin: 13px 0 11px;
  color: var(--weather-muted);
  font-size: 0.8rem;
  line-height: 1.55;
}

.safety-guide ul {
  display: grid;
  gap: 7px;
  padding: 0;
  list-style: none;
}

.safety-guide li {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  color: var(--weather-text);
  font-size: 0.78rem;
}

.safety-guide li svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--guide-color);
}

.safety-guide > a {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 14px;
  color: var(--guide-color);
  font-size: 0.74rem;
  font-weight: 800;
}
</style>
