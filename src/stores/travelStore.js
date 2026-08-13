import { defineStore } from 'pinia'
import axios from 'axios'

import { OPENWEATHER_API_KEY } from '@/config/env'
import { cityConfigs } from '@/data/cityConfigs'

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality'
const OPENWEATHER_FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast'
const OPENWEATHER_AIR_URL = 'https://api.openweathermap.org/data/2.5/air_pollution/forecast'
const REQUEST_TIMEOUT = 10000

const getTravelErrorMessage = (error) => {
  if (error.code === 'MISSING_OPENWEATHER_API_KEY') {
    return '대체 예보를 사용하려면 VITE_OPENWEATHER_API_KEY 환경 변수를 설정해 주세요.'
  }

  if (error.response?.status === 429) {
    return '예보 요청이 많습니다. 잠시 후 다시 시도해 주세요.'
  }

  if (error.code === 'ECONNABORTED') {
    return '예보 서버의 응답이 지연되고 있습니다. 다시 시도해 주세요.'
  }

  if (error.response?.status === 401) {
    return '대체 예보 API 인증 정보를 확인해 주세요.'
  }

  return '여행 날씨 예보를 가져오지 못했습니다.'
}

const createOpenMeteoHourlyForecast = (weatherData, airData) => {
  const airQualityByTime = new Map(
    (airData.hourly?.time ?? []).map((time, index) => [
      time,
      {
        usAqi: airData.hourly.us_aqi?.[index] ?? null,
        pm2_5: airData.hourly.pm2_5?.[index] ?? null,
        pm10: airData.hourly.pm10?.[index] ?? null,
        providerAqi: null,
        provider: 'open-meteo',
      },
    ]),
  )

  return (weatherData.hourly?.time ?? []).map((time, index) => ({
    time,
    temp: weatherData.hourly.temperature_2m?.[index] ?? null,
    feelsLike: weatherData.hourly.apparent_temperature?.[index] ?? null,
    humidity: weatherData.hourly.relative_humidity_2m?.[index] ?? null,
    precipitationProbability: weatherData.hourly.precipitation_probability?.[index] ?? null,
    precipitation: weatherData.hourly.precipitation?.[index] ?? null,
    precipitationPeriodHours: 1,
    precipitationPeriodAmount: weatherData.hourly.precipitation?.[index] ?? null,
    snowfall: weatherData.hourly.snowfall?.[index] ?? null,
    weatherCode: weatherData.hourly.weather_code?.[index] ?? null,
    wind: weatherData.hourly.wind_speed_10m?.[index] ?? null,
    windGust: weatherData.hourly.wind_gusts_10m?.[index] ?? null,
    visibility: weatherData.hourly.visibility?.[index] ?? null,
    uvIndex: weatherData.hourly.uv_index?.[index] ?? null,
    isDay: weatherData.hourly.is_day?.[index] ?? null,
    airQuality: airQualityByTime.get(time) ?? null,
  }))
}

const createOpenMeteoDailyForecast = (weatherData) => {
  return (weatherData.daily?.time ?? []).map((date, index) => ({
    date,
    weatherCode: weatherData.daily.weather_code?.[index] ?? null,
    tempMax: weatherData.daily.temperature_2m_max?.[index] ?? null,
    tempMin: weatherData.daily.temperature_2m_min?.[index] ?? null,
    feelsLikeMax: weatherData.daily.apparent_temperature_max?.[index] ?? null,
    feelsLikeMin: weatherData.daily.apparent_temperature_min?.[index] ?? null,
    precipitationSum: weatherData.daily.precipitation_sum?.[index] ?? null,
    rainSum: weatherData.daily.rain_sum?.[index] ?? null,
    snowfallSum: weatherData.daily.snowfall_sum?.[index] ?? null,
    precipitationProbabilityMax: weatherData.daily.precipitation_probability_max?.[index] ?? null,
    windMax: weatherData.daily.wind_speed_10m_max?.[index] ?? null,
    windGustMax: weatherData.daily.wind_gusts_10m_max?.[index] ?? null,
    uvIndexMax: weatherData.daily.uv_index_max?.[index] ?? null,
    sunrise: weatherData.daily.sunrise?.[index] ?? null,
    sunset: weatherData.daily.sunset?.[index] ?? null,
  }))
}

const formatOpenWeatherTime = (unixTime, timezoneOffset) => {
  return new Date((unixTime + timezoneOffset) * 1000).toISOString().slice(0, 16)
}

const convertOpenWeatherCode = (weatherCode) => {
  if (weatherCode >= 200 && weatherCode < 300) {
    return 95
  }

  if (weatherCode >= 300 && weatherCode < 400) {
    return 51
  }

  if (weatherCode >= 500 && weatherCode < 600) {
    return weatherCode >= 502 ? 65 : 61
  }

  if (weatherCode >= 600 && weatherCode < 700) {
    return 71
  }

  if (weatherCode >= 700 && weatherCode < 800) {
    return 45
  }

  if (weatherCode === 800) {
    return 0
  }

  return weatherCode <= 802 ? 2 : 3
}

