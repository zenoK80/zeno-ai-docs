# 메뉴 구조 가이드

## 현재 구조

헤더는 **Web / 독학사 / 자격증** 세 개다. Web과 독학사는 과목까지 3뎁스이며, 자격증은 중간 분류 없이 과목으로 이어진다. 과목 안의 개별 문서는 문서 사이드바에서 탐색한다.

```
content/
├── _meta.js
├── index.mdx
├── web/
│   ├── _meta.js
│   ├── html/
│   │   ├── _meta.js
│   │   ├── html_fundamentals/
│   │   │   ├── _meta.js
│   │   │   └── NN_document.mdx
│   │   └── modern_html/
│   ├── css/
│   ├── javascript/
│   └── react/
├── 독학사/
│   ├── _meta.js
│   ├── 1단계/
│   │   ├── _meta.js
│   │   ├── 영어/
│   │   ├── 일반수학/
│   │   └── 기초통계학/
│   ├── 2단계/
│   ├── 3단계/
│   └── 4단계/
└── 자격증/
    ├── _meta.js
    ├── SQLD/
    └── ...
```

- Web → HTML → HTML 기본기 / 모던 HTML.
- Web → CSS → CSS 기본기 / 모던 CSS.
- Web → JavaScript → ECMAScript / Web APIs.
- Web → React → React 기초 / 중급 / 실무.
- Web → Web Platform / UI Libraries / Backend / DevOps → 준비중.
- 독학사 → 독학사 1~4단계 → 각 단계의 과목.
- 자격증 → 기존 자격증 과목.

## 헤더와 사이드바

`app/components/docs-navbar.tsx`는 Nextra의 pageMap을 재귀 탐색한다. 중간 폴더는 펼침 메뉴, 실제 MDX가 있는 과목 폴더는 첫 문서 링크가 된다.

데스크톱에서는 상단 메뉴에 호버하면 첫 드롭다운이 열리고, HTML 등의 중간 분류에 호버하면 오른쪽 과목 패널이 열린다. 버튼 클릭과 키보드도 지원한다. 아래 화살표는 첫 목록, 오른쪽 화살표는 과목 패널로 진입하고, 왼쪽 화살표와 Escape로 닫는다.

모바일은 동일한 pageMap을 사용하는 Nextra 계층형 메뉴를 이용한다. 현재 반응형 기준은 1780px이며 CSS와 컴포넌트의 matchMedia를 함께 변경해야 한다. CSS 중간 폭 규칙은 문서 사이드바·목차에도 영향을 준다.

## _meta.js 작성

최상위와 중간 폴더는 실제 하위 폴더명에 표시 제목과 순서를 연결한다.

```js
const meta = {
  html: { title: 'HTML', type: 'page' },
  css: { title: 'CSS', type: 'page' },
}
export default meta
```

과목 폴더에서는 실제 문서 파일명과 제목을 연결한다.

```js
const meta = {
  '01_what-is-html-and-its-role': '01. HTML은 무엇이며 어떤 역할을 하는가',
}
export default meta
```

문서가 없는 준비중 카테고리만 `type: 'menu'`와 `href: '#coming-soon'`을 사용한다. 이 가상 메뉴는 실제 폴더 없이 등록할 수 있으며, 클릭하면 알림이 표시된다. 현재 네 개의 준비중 카테고리는 `content/web/_meta.js`에서 관리한다.

실제 과목이 생기면 가상 메뉴를 `type: 'page'`로 바꾸고 해당 폴더와 `_meta.js`, 과목 폴더와 MDX를 추가한다. 실제 페이지를 가리키는 메타 항목은 반드시 파일과 함께 유지한다.

폴더명은 공백·하이픈 없이 영문 소문자·한글·언더스코어를 사용한다. 기존 `ECMAscript` 등의 폴더명은 유지한다. 문서 파일은 `NN_kebab-case.mdx` 형식을 사용한다.

## 문서·과목 추가 및 삭제

1. 해당 경로에 실제 문서 또는 과목 폴더를 추가·이동·삭제한다.
2. 해당 계층의 `_meta.js`에 동일한 변경을 반영한다.
3. 내부 링크와 생성 작업의 배치 경로를 함께 확인한다.
4. `npm run build`로 메타 검증·정적 출력·검색 인덱스를 확인한다.
5. 브라우저에서 헤더의 오른쪽 과목 패널, 모바일 탐색, 문서와 홈 카드 링크를 확인한다.

새 Web 과목 경로 예: `content/web/html/html_fundamentals`.
독학사 과목 경로 예: `content/독학사/2단계/자료구조`.
자격증 과목 경로 예: `content/자격증/SQLD`.

## 홈 카드와 기존 주소

`scripts/gen-home-data.js`는 폴더 깊이에 관계없이 실제 MDX가 있는 과목까지 재귀 탐색한다. 과목의 바로 위 계층별로 카드를 묶고, 각 폴더의 `_meta.js` 순서와 제목을 사용한다. 첫 문서도 메타 순서를 따른다.

설명 우선순위는 `app/components/home-overrides.json`의 과목 폴더명 키 → 첫 문서의 description → 기본 문구다. 준비중 메뉴는 실제 문서가 없으므로 홈 카드에 포함하지 않는다.

2026-09 구조 변경의 이전 주소 매핑은 `scripts/lib/content-route-migrations.json`에 있다. `npm run build`의 postbuild에서 `scripts/export-legacy-redirects.js`가 예전 문서 주소에 이동용 HTML을 생성한다. 검색 인덱스와 사이트맵은 새 실제 문서를 사용하며, 이전 주소는 정적 배포 후 새 문서로 이동한다.
