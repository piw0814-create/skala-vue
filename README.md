따로 하고있는 프로젝트 포트번호랑 겹쳐서 포트번호를 3001번으로 했습니다.

# 실습1. Weather Mockup(WeatherMockup.vue 수정)

1. 배열 렌더링 : v-for 이용, 임의의 날씨 데이터 배열을 활용해 화면에 날씨 카드를 반복 출력한다.key='city.id'
2. 조건부 렌더링 : v-if이용, 온도에 따라 라벨 붙이기
3. 양방향 바인딩 및 한글처리 : :value, @input이용, 도시 이름을 한글로 검색하는 input이용
4. 이벤트 및 수식어 :

- 지역별 날씨 현황 카드를 누르면 상태바에 “{도시}이 선택되었습니다.” 표기
- 지역별 날씨 현황 카드 내부의 [상세보기] 버튼을 누르면 버블링 없이 해당 도시의 날씨 내용을 window.alert로 띄운다.
- ref('')를 만든뒤 v-model로 양방향 연결

5. 본인만의 데이터 추가하고 이를 기초로 목업 추가

- 도시검색 필터
  - v-model.trim으로 검색어를 입력받음.
  - v-if="city.name.includes(searchCity)"를 이용하여 검색어가 포함된 도시만 화면에 표시.
  - 검색어가 변경되면 Vue의 반응형 상태에 따라 화면도 자동으로 변경 확인.
    ![alt text](image-1.png)
- 선택된 카드 강조
  - 현재 선택된 도시의 ID를 selectedCityId에 저장.
  - 카드를 클릭하면 선택한 도시 ID와 상태 문구를 변경.
  - 현재 카드의 ID와 selectedCityId가 같으면 selected 클래스를 추가하여 CSS로 강조.
    ![alt text](image-2.png)

- 상세정보 펼치기/접기
  - detailCityId에 현재 상세정보가 열린 도시 ID를 저장.
  - toggleDetail() 함수에서 같은 카드를 다시 누르면 닫고, 다른 카드를 누르면 해당 도시의 상세정보를 표시.
  - v-show를 이용해 상세정보 영역의 표시 여부를 제어.
    ![alt text](image-3.png)

# 실습2. Weather Composition (WeatherComposition.vue 파일 수정)

1. 반응형 상태 3개 만들기
2. 검색 도시 (computed 활용)
3. 반응형 변수 변화 감시 (watch, watchEffect)
4. 검색 결과 표시 (Template 영역)

5. 본인만의 반응형 상태 변수, Computed, Watcher를 추가한다.

- 체감온도 및 기상 경고 기능 추가
  - weatherList의 기온·습도·풍속 데이터를 기반으로 computed()에서 도시별 체감온도를 계산하고, 실제 기온과 함께 화면에 표시. 사용자가 설정한 체감온도 경고 기준은 ref()로 관리하고, watch()를 이용해 기준값 변경 시 후속 로그를 출력
    - 체감온도 AT = 기온 + 0.33 × 수증기압 - 0.70 × 풍속 - 4 으로 대충 계산
    - 체감온도 경고 기준 예: 30℃
    - computed
      - 각 도시의 체감온도 계산
      - 체감온도가 가장 높은 도시 계산
    - watch
      - 경고 기준이 변경되면 로그 출력
    - 각 도시의 체감온도가 사용자가 설정한 경고 기준 이상이면 v-if를 이용해 경고 메시지 표시

![alt text](image-4.png)

# 실습3. Weather Component (WeatherParent.vue 등 수정)

1. WeatherParent.vue

- 모든 반응형 데이터 유지

2. BaseDashboardCard.vue

- 검색박스와 리스트박스의 디자인을 공통화.
- <slot> 배치하여 부모 컴포넌트가 도시 검색, 날씨 현황 주입

3. SearchBar.vue

- 부모로 부터 검색도시 반응형 데이터를 전달받아 표시 (props)
- 도시 검색 시 update-query 이벤트를 발생하면서 검색어를 부모에게 전달 (emits)

4. WeatheCard.vue