const roundValue = (value, digits = 1) => {
  if (!Number.isFinite(value)) {
    return null
  }

  return Number(value.toFixed(digits))
}

const getMaxValue = (values) => {
  const numbers = values.filter(Number.isFinite)
  return numbers.length > 0 ? Math.max(...numbers) : null
}

const getMinValue = (values) => {
  const numbers = values.filter(Number.isFinite)
  return numbers.length > 0 ? Math.min(...numbers) : null
}

const getSumValue = (values) => {
  const numbers = values.filter(Number.isFinite)
  return numbers.length > 0 ? numbers.reduce((sum, value) => sum + value, 0) : null
}

const createOpenWeatherAirQualityMap = (airData, timezoneOffset) => {
  return new Map(
    (airData.list ?? []).map((item) => [
      formatOpenWeatherTime(item.dt, timezoneOffset),
      {
        usAqi: null,
        providerAqi: item.main?.aqi ?? null,
        provider: 'openweather',
        pm2_5: item.components?.pm2_5 ?? null,
        pm10: item.components?.pm10 ?? null,
      },
    ]),
  )
}

const createOpenWeatherHourlyForecast = (weatherData, airData) => {
  const timezoneOffset = weatherData.city?.timezone ?? 0
  const airQualityByTime = createOpenWeatherAirQualityMap(airData, timezoneOffset)

  return (weatherData.list ?? []).flatMap((item) => {
    const rainForThreeHours = item.rain?.['3h'] ?? 0
    const snowForThreeHours = item.snow?.['3h'] ?? 0
    const precipitationPerHour = (rainForThreeHours + snowForThreeHours) / 3
    const rainfallPerHour = rainForThreeHours / 3

    return Array.from({ length: 3 }, (_, hourOffset) => {
      const time = formatOpenWeatherTime(item.dt + hourOffset * 3600, timezoneOffset)

      return {
        time,
        temp: item.main?.temp ?? null,
        feelsLike: item.main?.feels_like ?? null,
        humidity: item.main?.humidity ?? null,
        precipitationProbability: roundValue((item.pop ?? 0) * 100, 0),
        precipitation: roundValue(precipitationPerHour, 2),
        precipitationPeriodHours: 3,
        precipitationPeriodAmount: roundValue(rainForThreeHours + snowForThreeHours, 2),
        rainfall: roundValue(rainfallPerHour, 2),
        snowfall: null,
        weatherCode: convertOpenWeatherCode(item.weather?.[0]?.id ?? 800),
        wind: item.wind?.speed ?? null,
        windGust: item.wind?.gust ?? item.wind?.speed ?? null,
        visibility: item.visibility ?? null,
        uvIndex: null,
        isDay: null,
        airQuality: airQualityByTime.get(time) ?? null,
      }
    })
  })
}

const createOpenWeatherDailyForecast = (hourlyForecast) => {
  const hoursByDate = new Map()

  hourlyForecast.forEach((hour) => {
    const date = hour.time.slice(0, 10)
    const dateHours = hoursByDate.get(date) ?? []
    dateHours.push(hour)
    hoursByDate.set(date, dateHours)
  })

  return [...hoursByDate.entries()].map(([date, hours]) => {
    const representativeHour = hours.find((hour) => hour.time.slice(11, 13) === '12') ?? hours[0]

    return {
      date,
      weatherCode: representativeHour?.weatherCode ?? null,
      tempMax: roundValue(getMaxValue(hours.map((hour) => hour.temp))),
      tempMin: roundValue(getMinValue(hours.map((hour) => hour.temp))),
      feelsLikeMax: roundValue(getMaxValue(hours.map((hour) => hour.feelsLike))),
      feelsLikeMin: roundValue(getMinValue(hours.map((hour) => hour.feelsLike))),
      precipitationSum: roundValue(getSumValue(hours.map((hour) => hour.precipitation)), 1),
      rainSum: roundValue(getSumValue(hours.map((hour) => hour.rainfall)), 1),
      snowfallSum: null,
      precipitationProbabilityMax: getMaxValue(hours.map((hour) => hour.precipitationProbability)),
      windMax: roundValue(getMaxValue(hours.map((hour) => hour.wind))),
      windGustMax: roundValue(getMaxValue(hours.map((hour) => hour.windGust))),
      uvIndexMax: null,
      sunrise: null,
      sunset: null,
    }
  })
}

