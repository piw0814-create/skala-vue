import { defineStore } from 'pinia'
import axios from 'axios'

import { OPENWEATHER_API_KEY } from '@/config/env'
import { cityConfigs } from '@/data/cityConfigs'

// ----------------------------------------------------
// 체감온도 계산
// ----------------------------------------------------
const calculateFeelsLike = (temp, humidity, wind) => {
  const vaporPressure = (humidity / 100) * 6.105 * Math.exp((17.27 * temp) / (237.7 + temp))

  const feelsLike = temp + 0.33 * vaporPressure - 0.7 * wind - 4

  return Number(feelsLike.toFixed(1))
}

// ----------------------------------------------------
// AQI 단계 한글 변환
// ----------------------------------------------------
const getAqiLabel = (aqi) => {
  switch (aqi) {
    case 1:
      return '좋음'
    case 2:
      return '양호'
    case 3:
      return '보통'
    case 4:
      return '나쁨'
    case 5:
      return '매우 나쁨'
    default:
      return '알 수 없음'
  }
}

// ----------------------------------------------------
// Weather Store
// ----------------------------------------------------
export const useWeatherStore = defineStore('weather', {
  // --------------------------------------------------
  // State
  // --------------------------------------------------
  state: () => ({
    weatherList: [],

    feelsLikeThreshold: 30,

    favoriteCityIds: [],

    isLoading: false,
    errorMessage: '',
    lastUpdatedAt: null,
  }),

  // --------------------------------------------------
  // Getters
  // --------------------------------------------------
  getters: {
    // 체감온도를 추가한 도시 목록
    weatherWithFeelsLike: (state) => {
      return state.weatherList.map((city) => ({
        ...city,

        feelsLike: calculateFeelsLike(city.temp, city.humidity, city.wind),
      }))
    },

    // 체감온도가 가장 높은 도시
    hottestFeelsLikeCity() {
      if (this.weatherWithFeelsLike.length === 0) {
        return null
      }

      return this.weatherWithFeelsLike.reduce((hottest, city) => (city.feelsLike > hottest.feelsLike ? city : hottest))
    },

    // 체감온도 경고 대상 도시
    warningCities() {
      return this.weatherWithFeelsLike.filter((city) => city.feelsLike >= this.feelsLikeThreshold)
    },

    // ID로 도시 조회
    getCityById() {
      return (id) => {
        return this.weatherWithFeelsLike.find((city) => city.id === id) ?? null
      }
    },

    // 도시 개수
    cityCount: (state) => {
      return state.weatherList.length
    },

    // 평균 기온
    averageTemp: (state) => {
      if (state.weatherList.length === 0) {
        return 0
      }

      const totalTemp = state.weatherList.reduce((sum, city) => sum + city.temp, 0)

      const average = totalTemp / state.weatherList.length

      return Number(average.toFixed(1))
    },

    // 평균 습도
    averageHumidity: (state) => {
      if (state.weatherList.length === 0) {
        return 0
      }

      const totalHumidity = state.weatherList.reduce((sum, city) => sum + city.humidity, 0)

      const average = totalHumidity / state.weatherList.length

      return Number(average.toFixed(1))
    },

    // 평균 풍속
    averageWind: (state) => {
      if (state.weatherList.length === 0) {
        return 0
      }

      const totalWind = state.weatherList.reduce((sum, city) => sum + city.wind, 0)

      const average = totalWind / state.weatherList.length

      return Number(average.toFixed(1))
    },

    // 가장 더운 도시
    hottestCity: (state) => {
      if (state.weatherList.length === 0) {
        return null
      }

      return state.weatherList.reduce((current, city) => (city.temp > current.temp ? city : current))
    },

    // 가장 추운 도시
    coldestCity: (state) => {
      if (state.weatherList.length === 0) {
        return null
      }

      return state.weatherList.reduce((current, city) => (city.temp < current.temp ? city : current))
    },

    // 즐겨찾기 도시
    favoriteCities() {
      return this.weatherWithFeelsLike.filter((city) => this.favoriteCityIds.includes(city.id))
    },
  },

  // --------------------------------------------------
  // Actions
  // --------------------------------------------------
  actions: {
    // 체감온도 경고 기준 변경
    updateThreshold(value) {
      this.feelsLikeThreshold = Number(value)
    },

    // 즐겨찾기 추가 / 제거
    toggleFavorite(cityId) {
      const index = this.favoriteCityIds.indexOf(cityId)

      if (index === -1) {
        this.favoriteCityIds.push(cityId)
      } else {
        this.favoriteCityIds.splice(index, 1)
      }
    },

    // ------------------------------------------------
    // 실제 날씨 + 대기질 데이터 가져오기
    // ------------------------------------------------
    async fetchWeatherList() {
      const API_KEY = OPENWEATHER_API_KEY

      const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'

      const AIR_URL = 'https://api.openweathermap.org/data/2.5/air_pollution'
      const SUN_URL = 'https://api.sunrise-sunset.org/v2'

      this.isLoading = true
      this.errorMessage = ''

      if (!API_KEY) {
        this.isLoading = false
        this.errorMessage = 'VITE_OPENWEATHER_API_KEY 환경 변수를 설정해 주세요.'
        return
      }

      try {
        // 각 도시마다 날씨 API + 대기질 API 동시 호출
        const requests = cityConfigs.map(async (city) => {
          const [weatherResponse, airResponse, sunResponse] = await Promise.all([
            // 현재 날씨 API
            axios.get(WEATHER_URL, {
              params: {
                lat: city.lat,
                lon: city.lon,
                appid: API_KEY,
                units: 'metric',
                lang: 'kr',
              },
            }),

            // 대기질 API
            axios.get(AIR_URL, {
              params: {
                lat: city.lat,
                lon: city.lon,
                appid: API_KEY,
              },
            }),

            // 일출 / 일몰 API
            axios.get(SUN_URL, {
              params: {
                lat: city.lat,
                lng: city.lon,
              },
            }),
          ])

          return {
            city,
            weatherData: weatherResponse.data,
            airData: airResponse.data,
            sunData: sunResponse.data,
          }
        })

        // 모든 도시의 API 요청 완료 대기
        const responses = await Promise.all(requests)

        // 날씨 + 대기질 데이터를 하나의 도시 객체로 합침
        this.weatherList = responses.map((result) => {
          const city = result.city
          const weatherData = result.weatherData

          const airInfo = result.airData.list[0]
          const components = airInfo.components
          const sunData = result.sunData

          return {
            id: city.id,
            name: city.name,
            fullName: city.fullName,

            lat: city.lat,
            lon: city.lon,

            // 날씨 데이터
            temp: weatherData.main.temp,
            status: weatherData.weather[0].description,
            condition: weatherData.weather[0].main.toLowerCase(),
            humidity: weatherData.main.humidity,
            wind: weatherData.wind.speed,

            // 대기질 데이터
            airQuality: {
              aqi: airInfo.main.aqi,
              label: getAqiLabel(airInfo.main.aqi),

              pm2_5: components.pm2_5,
              pm10: components.pm10,

              co: components.co,
              no: components.no,
              no2: components.no2,
              o3: components.o3,
              so2: components.so2,
              nh3: components.nh3,
            },
            sunInfo: {
              sunrise: sunData.sunrise,
              sunset: sunData.sunset,
              dayLength: sunData.day_length,
            },
          }
        })

        this.lastUpdatedAt = new Date().toISOString()

        console.log('전체 도시 날씨 + 대기질:', this.weatherList)
      } catch (error) {
        console.error('날씨/대기질 데이터 조회 실패:', error)

        this.errorMessage = '날씨 및 대기질 데이터를 가져오지 못했습니다.'
      } finally {
        this.isLoading = false
      }
    },
  },
})