- 선택된 도시 객체를 전달 받아 표시 (props)
- 카드를 선택하는 것(select-card 이벤트)과 상세보기(click-detail 이벤트)를 부모에게 전달
  (emits)

5. 각 컴포넌트로 분리하면서 Component에 해당되는 디자인은 <style scoped>로 각각 분리
6. [참고] Slot으로 전달되는 자식 컴포넌트(SearchBar, WeatherCard)는 시각적으로는
   BaseDashboardCard 내부에 위치하지만, 스크립트적으로는 부모 컴포넌트의 스코프에서 컴파
   일되고 평가되므로, WeatherParent에서 SearchBar와 WeatherCard와 직접 바인딩/통신이 가능
   하다.
7. 본인의 Mockup 부분에서 추가로 Component하거나 위의 Component를 더 분리하여 추가
   Component를 만든다.

- 먼저 실습 2에서 작업했던 체감온도 관련 기능들을 WeatherParent.vue로 옮긴다.
  - weatherList, 검색어, 선택된 도시, 상세보기 상태, 체감온도 경고 기준 등의 상태를 부모에서 관리
  - computed()를 이용해 체감온도 계산 결과, 검색 결과, 최고 체감온도 도시, 경고 기준 이상 도시 목록을 계산
  - 각 자식 Component에는 필요한 값만 Props로 전달하고, 사용자 이벤트는 Emits로 부모에게 전달
- WeatherCard.vue
  - 기존 도시별 날씨 카드를 유지하면서 상세 기능을 추가
  - Props
    - cityItem: 도시 날씨 객체
    - selected: 현재 선택된 카드인지 여부
    - detailOpen: 상세정보 표시 여부
    - feelsLikeThreshold: 체감온도 경고 기준
  - Emits
    - select-card: 카드 클릭 시 cityItem을 부모에게 전달
    - click-detail: 상세보기 클릭 시 cityItem을 부모에게 전달
  - 상세보기 버튼의 .stop을 유지하여 버튼 클릭 이벤트가 카드 클릭 이벤트까지 전파되지 않도록 처리
  - 습도, 풍속, 체감온도 및 경고 문구를 상세정보 영역에 추가
- FeelsLikeThreshold.vue
  - 체감온도 경고 기준 설정 영역을 별도 Component로 분리
  - Props
    - threshold: 부모가 관리하는 현재 체감온도 경고 기준
  - Emits
    - update-threshold: 사용자가 입력한 새로운 경고 기준값을 부모에게 전달
  - 부모는 전달받은 값으로 feelsLikeThreshold 상태를 변경
- HottestCity.vue
  - 현재 체감온도가 가장 높은 도시를 표시하는 영역을 별도 Component로 분리
  - Props
    - city: 부모의 hottestFeelsLikeCity에서 계산된 도시 객체
  - 별도의 사용자 입력이 없으므로 Emits 없이 Props를 이용해 결과만 출력
- HeatWarningList.vue (신규 기능)
  - 현재 체감온도가 설정된 경고 기준 이상인 도시 목록을 표시
  - 부모의 warningCities에서 weatherWithFeelsLike와 feelsLikeThreshold를 이용해 대상 도시를 계산
  - Props
    - cities: 체감온도가 경고 기준 이상인 도시 배열
    - threshold: 현재 체감온도 경고 기준
  - 별도의 상태 변경 없이 부모에서 계산된 값을 받아 목록으로 출력
  - Scoped Slot을 사용하여 반복 중인 city 데이터를 부모에 전달하고, 부모에서 각 경고 도시의 출력 형식을 결정할 수 있도록 구성 연습

- 최종적으로 WeatherParent.vue는 상태·계산·이벤트 처리 로직을 관리하고, 각 자식 Component는 Props로 필요한 데이터를 받아 화면을 표시하며 필요한 사용자 동작은 Emits로 부모에게 전달하도록 역할을 분리

![alt text](image-5.png)

# 실습4. Weather Router

