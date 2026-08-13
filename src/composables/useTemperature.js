import { useConfigStore } from '@/stores/configStore'
import { formatNumber, roundNumber } from '@/utils/numberFormat'

export const useTemperature = () => {
  const configStore = useConfigStore()

  // 섭씨 원본값을 현재 설정 단위로 변환
  const convertTemp = (temp) => {
    if (!Number.isFinite(temp)) {
      return null
    }

    if (configStore.unit === 'fahrenheit') {
      return roundNumber((temp * 9) / 5 + 32, 0)
    }

    return roundNumber(temp, 1)
  }

  // 숫자 + 단위까지 한 번에 표시
  const formatTemp = (temp) => {
    const convertedTemp = convertTemp(temp)

    if (!Number.isFinite(convertedTemp)) {
      return '-'
    }

    const maximumFractionDigits = configStore.unit === 'fahrenheit' ? 0 : 1

    return `${formatNumber(convertedTemp, maximumFractionDigits)}${configStore.unitSymbol}`
  }

  return {
    convertTemp,
    formatTemp,
  }
}
