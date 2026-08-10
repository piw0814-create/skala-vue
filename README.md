## DAY1 실습 요약

- {{ 변수 }}
  → HTML 태그 "내용"에 연결

- v-text="변수"
  → HTML 태그 "내용"에 연결

- v-html="변수"
  → HTML 태그 "내용"을 HTML로 연결

- :속성="변수" (v-bind)
  → HTML 태그의 "속성"에 연결

- :class는 CSS 자체를 바꾸는 게 아니라, Vue 상태에 따라 어떤 CSS 클래스 이름을 HTML 요소에 적용할지 결정한다.

- :href="url"
  → href 속성을 상태와 연결

- :disabled="isDisabled"
  → disabled 속성을 상태와 연결

- :class="{ active: isActive }"
  → class 속성을 상태와 연결

- :style은 CSS 속성값 자체를 Vue 데이터로 직접 넣는 방식

- :class
  → CSS 클래스 이름을 동적으로 붙임
  → .text-danger 같은 미리 정의된 CSS 사용

- :style
  → CSS 속성값을 직접 동적으로 넣음
  → color, fontSize 등을 바로 설정

- v-if, v-else-if, v-else

- v-show

- v-for

  ▪ 배열 렌더링:
  • <div v-for="(item, index) in items" :key="고유값"></div>
  • <div v-for="item in items" :key="고유값"></div>
  ▪ 객체 렌더링:
  • <div v-for="(value, key, index) in object" :key="고유값"></div>
  • <div v-for="(value, key) in object" :key="고유값"></div>
  • <div v-for="value in object" :key="고유값"></div>

# DAY1 궁금한점

- 화살표 함수는 자기 자신의 this를 만들지 않아서, 객체 자기 자신을 this로 접근하는 메서드에는 보통 일반 메서드 문법을 쓰는 게 좋다.
  반면 Vue의 <script setup>에서는 객체의 this를 사용할 일이 거의 없어서 화살표 함수로 함수/이벤트 핸들러를 만드는 방식이 아주 자주 나옴

- v-for에서 키 사용 이유

`v-for`에서 고유값인 `:key`가 필요한 이유는 **Vue가 반복된 각 항목을 서로 구분하기 위해서**다

예를 들어:

```vue
<li v-for="item in items" :key="item.id">
  {{ item.name }}
</li>
```

여기서 Vue는:

```text
id=101 → 아이폰
id=102 → 갤럭시
id=103 → 픽셀
```

처럼 각 `<li>`가 어떤 데이터와 연결된 요소인지 기억.

이게 중요한 건 배열이 바뀔 때. 예를 들어:

```text
처음
101 아이폰
102 갤럭시
103 픽셀
```

여기서 `102 갤럭시`를 삭제하면 Vue는 `key`를 보고:

```text
101은 그대로
102는 삭제
103은 그대로
```

라고 정확하게 판단.

`key`가 없으면 Vue는 단순히 **현재 위치를 기준으로 DOM을 재사용**하려고 해서, 입력창이나 컴포넌트 내부 상태가 있는 경우 엉뚱한 항목의 상태가 남을 수 있다.

그래서:

```vue
:key="item.id"
```

는 Vue에게

> “이 HTML 요소의 신분증은 `item.id`”

라고 알려주는 것과 비슷.

그리고 가능하면:

```vue
:key="index"
```

보다는:

```vue
:key="item.id"
```

를 쓰는 게 좋다. `index`는 항목을 삭제하거나 순서를 바꾸면 값이 달라질 수 있지만, `item.id`는 데이터 자체의 고유값이라 안정적이기 때문.

한 줄 정리하면:

> **`:key`는 Vue가 `v-for`로 만들어진 각각의 DOM/컴포넌트를 정확히 식별해서 추가·삭제·순서변경 때 올바르게 재사용하기 위해 필요하다.**