1. Vue Router 설정 : 라우터 지연 로딩 적용, Catch-all Route 적용
2. App.vue : Navigation Bar 추가 (RouterLink) 및 메인 콘텐츠 영역 배치(RouterView)
3. WeatherHomeView.vue : WeatherParent 대체 (WeatherParent를 참고하여 / 경로에 맞게 작성)

- 상세보기 버튼 클릭 시 window.alert()를 제거하고, Programmatic Navigation 처리 (router.push('/weather/' + id))

4. WeatherDetailView.vue : 지역별 상세 기상관측 정보를 보여주는 페이지

- 도시 코드에 해당하는 Mock Data를 임시로 활용
- Router 동적 경로 매칭에 해당되는 도시ID (cityId)를 기반으로 Mount 시점에 Mock Data에서 도시 객체 선택

5. WeatherAboutView.vue : 적당한 내용 작성 및 메인 대시보드로 돌아가기 작성
6. 상기 정의된 view 이외에 본인의 추가 view 를 작성하고 Routing 한다.

- 추가 view 작성 전에 데이터를 통합 하고 싶음 -> 후에 배운 store 이용해봄
- weatherStore -> 상세내용은 실습5에서 설명

  현재

  WeatherHomeView
  → weatherList 따로 보유
  → 체감온도 계산 따로 보유
  → 경고 기준 따로 보유

  WeatherDetailView
  → mockDetails 따로 보유

  변경 후

                  weatherStore
                  ├─ weatherList
                  ├─ feelsLikeThreshold
                  ├─ 체감온도 계산 결과
                  ├─ 최고 체감온도 도시
                  └─ 경고 도시 목록
                        ↓
              ┌─────────┴─────────┐
              ↓                   ↓

        WeatherHomeView   WeatherDetailView

- WeatherStatsView (날씨 통계/평균)
  - router/index.js에 /stats 추가
  - WeatherStatsView.vue 작성
  - weatherStore의 날씨 데이터를 활용해 평균 기온·습도·풍속 및 최고/최저 도시 계산
  - 상세보기에서 /weather/:cityId로 이동
  - App.vue에 RouterLink로 /stats 연결
    ![alt text](image-6.png)

- WeatherWarningView (체감온도 경고 현황)
  - router/index.js에 /warnings 추가
  - WeatherWarningView.vue 작성
  - weatherStore의 warningCities, feelsLikeThreshold 활용
  - 경고 기준 이상인 도시의 기온·체감온도·습도·풍속 표시
  - 상세보기에서 /weather/:cityId로 이동
  - App.vue에 RouterLink로 /warnings 연결
    ![alt text](image-7.png)

# 실습5. Weather Store

1. UnitToggler.vue : 대시보드 상단에 배치되어 단위 설정을 변경하는 UI 버튼과 영역
2. Navigation Bar 옆에 UnitToggler.vue 배치
3. 메인과 상세 날씨에 단위 설정 변경 적용

- configStore의 unit, unitSymbol, toggleUnit() 활용
- WeatherCard.vue에 섭씨/화씨 변환 적용
- WeatherDetailView.vue에 섭씨/화씨 변환 적용
- computed()로 단위 변경 시 화면 온도 자동 갱신
- 원본 데이터와 경고 판정은 섭씨 기준 유지, 화면 표시값만 변환
- 중복되는 온도 변환 로직은 추후 Composable로 분리 가능

4. 본인만의 추가 Store를 작성하고 활용하거나, configStore에서 state, getter, action을 추가한다.