const fetchOpenMeteoForecast = async (city) => {
  const [weatherResponse, airQualityResponse] = await Promise.all([
    axios.get(FORECAST_URL, {
      timeout: REQUEST_TIMEOUT,
      params: {
        latitude: city.lat,
        longitude: city.lon,
        hourly: [
          'temperature_2m',
          'apparent_temperature',
          'relative_humidity_2m',
          'precipitation_probability',
          'precipitation',
          'snowfall',
          'weather_code',
          'wind_speed_10m',
          'wind_gusts_10m',
          'visibility',
          'uv_index',
          'is_day',
        ].join(','),
        daily: [
          'weather_code',
          'temperature_2m_max',
          'temperature_2m_min',
          'apparent_temperature_max',
          'apparent_temperature_min',
          'precipitation_sum',
          'rain_sum',
          'snowfall_sum',
          'precipitation_probability_max',
          'wind_speed_10m_max',
          'wind_gusts_10m_max',
          'uv_index_max',
          'sunrise',
          'sunset',
        ].join(','),
        timezone: 'Asia/Seoul',
        forecast_days: 7,
        wind_speed_unit: 'ms',
      },
    }),
    axios.get(AIR_QUALITY_URL, {
      timeout: REQUEST_TIMEOUT,
      params: {
        latitude: city.lat,
        longitude: city.lon,
        hourly: 'pm10,pm2_5,us_aqi',
        timezone: 'Asia/Seoul',
        forecast_days: 7,
      },
    }),
  ])

  return {
    city: { ...city },
    timezone: weatherResponse.data.timezone,
    hourly: createOpenMeteoHourlyForecast(weatherResponse.data, airQualityResponse.data),
    daily: createOpenMeteoDailyForecast(weatherResponse.data),
    provider: 'open-meteo',
    providerLabel: 'Open-Meteo · CAMS',
    isFallback: false,
    fallbackMessage: '',
    fetchedAt: new Date().toISOString(),
  }
}

const fetchOpenWeatherFallback = async (city, apiKey, primaryError) => {
  if (!apiKey) {
    const error = new Error('Missing OpenWeather API key')
    error.code = 'MISSING_OPENWEATHER_API_KEY'
    throw error
  }

  const [weatherResponse, airQualityResponse] = await Promise.all([
    axios.get(OPENWEATHER_FORECAST_URL, {
      timeout: REQUEST_TIMEOUT,
      params: {
        lat: city.lat,
        lon: city.lon,
        appid: apiKey,
        units: 'metric',
        lang: 'kr',
      },
    }),
    axios.get(OPENWEATHER_AIR_URL, {
      timeout: REQUEST_TIMEOUT,
      params: {
        lat: city.lat,
        lon: city.lon,
        appid: apiKey,
      },
    }),
  ])

  const hourly = createOpenWeatherHourlyForecast(weatherResponse.data, airQualityResponse.data)
  const isRateLimited = primaryError.response?.status === 429

  return {
    city: { ...city },
    timezone: 'Asia/Seoul',
    hourly,
    daily: createOpenWeatherDailyForecast(hourly),
    provider: 'openweather',
    providerLabel: 'OpenWeather 5일 날씨 · 4일 대기질 예보',
    isFallback: true,
    fallbackMessage: isRateLimited ? 'Open-Meteo 일일 요청 한도를 초과해 OpenWeather 대체 예보를 사용합니다.' : '기본 예보 서버에 연결할 수 없어 OpenWeather 대체 예보를 사용합니다.',
    fetchedAt: new Date().toISOString(),
  }
}

export const useTravelStore = defineStore('travel', {
  state: () => ({
    selectedCityId: '',
    forecastByCityId: {},
    isLoading: false,
    errorMessage: '',
    lastUpdatedAt: null,
  }),

  getters: {
    cities: () => cityConfigs,

    selectedCity(state) {
      return cityConfigs.find((city) => city.id === state.selectedCityId) ?? null
    },

    selectedForecast(state) {
      return state.forecastByCityId[state.selectedCityId] ?? null
    },

    getForecastByCityId: (state) => {
      return (cityId) => state.forecastByCityId[cityId] ?? null
    },
  },

  actions: {
    clearError() {
      this.errorMessage = ''
    },

    async fetchTravelForecast(cityId, forceRefresh = false) {
      const city = cityConfigs.find((item) => item.id === cityId)

      if (!city) {
        this.errorMessage = '선택한 여행지를 찾을 수 없습니다.'
        return null
      }

      this.selectedCityId = cityId

      if (!forceRefresh && this.forecastByCityId[cityId]) {
        this.errorMessage = ''
        return this.forecastByCityId[cityId]
      }

      this.isLoading = true
      this.errorMessage = ''

      try {
        let forecast

        try {
          forecast = await fetchOpenMeteoForecast(city)
        } catch (primaryError) {
          console.warn('Open-Meteo 예보 조회 실패, OpenWeather로 전환합니다:', primaryError.response?.status ?? primaryError.code)
          forecast = await fetchOpenWeatherFallback(city, OPENWEATHER_API_KEY, primaryError)
        }

        this.forecastByCityId[cityId] = forecast
        this.lastUpdatedAt = forecast.fetchedAt

        return forecast
      } catch (error) {
        console.error('여행 날씨 예보 조회 실패:', error)
        this.errorMessage = getTravelErrorMessage(error)
        return null
      } finally {
        this.isLoading = false
      }
    },
  },
})
