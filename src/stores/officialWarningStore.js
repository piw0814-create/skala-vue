import { defineStore } from 'pinia'
import axios from 'axios'

import { KMA_API_BASE_URL } from '@/config/env'
import { cityConfigs } from '@/data/cityConfigs'

const KMA_WARNING_URL = `${KMA_API_BASE_URL}/1360000/WthrWrnInfoService/getPwnStatus`
const REQUEST_TIMEOUT = 10000

const METROPOLITAN_CITY_IDS = new Set(['city_01', 'city_03', 'city_04', 'city_05', 'city_06', 'city_07', 'city_08', 'city_09'])

const CITY_PROVINCES = {
  city_02: ['경기도'],
  city_10: ['강원도', '강원특별자치도', '강원'],
  city_11: ['강원도', '강원특별자치도', '강원'],
  city_12: ['전북자치도', '전북특별자치도', '전라북도', '전북'],
}

const METROPOLITAN_ALIASES = {
  city_09: ['제주', '제주도', '제주특별자치도'],
}

const WARNING_HAZARDS = ['폭풍해일', '지진해일', '강풍', '풍랑', '호우', '대설', '건조', '한파', '폭염', '황사', '태풍']

const splitRegionGroups = (regions) => {
  const groups = []
  let current = ''
  let depth = 0

  for (const character of regions) {
    if (character === '(') {
      depth += 1
    } else if (character === ')') {
      depth = Math.max(depth - 1, 0)
    }

    if (character === ',' && depth === 0) {
      groups.push(current.trim())
      current = ''
    } else {
      current += character
    }
  }

  if (current.trim()) {
    groups.push(current.trim())
  }

  return groups
}

const parseWarningText = (warningText) => {
  if (!warningText || /^(o\s*)?없음$/m.test(warningText.trim())) {
    return []
  }

  return warningText
    .split(/\r?\n/)
    .map((line) => line.replace(/^o\s*/, '').trim())
    .filter(Boolean)
    .map((line, index) => {
      const separatorIndex = line.indexOf(':')
      const title = separatorIndex >= 0 ? line.slice(0, separatorIndex).trim() : line
      const regions = separatorIndex >= 0 ? line.slice(separatorIndex + 1).trim() : ''
      const level = title.includes('경보') ? 'warning' : 'advisory'
      const hazard = WARNING_HAZARDS.find((item) => title.includes(item)) ?? title.replace(/(주의보|경보).*$/, '').trim()

      return {
        id: `${title}-${index}`,
        title,
        hazard,
        level,
        regions,
        regionGroups: splitRegionGroups(regions),
        sourceType: 'official',
      }
    })
}

const isWarningForCity = (warning, city) => {
  if (!city || !warning) {
    return false
  }

  if (warning.regions.includes('전국')) {
    return true
  }

  if (METROPOLITAN_CITY_IDS.has(city.id)) {
    const aliases = METROPOLITAN_ALIASES[city.id] ?? [city.name]

    return warning.regionGroups.some((group) => {
      return aliases.some((alias) => group === alias || group.startsWith(`${alias}(`))
    })
  }

  const isNamedCity = warning.regionGroups.some((group) => group.includes(city.name))

  if (isNamedCity) {
    return true
  }

  const provinceAliases = CITY_PROVINCES[city.id] ?? []

  return warning.regionGroups.some((group) => {
    return provinceAliases.some((province) => group === province || group.startsWith(`${province} 전역`))
  })
}

const getErrorMessage = (error) => {
  if (error.response?.status === 429) {
    return '기상청 특보 요청이 많습니다. 잠시 후 다시 시도해 주세요.'
  }

  if (error.code === 'ECONNABORTED') {
    return '기상청 특보 서버의 응답이 지연되고 있습니다.'
  }

  return '기상청 공식 특보를 불러오지 못했습니다.'
}

export const useOfficialWarningStore = defineStore('officialWarning', {
  state: () => ({
    warnings: [],
    issuedAt: null,
    effectiveAt: null,
    notice: '',
    isLoading: false,
    errorMessage: '',
    lastUpdatedAt: null,
  }),

  getters: {
    warningCount: (state) => state.warnings.length,

    hasOfficialWarnings: (state) => state.warnings.length > 0,

    getWarningsForCity: (state) => {
      return (cityId) => {
        const city = cityConfigs.find((item) => item.id === cityId)

        if (!city) {
          return []
        }

        return state.warnings.filter((warning) => isWarningForCity(warning, city))
      }
    },
  },

  actions: {
    async fetchOfficialWarnings() {
      this.isLoading = true
      this.errorMessage = ''

      try {
        const response = await axios.get(KMA_WARNING_URL, {
          timeout: REQUEST_TIMEOUT,
          params: {
            pageNo: 1,
            numOfRows: 100,
            dataType: 'JSON',
          },
        })

        const responseHeader = response.data?.response?.header

        if (responseHeader?.resultCode !== '00') {
          throw new Error(responseHeader?.resultMsg ?? 'KMA_API_ERROR')
        }

        const responseItems = response.data?.response?.body?.items?.item
        const statusItem = Array.isArray(responseItems) ? responseItems[0] : responseItems

        this.warnings = parseWarningText(statusItem?.t6)
        this.issuedAt = statusItem?.tmFc ?? null
        this.effectiveAt = statusItem?.tmEf ?? null
        this.notice = statusItem?.other?.trim() ?? ''
        this.lastUpdatedAt = new Date().toISOString()
      } catch (error) {
        console.error('기상청 공식 특보 조회 실패:', error)
        this.errorMessage = getErrorMessage(error)
      } finally {
        this.isLoading = false
      }
    },
  },
})