- weatherStore 추가 및 날씨 데이터 통합
- 공통 상태와 공통 계산 로직을 Store로 이동하여 View 간 데이터 중복을 제거하고, 각 View는 필요한 Store 데이터를 가져와 화면 표시와 페이지별 기능에 집중하도록 구성하였다.
  - **state**
    - weatherList
    - feelsLikeThreshold
  - **getters**
    - weatherWithFeelsLike : 각 도시의 체감온도 계산
    - hottestFeelsLikeCity : 최고 체감온도 도시
    - warningCities : 경고 기준 이상 도시 목록
    - getCityById : 도시 ID로 해당 도시 조회
    - cityCount : 전체 관측 도시 수
    - averageTemp : 평균 기온
    - averageHumidity : 평균 습도
    - averageWind : 평균 풍속
    - hottestCity : 최고 기온 도시
    - coldestCity : 최저 기온 도시
  - **actions**
    - updateThreshold() : 체감온도 경고 기준 변경
  - stores/weatherStore.js 생성
  - state에 weatherList, feelsLikeThreshold 저장
  - getters에 체감온도 계산, 최고 체감온도 도시, 경고 도시 목록, 도시 ID 조회 기능 작성
  - action으로 체감온도 경고 기준 변경 처리
  - WeatherHomeView.vue가 weatherStore의 공통 데이터를 사용하도록 수정
  - WeatherDetailView.vue의 별도 Mock Data를 제거하고 getCityById()로 Store 데이터 사용
  - 여러 View에서 동일한 날씨 데이터와 경고 기준을 공유하도록 구성
  - WeatherStatsView.vue에서 직접 계산하던 통계 로직을 Store의 getters로 이동
  - 관측 도시 수, 평균 기온·습도·풍속, 최고·최저 기온 도시를 Store에서 공통 계산
  - WeatherStatsView.vue는 통계 계산을 직접 하지 않고 weatherStore의 getter 결과를 화면에 출력하도록 수정
  - WeatherWarningView.vue에서도 warningCities, feelsLikeThreshold를 사용해 동일한 Store 상태 공유

5. 추가 : composable 사용

- WeatherCard, WeatherDetailView, HottestCity, WeatherWarningView, WeatherStatsView 등에서 모두 온도 변환이 필요해지니까 같은 코드가 계속 복사되는 문제 발생
- Composable은 Vue Composition API에서 여러 컴포넌트/View가 반복해서 사용하는 로직을 함수로 분리해 재사용하는 방식
  - Composable은 공통 로직을 use...() 함수로 분리하고, 필요한 상태나 Store를 내부에서 사용한 뒤, 외부에서 재사용할 함수나 반응형 값을 return하는 방식이다. 컴포넌트에서는 Composable을 호출해 필요한 기능을 구조분해하여 사용한다.
- 온도 변환 Composable 추가
  - src/composables/useTemperature.js 생성
  - 여러 Component/View에 중복되던 섭씨 ↔ 화씨 변환 로직을 하나의 Composable로 분리
  - configStore의 unit, unitSymbol을 이용해 현재 단위 설정 확인
  - convertTemp(temp)로 섭씨 원본값을 현재 설정 단위에 맞게 변환
  - formatTemp(temp)로 변환된 숫자와 ℃ / ℉ 단위를 함께 반환
  - 원본 weatherStore 데이터는 계속 섭씨 기준으로 유지하고, 화면 표시 시에만 변환

        useTemperature()
        ├─ configStore 사용
        ├─ convertTemp() → 숫자 변환
        └─ formatTemp() → 숫자 + 단위 표시

- 다른 view파일 모든 온도 표시를 formatTemp()로 통일
  ![alt text](image-8.png) ![alt text](image-9.png)

## 추가 기능 추가 : 즐겨찾기 체크박스 및 목록

