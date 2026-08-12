import { useConfigStore } from '@/stores/configStore'

export const useTemperature = () => {
  const configStore = useConfigStore()

  // 섭씨 원본값을 현재 설정 단위로 변환
  const convertTemp = (temp) => {
    if (temp === null || temp === undefined) {
      return ''
    }

    if (configStore.unit === 'fahrenheit') {
      return Math.round((temp * 9) / 5 + 32)
    }

    return temp
  }

  // 숫자 + 단위까지 한 번에 표시
  const formatTemp = (temp) => {
    return `${convertTemp(temp)}${configStore.unitSymbol}`
  }

  return {
    convertTemp,
    formatTemp,
  }
}
