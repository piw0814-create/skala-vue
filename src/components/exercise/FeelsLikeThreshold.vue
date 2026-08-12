<script setup>
defineProps({
  threshold: {
    type: Number,
    default: 30,
  },
})

const emit = defineEmits(['update-threshold'])

const handleThresholdInput = (event) => {
  const value = Number(event.target.value)

  emit('update-threshold', value)
}
</script>

<template>
  <h3>⚠️ 체감온도 경고 기준</h3>
  <input :value="threshold" type="number" @input="handleThresholdInput" />
  <span>℃</span>
</template>