- 도시 즐겨찾기 기능 추가
  - 기존에 학습한 checkbox를 활용해 각 WeatherCard에서 도시 즐겨찾기 선택/해제가 가능하도록 구현
  - WeatherCard.vue에 favorite Prop을 추가하여 부모에서 현재 즐겨찾기 여부 전달
  - 체크박스 변경 시 toggle-favorite Emit으로 도시 ID를 WeatherHomeView에 전달
  - WeatherHomeView.vue에서 Emit을 받아 weatherStore.toggleFavorite(cityId) Action 호출
  - weatherStore의 state에 favoriteCityIds를 추가하여 즐겨찾기 도시 ID를 전역 상태로 관리
  - getter에 favoriteCities를 추가하여 전체 도시 중 즐겨찾기된 도시만 필터링
  - action의 toggleFavorite()에서 push() / splice()를 이용해 즐겨찾기 추가·해제 처리
  - Store 상태 변경 시 favoriteCities Getter가 자동 재계산되는 Pinia의 반응형 흐름 활용
  - WeatherHomeView.vue에 activeTab을 ref()로 관리하여 전체 도시 / 즐겨찾기 탭 구현
  - 즐겨찾기 탭에서도 기존 WeatherCard 컴포넌트를 재사용하여 중복 UI 코드 최소화
  - 즐겨찾기 탭에서 체크 해제 시 Store 상태와 Getter가 갱신되어 해당 카드가 즉시 목록에서 제거
  - 체크박스에 @click.stop을 적용하여 체크 시 WeatherCard의 부모 클릭 이벤트까지 발생하는 이벤트 버블링 방지
  - 즐겨찾기와 상세보기 기능을 카드 우측 상단에 배치하도록 UI 수정
  - 전역 input CSS가 checkbox에도 적용되던 문제를 input:not([type='checkbox'])로 분리하여 해결

  - 동작 흐름: 체크박스 선택 → WeatherCard Emit → WeatherHomeView 이벤트 처리 → weatherStore Action → favoriteCityIds 변경 → favoriteCities Getter 재계산 → 즐겨찾기 탭 자동 갱신

  ![alt text](image-10.png)

# 실습 6 API

1. OpenWeatherMap API를 통해 실제 날씨 데이터를 가져와 적용한다.

- 기존 Mock Data를 제거하고 OpenWeatherMap의 Current Weather API를 Axios로 호출
- 도시별 위도·경도 정보를 cityConfigs로 관리
- Promise.all()을 사용해 여러 도시의 날씨 데이터를 동시에 요청
- async/await와 try/catch/finally를 활용해 비동기 통신과 오류·로딩 상태 처리
- API에서 받은 기온, 습도, 풍속, 날씨 상태를 기존 weatherList 형식으로 변환해 Pinia Store에 저장
- onMounted()에서 fetchWeatherList()를 실행해 페이지 진입 시 실시간 날씨를 자동 조회
- isLoading과 errorMessage를 이용해 로딩 및 통신 실패 상태를 화면에 표시
- 기존 체감온도, 통계, 경고, 즐겨찾기, 상세보기 기능이 실제 API 데이터를 사용하도록 연결
- API Key는 .env의 VITE_OPENWEATHER_API_KEY로 분리하여 관리
- 동작 흐름: onMounted → Store Action → Axios GET → OpenWeather API → JSON 응답 → weatherList 저장 → 화면 자동 갱신
  ![alt text](image-11.png)

2. OpenWeatherMap에서 제공되는 API를 추가하여 Application 기능을 확장한다.

- 기존 Current Weather API에 Air Pollution API를 추가하여 날씨와 대기질 데이터를 함께 조회
- 각 도시의 동일한 위도·경도(lat, lon)를 사용하여 두 API를 호출
- Promise.all()을 활용해 도시별 날씨 API와 대기질 API를 동시에 요청
- 모든 도시의 비동기 요청도 Promise.all()로 처리하여 여러 도시 데이터를 한꺼번에 조회
- Air Pollution API의 AQI 값을 1~5 단계로 받아 좋음·양호·보통·나쁨·매우 나쁨으로 변환
- PM2.5, PM10, CO, NO, NO2, O3, SO2, NH3 등의 대기오염 수치를 airQuality 객체로 저장
- 날씨 데이터와 대기질 데이터를 하나의 도시 객체로 합쳐 weatherList에 저장
- WeatherCard에는 간단하게 대기질 등급만 표시하여 목록의 가독성 유지
- WeatherDetailView에서는 AQI와 각 대기오염 물질의 상세 수치를 확인할 수 있도록 구성
- 동작 흐름: 도시 좌표 → Weather API + Air Pollution API 동시 호출 → 응답 데이터 결합 → weatherList 저장 → 카드/상세 화면에 반영
  ![alt text](image-12.png) ![alt text](image-13.png)

3. 기타 외부 API를 추가하여 Application 기능을 확장한다.

