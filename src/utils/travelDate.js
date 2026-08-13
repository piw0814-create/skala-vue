const toLocalDate = (dateValue) => {
  if (!dateValue) {
    return null
  }

  const date = new Date(`${dateValue}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

const toDateValue = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const getTodayDateValue = () => toDateValue(new Date())

export const addDaysToDateValue = (dateValue, days) => {
  const date = toLocalDate(dateValue)

  if (!date || !Number.isFinite(days)) {
    return ''
  }

  date.setDate(date.getDate() + days)
  return toDateValue(date)
}

export const getDaysBetween = (startDate, endDate) => {
  const start = toLocalDate(startDate)
  const end = toLocalDate(endDate)

  if (!start || !end) {
    return null
  }

  return Math.round((end.getTime() - start.getTime()) / 86400000)
}

export const getTripDurationLabel = (startDate, endDate) => {
  const nights = getDaysBetween(startDate, endDate)

  if (!Number.isFinite(nights) || nights < 0) {
    return ''
  }

  return nights === 0 ? '당일' : `${nights}박 ${nights + 1}일`
}

export const formatTravelDate = (dateValue) => {
  const date = toLocalDate(dateValue)

  if (!date) {
    return ''
  }

  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

export const formatTravelPeriod = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return ''
  }

  if (startDate === endDate) {
    return formatTravelDate(startDate)
  }

  return `${formatTravelDate(startDate)} ~ ${formatTravelDate(endDate)}`
}
