import { defineStore } from 'pinia'

// 체감온도 계산
const calculateFeelsLike = (temp, humidity, wind) => {
  const vaporPressure = (humidity / 100) * 6.105 * Math.exp((17.27 * temp) / (237.7 + temp))

  const feelsLike = temp + 0.33 * vaporPressure - 0.7 * wind - 4

  return Number(feelsLike.toFixed(1))
}

export const useWeatherStore = defineStore('weather', {
  // 전역 공유 데이터
  state: () => ({
    weatherList: [
      {
        id: 'city_01',
        name: '서울',
        fullName: '대한민국 서울특별시',
        temp: 28,
        status: '맑음',
        humidity: 60,
        wind: 2.5,
      },
      {
        id: 'city_02',
        name: '수원',
        fullName: '경기도 수원시 영통구',
        temp: 24,
        status: '비',
        humidity: 80,
        wind: 3.2,
      },
      {
        id: 'city_03',
        name: '부산',
        fullName: '부산광역시 해운대구',
        temp: 26,
        status: '구름',
        humidity: 70,
        wind: 4.1,
      },
    ],

    feelsLikeThreshold: 30,
  }),

  // state를 이용해서 계산한 값
  getters: {
    weatherWithFeelsLike: (state) => {
      return state.weatherList.map((city) => ({
        ...city,

        feelsLike: calculateFeelsLike(city.temp, city.humidity, city.wind),
      }))
    },

    hottestFeelsLikeCity() {
      return this.weatherWithFeelsLike.reduce((hottest, city) => (city.feelsLike > hottest.feelsLike ? city : hottest))
    },

    warningCities() {
      return this.weatherWithFeelsLike.filter((city) => city.feelsLike >= this.feelsLikeThreshold)
    },

    getCityById() {
      return (id) => {
        return this.weatherWithFeelsLike.find((city) => city.id === id) ?? null
      }
    },

    cityCount: (state) => {
      return state.weatherList.length
    },

    averageTemp: (state) => {
      const totalTemp = state.weatherList.reduce((sum, city) => sum + city.temp, 0)

      const average = totalTemp / state.weatherList.length

      return Number(average.toFixed(1))
    },

    averageHumidity: (state) => {
      const totalHumidity = state.weatherList.reduce((sum, city) => sum + city.humidity, 0)

      const average = totalHumidity / state.weatherList.length

      return Number(average.toFixed(1))
    },

    averageWind: (state) => {
      const totalWind = state.weatherList.reduce((sum, city) => sum + city.wind, 0)

      const average = totalWind / state.weatherList.length

      return Number(average.toFixed(1))
    },

    hottestCity: (state) => {
      return state.weatherList.reduce((current, city) => (city.temp > current.temp ? city : current))
    },

    coldestCity: (state) => {
      return state.weatherList.reduce((current, city) => (city.temp < current.temp ? city : current))
    },
  },

  // state 변경
  actions: {
    updateThreshold(value) {
      this.feelsLikeThreshold = Number(value)
    },
  },
})