- Sunrise-Sunset 외부 API를 활용한 일출·일몰 정보 추가
  - OpenWeatherMap과 별개의 Sunrise-Sunset API를 추가하여 기타 외부 API 연동 구현
  - 기존 도시 데이터의 위도·경도(lat, lon)를 재사용하여 일출·일몰 정보를 조회
  - 기존 Weather API, Air Pollution API와 함께 Promise.all()로 동시에 호출
  - Sunrise-Sunset API 응답의 sunrise, sunset, day_length 값을 sunInfo 객체로 저장
  - 서로 다른 외부 API의 데이터를 하나의 도시 객체로 통합하여 weatherList에서 관리
  - WeatherDetailView에서 일출 시간, 일몰 시간, 낮 길이를 표시
  - ISO 형식의 시간을 formatTime()으로 보기 쉬운 현지 시간 형식으로 변환
  - 초 단위의 day_length 값을 formatDayLength()로 시간·분 형식으로 변환
  - 카드에는 기존 날씨·대기질 요약을 유지하고, 일출·일몰 정보는 상세페이지에서만 표시
  - 동작 흐름: 도시 좌표 → Weather API + Air Pollution API + Sunrise-Sunset API 동시 호출 → 응답 데이터 통합 → weatherList 저장 → 상세페이지에 표시
    ![alt text](image-14.png)

# 실습 7. 외부 UI Library를 선정하고 3일차 과제에 외부 UI Library를 자유롭게 적용해 본다.

- npm으로 Element Plus를 설치하고 main.js에 전역 등록
- 기존 상세보기 button을 el-button 컴포넌트로 교체
- type, size, plain, round 등의 Props를 변경하며 버튼 디자인 테스트
- 기존 @click, emit 구조는 그대로 유지하면서 UI만 라이브러리 컴포넌트로 변경
- 직접 CSS를 작성하지 않고 제공되는 UI 컴포넌트와 옵션을 활용해 화면 스타일을 빠르게 변경
  ![alt text](image-15.png)
- 전체적인 UI 변경
  - 여기서부턴 ai(코덱스) 본격적으로 사용합니다
  - Element Plus 적용
    - 검색창, 경고 기준 입력, 탭, 버튼, Tag
    - Loading Skeleton, Error Alert, Empty 화면
    - 통계, 진행 단계, 404 화면

  - Lucide 아이콘 적용
    - 날씨, 기온, 습도, 풍속, 즐겨찾기, 일출·일몰, 메뉴 아이콘 통일

  - ECharts 적용
    - 통계 페이지에 도시별 현재 기온·체감온도 막대그래프 추가
    - 섭씨·화씨 변경 시 차트도 반응형으로 변경

  - 화면 디자인 개선
    - 공통 헤더와 내비게이션
    - WeatherCard 정보 계층 정리
    - 상세·통계·경고·소개·404 화면 디자인 통일
    - 데스크톱·모바일 반응형 적용

  - 기능 개선
    - API 새로고침 버튼
    - 마지막 갱신 시각
    - 상세·통계·경고 URL 직접 접근 시 API 자동 조회
    - 상세보기 Emit 연결 오류 수정
    - Loading·Error·데이터 없음 상태 개선

  - 코드 정리 - 인라인 이벤트를 이름 있는 함수로 분리 - 중복 전역 CSS를 scoped CSS로 이동
    ![alt text](image-16.png), ![alt text](image-17.png), ![alt text](image-18.png) ![alt text](image-19.png)

# 실습 8. Hands on - Weather Refinement Modern JavaScript

- 작성된 과제물을 더 정교하고 완성도 높게 디테일을 다듬는다.

1. 완성도를 높일 외부 라이브러리를 추가하면서 기능을 정비한다.
2. 스타일을 다듬어 완성도를 높인다.
3. README 파일에 과제에 대한 내용을 정리한다.

