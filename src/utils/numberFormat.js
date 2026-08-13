export const roundNumber = (value, maximumFractionDigits = 1) => {
  if (!Number.isFinite(value)) {
    return null
  }

  return Number(value.toFixed(maximumFractionDigits))
}

export const formatNumber = (value, maximumFractionDigits = 1) => {
  const roundedValue = roundNumber(value, maximumFractionDigits)

  if (!Number.isFinite(roundedValue)) {
    return '-'
  }

  return roundedValue.toLocaleString('ko-KR', {
    maximumFractionDigits,
  })
}
