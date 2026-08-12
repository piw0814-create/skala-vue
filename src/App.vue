<script setup>
import UnitToggler from './components/exercise/UnitToggler.vue'
</script>

<template>
  <div class="app-container">
    <h1>⛅ 날씨</h1>
    <hr />

    <div class="dashboard-wrapper">
      <nav class="navigation-bar">
        <RouterLink to="/" class="nav-item"> 🌦️ 날씨 대시보드 </RouterLink>

        <span class="divider">|</span>

        <RouterLink to="/about" class="nav-item"> ℹ️ 서비스 소개 </RouterLink>

        <span class="divider">|</span>

        <RouterLink to="/stats" class="nav-item"> 📊 날씨 통계 </RouterLink>

        <span class="divider">|</span>

        <RouterLink to="/warnings" class="nav-item"> 🚨 날씨 경고 </RouterLink>

        <UnitToggler />
      </nav>

      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style>
@import '@/assets/exercise.css';
</style>
