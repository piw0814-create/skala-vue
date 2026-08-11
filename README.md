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
