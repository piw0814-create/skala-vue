<template>
  <div class="base-dashboard-card">
    <slot></slot>
  </div>
</template>

<style scoped>
.base-dashboard-card {
  padding: 22px;
  margin-bottom: 18px;
  background: var(--weather-surface);
  border: 1px solid var(--weather-border);
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(51, 65, 85, 0.06);
}
</style>
