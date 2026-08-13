import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const normalizeServiceKey = (key = '') => {
  try {
    return decodeURIComponent(key)
  } catch {
    return key
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const projectRoot = fileURLToPath(new URL('.', import.meta.url))
  const env = loadEnv(mode, projectRoot, ['KMA_', 'VITE_KMA_'])
  const kmaApiKey = normalizeServiceKey(env.KMA_API_KEY || env.VITE_KMA_API_KEY)

  if (mode === 'development' && !env.KMA_API_KEY && env.VITE_KMA_API_KEY) {
    console.warn('[vite] VITE_KMA_API_KEY는 브라우저 공개 변수처럼 보일 수 있습니다. KMA_API_KEY로 이름을 변경해 주세요.')
  }

  return {
    plugins: [vue(), mode === 'development' && vueDevTools()].filter(Boolean),
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    // 🟢 [커스텀 추가 1] 로컬 개발 서버(Dev Server) 속성 제어
    server: {
      port: 3001, // 개발 서버 포트
      open: true, // 프로세스 기동(npm run dev) 시 기본 웹 브라우저를 자동 실행
      proxy: {
        // 기상청 공공데이터 API는 브라우저 CORS 요청을 허용하지 않아 개발 서버에서 중계
        '/kma-api': {
          target: 'https://apis.data.go.kr',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/kma-api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyRequest) => {
              if (!kmaApiKey) {
                return
              }

              const requestUrl = new URL(proxyRequest.path, 'https://apis.data.go.kr')
              requestUrl.searchParams.set('ServiceKey', kmaApiKey)
              proxyRequest.path = `${requestUrl.pathname}${requestUrl.search}`
            })
          },
        },
      },
    },
    // 🟢 [커스텀 추가 2] 컴파일 완료된 산출물(Production Build) 사양 제어
    build: {
      outDir: 'dist', // 최종 정적 리소스(HTML, JS, CSS)가 저장될 출력 디렉토리명 지정
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [
              {
                name: 'vue-vendor',
                test: /node_modules[\\/](?:@vue|vue|vue-router|pinia)[\\/]/,
                priority: 40,
              },
              {
                name: 'charts-vendor',
                test: /node_modules[\\/](?:echarts|zrender|vue-echarts)[\\/]/,
                priority: 30,
                maxSize: 400 * 1024,
              },
              {
                name: 'element-vendor',
                test: /node_modules[\\/](?:element-plus|@element-plus|@vueuse)[\\/]/,
                priority: 20,
                maxSize: 400 * 1024,
              },
              {
                name: 'vendor',
                test: /node_modules[\\/]/,
                priority: 10,
                maxSize: 400 * 1024,
              },
            ],
          },
        },
      },
    },
  }
})
