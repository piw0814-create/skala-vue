const NATIONAL_SAFETY_GUIDE_URL = 'https://nmepv.safekorea.go.kr/safekorea-kor/acts/nacts/nationalActionTips.do?menuSn=2003'

const safetyGuideMap = {
  폭염: {
    id: 'heat-wave',
    hazard: '폭염',
    title: '온열질환을 예방하세요',
    summary: '가장 더운 시간대의 야외 활동을 줄이고 수분을 자주 섭취합니다.',
    actions: ['갈증이 없어도 규칙적으로 물 마시기', '한낮의 야외 활동과 장시간 작업 줄이기', '어지럼증·두통 발생 시 시원한 곳에서 휴식하기'],
    tone: 'heat',
    sourceUrl: 'https://www.safekorea.go.kr/safekorea-kor/ctim/csim/heatWave.do?param=12',
  },
  호우: {
    id: 'heavy-rain',
    hazard: '호우',
    title: '침수 위험 지역을 피하세요',
    summary: '하천·계곡·지하차도에 접근하지 말고 대피 안내를 우선 확인합니다.',
    actions: ['하천변·계곡·급경사지에서 즉시 벗어나기', '침수된 도로나 지하차도에 진입하지 않기', '재난문자와 지자체 대피 안내 확인하기'],
    tone: 'rain',
    sourceUrl: 'https://safekorea.go.kr/safekorea-kor/ctim/csim/downpour.do?gubun=%ED%98%B8%EC%9A%B0&param=2',
  },
  태풍: {
    id: 'typhoon',
    hazard: '태풍',
    title: '외출과 해안 접근을 자제하세요',
    summary: '강풍과 호우가 함께 발생할 수 있으므로 실내의 안전한 장소에 머뭅니다.',
    actions: ['창문과 외부 물건을 미리 고정하기', '해안·방파제·하천 주변에서 벗어나기', '대피 안내가 나오면 즉시 안전한 곳으로 이동하기'],
    tone: 'danger',
    sourceUrl: NATIONAL_SAFETY_GUIDE_URL,
  },
  강풍: {
    id: 'strong-wind',
    hazard: '강풍',
    title: '낙하물과 시설물에 주의하세요',
    summary: '간판·나무·공사장 주변을 피하고 야외 물건을 단단히 고정합니다.',
    actions: ['간판과 화분 등 날릴 수 있는 물건 고정하기', '공사장·노후 건물·큰 나무 주변 피하기', '떨어진 전선에는 접근하지 않기'],
    tone: 'wind',
    sourceUrl: 'https://m.safekorea.go.kr/idsiSFK/neo/sfk/cs/contents/prevent/prevent04.jsp?menuSeq=126',
  },
  풍랑: {
    id: 'high-wave',
    hazard: '풍랑',
    title: '바다와 방파제에서 벗어나세요',
    summary: '낚시·야영·해양 활동을 중단하고 안전한 육상으로 이동합니다.',
    actions: ['해안가·갯바위·방파제에 접근하지 않기', '선박과 어망 등 해상 시설 고정하기', '해상 운항과 출입 통제 안내 따르기'],
    tone: 'wave',
    sourceUrl: 'https://m.safekorea.go.kr/idsiSFK/neo/sfk/cs/contents/prevent/prevent04.jsp?menuSeq=126',
  },
  대설: {
    id: 'heavy-snow',
    hazard: '대설',
    title: '이동 계획을 조정하세요',
    summary: '자가용 이용을 줄이고 불가피한 운전에는 월동 장비를 준비합니다.',
    actions: ['대중교통을 이용하고 불필요한 외출 줄이기', '차량에 체인·삽 등 월동 장비 준비하기', '보행 시 주머니에서 손을 빼고 천천히 이동하기'],
    tone: 'cold',
    sourceUrl: 'https://m.safekorea.go.kr/idsiSFK/neo/sfk/cs/contents/prevent/prevent05.jsp?menuSeq=126',
  },
  한파: {
    id: 'cold-wave',
    hazard: '한파',
    title: '보온과 동파에 대비하세요',
    summary: '노출 부위를 보호하고 수도관·계량기와 난방 상태를 확인합니다.',
    actions: ['외출 시 목도리·장갑 등 방한용품 착용하기', '수도관과 계량기를 보온재로 보호하기', '노약자와 어린이의 건강 상태 살피기'],
    tone: 'cold',
    sourceUrl: NATIONAL_SAFETY_GUIDE_URL,
  },
  건조: {
    id: 'dry-weather',
    hazard: '건조',
    title: '작은 불씨도 철저히 관리하세요',
    summary: '산림과 야외에서 불을 사용하지 말고 화재 위험 요소를 점검합니다.',
    actions: ['산림 인접 지역에서 쓰레기 소각하지 않기', '담배꽁초와 불씨를 완전히 끄기', '화재 발견 시 안전한 곳에서 119에 신고하기'],
    tone: 'dry',
    sourceUrl: NATIONAL_SAFETY_GUIDE_URL,
  },
  황사: {
    id: 'yellow-dust',
    hazard: '황사',
    title: '호흡기 노출을 줄이세요',
    summary: '외출을 줄이고 창문을 닫아 실내로 들어오는 먼지를 최소화합니다.',
    actions: ['외출을 줄이고 필요하면 보건용 마스크 착용하기', '창문을 닫고 실내 공기 상태 관리하기', '귀가 후 손과 얼굴을 깨끗이 씻기'],
    tone: 'dust',
    sourceUrl: NATIONAL_SAFETY_GUIDE_URL,
  },
  폭풍해일: {
    id: 'storm-surge',
    hazard: '폭풍해일',
    title: '해안에서 높은 곳으로 이동하세요',
    summary: '해안 저지대를 벗어나 지정된 대피 장소나 높은 곳으로 이동합니다.',
    actions: ['해안도로·방파제·저지대에 접근하지 않기', '대피 경로와 가까운 높은 장소 확인하기', '지자체 출입 통제와 대피 명령 따르기'],
    tone: 'wave',
    sourceUrl: NATIONAL_SAFETY_GUIDE_URL,
  },
}

const defaultGuide = {
  id: 'weather-warning',
  hazard: '기상특보',
  title: '공식 안내를 계속 확인하세요',
  summary: '기상청 발표와 재난문자, 현장 통제 안내를 우선하여 행동합니다.',
  actions: ['최신 기상특보와 재난문자 확인하기', '위험 지역과 통제 구역에 접근하지 않기', '필요한 경우 가까운 안전한 장소로 이동하기'],
  tone: 'default',
  sourceUrl: NATIONAL_SAFETY_GUIDE_URL,
}

export const getSafetyGuide = (hazard) => {
  return safetyGuideMap[hazard] ?? defaultGuide
}