- 생활 날씨 코치 기능 추가
  - 야외활동, 빨래, 출퇴근 중 오늘 할 활동을 v-model로 선택
  - 선택한 활동에 필요한 날씨 주의 요소, 주의 시간대, 준비물을 제공
  - computed()를 사용하여 활동이 변경될 때 코칭 결과를 자동으로 다시 계산
  - 활동별 시간 범위를 적용해 필요한 시간의 예보만 분석
  - 비, 바람, 더위, 추위, 눈, 시야, 대기질 위험을 서로 다른 기준으로 판별
  - 부모 컴포넌트가 Props로 도시·예보 데이터를 전달하고 자식 컴포넌트는 Emits로 재조회 요청
  - v-if로 로딩, 오류, 데이터 없음, 정상 결과 화면을 구분
  - v-for와 :key를 사용해 위험 요소와 준비물 목록을 렌더링
    ![alt text](image-25.png)
- 여행 날씨 코치 기능 추가
  - 도시, 여행 날짜, 여행 유형을 선택하여 미래 날씨 분석
  - 오늘을 포함한 5일간의 예보 조회 지원
  - 도시 여행, 캠핑, 등산, 자동차 여행에 서로 다른 바람·강수 위험 기준 적용
  - TravelPlannerForm, TravelRiskList, TravelPackingList 등으로 기능을 컴포넌트화
  - 입력 컴포넌트는 Props로 값을 받고 update:\* 이벤트를 발생시켜 v-model 구현
  - useTravelCoach Composable에서 위험 분석과 준비물 생성 로직을 공통 관리
  - computed()로 날짜나 여행 유형이 변경될 때 분석 결과를 자동 갱신
  - 비, 돌풍, 체감온도, 자외선, 대기질, 가시거리, 눈 위험을 종합적으로 분석
    ![alt text](image-22.png)
- Open-Meteo와 OpenWeather를 활용한 예보 전환 기능 추가
  - 기본 미래 예보는 Open-Meteo 날씨 API와 대기질 API를 사용
  - 기본 API가 요청 제한 또는 오류로 실패하면 OpenWeather API를 자동 호출
  - OpenWeather의 5일·3시간 날씨 예보와 대기질 예보를 대체 데이터로 사용
  - Axios와 async/await, try/catch를 사용하여 API 실패 상황 처리
  - 현재 사용 중인 데이터 제공처와 대체 예보 사용 여부를 Pinia Store에 저장
  - v-if를 활용해 대체 예보 사용 중이라는 안내 문구 표시
    ![alt text](image-21.png)
- 기상청 공식 특보 및 안전 센터 기능 추가
  - 기상청 API를 이용해 현재 발표된 공식 기상특보 조회
  - 특보 지역명을 프로젝트의 도시 정보와 연결하여 도시별 특보 제공
  - officialWarningStore에서 특보 데이터, 로딩 상태, 오류 상태를 전역 관리
  - 대시보드, 생활 코치, 여행 코치, 안전 센터에서 동일한 특보 데이터 재사용
  - 공식 기상특보와 앱에서 계산한 체감온도 주의 정보를 명확히 구분
  - 폭염, 호우, 강풍 등 위험 유형별 행동 요령 제공
  - :class를 사용하여 주의·위험 단계에 따라 색상과 디자인 변경
  - onMounted()에서 초기 특보 데이터를 조회하고 새로고침 이벤트 지원
    ![alt text](image-23.png)
- Vue Router 기반 SPA 화면 확장
  - 대시보드, 여행 코치, 날씨 통계, 안전 센터, 서비스 소개, 도시 상세 화면 구성
  - URL과 각 View 컴포넌트를 Router의 routes 배열로 연결
  - RouterLink를 이용해 전체 페이지를 새로고침하지 않고 화면 이동
  - useRoute()로 URL의 도시 ID를 읽어 상세 날씨 조회
  - useRouter()를 이용해 카드 클릭 시 상세페이지로 이동
  - 존재하지 않는 주소는 Catch-all Route를 통해 Not Found 화면으로 연결
  - 각 View는 필요한 하위 컴포넌트를 조합하여 컴포넌트 기반 SPA 구조 구현

- **디자인 전면 개편**
  ![alt text](image-24.png)
  - 인트로 화면도 추가
    ![alt text](image-26.png)
  - 이미지 추가
    ![alt text](image-27.png)

- 코드 품질관리 부터 배포까지
