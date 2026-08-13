const KMA_WARNING_ENDPOINT = 'https://apis.data.go.kr/1360000/WthrWrnInfoService/getPwnStatus'
const ALLOWED_QUERY_PARAMS = ['pageNo', 'numOfRows', 'dataType']
const REQUEST_TIMEOUT_MS = 10000

const normalizeServiceKey = (key = '') => {
  try {
    return decodeURIComponent(key)
  } catch {
    return key
  }
}

const createErrorResponse = (message, status) => {
  return Response.json({ message }, { status })
}

export async function GET(request) {
  const serviceKey = normalizeServiceKey(process.env.KMA_API_KEY)

  if (!serviceKey) {
    return createErrorResponse('KMA_API_KEY 환경 변수가 설정되지 않았습니다.', 500)
  }

  const requestUrl = new URL(request.url)
  const upstreamUrl = new URL(KMA_WARNING_ENDPOINT)

  for (const parameter of ALLOWED_QUERY_PARAMS) {
    const value = requestUrl.searchParams.get(parameter)

    if (value) {
      upstreamUrl.searchParams.set(parameter, value)
    }
  }

  upstreamUrl.searchParams.set('ServiceKey', serviceKey)

  try {
    const response = await fetch(upstreamUrl, {
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    return new Response(response.body, {
      status: response.status,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': response.headers.get('content-type') || 'application/json; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('기상청 API 프록시 요청 실패:', error)
    return createErrorResponse('기상청 API에 연결하지 못했습니다.', 502)
  }
}
