const OPENWEATHER_STATUS_BY_CODE = {
  200: '약한 비와 천둥·번개',
  201: '비와 천둥·번개',
  202: '강한 비와 천둥·번개',
  210: '약한 천둥·번개',
  211: '천둥·번개',
  212: '강한 천둥·번개',
  221: '천둥·번개',
  230: '약한 비와 천둥·번개',
  231: '비와 천둥·번개',
  232: '강한 비와 천둥·번개',
  300: '약한 비',
  301: '약한 비',
  302: '비',
  310: '약한 비',
  311: '약한 비',
  312: '비',
  313: '소나기',
  314: '강한 소나기',
  321: '소나기',
  500: '약한 비',
  501: '비',
  502: '강한 비',
  503: '매우 강한 비',
  504: '매우 강한 비',
  511: '어는 비',
  520: '약한 소나기',
  521: '소나기',
  522: '강한 소나기',
  531: '소나기',
  600: '약한 눈',
  601: '눈',
  602: '많은 눈',
  611: '진눈깨비',
  612: '진눈깨비',
  613: '진눈깨비',
  615: '비 또는 눈',
  616: '비 또는 눈',
  620: '약한 눈',
  621: '눈',
  622: '많은 눈',
  701: '박무',
  711: '연기',
  721: '연무',
  731: '모래·먼지바람',
  741: '안개',
  751: '모래먼지',
  761: '먼지',
  762: '화산재',
  771: '돌풍',
  781: '토네이도',
  800: '맑음',
}

const LEGACY_DESCRIPTION_MAP = {
  온흐림: '흐림',
  실비: '약한 비',
  '실 비': '약한 비',
  '가벼운 비': '약한 비',
  구름: '구름많음',
  튼구름: '구름많음',
}

const getSkyStatus = (code, cloudiness) => {
  if (cloudiness !== null && Number.isFinite(cloudiness)) {
    if (cloudiness <= 50) return '맑음'
    if (cloudiness <= 80) return '구름많음'
    return '흐림'
  }

  if (code === 801 || code === 802) return '맑음'
  if (code === 803) return '구름많음'
  return '흐림'
}

/**
 * OpenWeather condition ID를 기상청에서 쓰는 표현에 가까운 한글 상태로 변환합니다.
 * 구름 상태는 KMA 운량 구간(맑음 0~5, 구름많음 6~8, 흐림 9~10)을
 * OpenWeather의 cloudiness 백분율에 맞춰 적용합니다.
 */
export const getOpenWeatherStatus = ({ code, cloudiness, fallback = '' } = {}) => {
  const numericCode = Number(code)
  const numericCloudiness = cloudiness === '' || cloudiness === null || cloudiness === undefined ? null : Number(cloudiness)

  if (numericCode >= 801 && numericCode <= 804) {
    return getSkyStatus(numericCode, numericCloudiness)
  }

  if (OPENWEATHER_STATUS_BY_CODE[numericCode]) {
    return OPENWEATHER_STATUS_BY_CODE[numericCode]
  }

  const normalizedFallback = fallback.trim()

  return (LEGACY_DESCRIPTION_MAP[normalizedFallback] ?? normalizedFallback) || '날씨 정보 없음'
}
