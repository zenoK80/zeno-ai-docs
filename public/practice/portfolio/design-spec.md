# 포트폴리오 사이트 디자인 시안 (HTML·CSS 4과목 공통)

이 문서는 `html_fundamentals → modern_html → css_fundamentals → modern_css` 네 과목이 함께 만드는 **개인 포트폴리오 사이트**의 확정 시안이다. 본문의 코드는 전부 이 문서의 이름·값을 그대로 쓴다.

## 1. 사이트 구성

| 파일 | 역할 | 주요 영역(위→아래) |
|------|------|--------------------|
| `index.html` | 소개 | 헤더(로고+내비) → 히어로(이름·한 줄 소개·CTA 버튼 2개) → 소개(About, 프로필 사진+3문단) → 기술 스택(리스트) → 경력(표) → 푸터 |
| `projects.html` | 프로젝트 | 헤더 → 페이지 제목 → 프로젝트 카드 그리드(6개) → 푸터 |
| `contact.html` | 연락 | 헤더 → 페이지 제목 → 연락 폼 → 연락처 정보(주소·이메일·SNS) → 푸터 |

공통: 헤더는 `<header>` 안에 `<a class="logo">` + `<nav>`(3개 링크, 현재 페이지에 `aria-current="page"`). 푸터는 저작권 문구 + SNS 링크 리스트.

## 2. 폴더 구조

```
portfolio/
├── index.html
├── projects.html
├── contact.html
├── css/
│   ├── tokens.css      ← 색·간격·타이포 변수 (css_fundamentals 04편부터)
│   └── styles.css      ← 나머지 전부 (modern_css 03편에서 @layer로 재구성)
├── js/
│   └── main.js         ← modern_html에서 dialog/popover 보조 스크립트
├── images/
│   ├── profile.svg     (400×400, 플레이스홀더 — 원하는 사진으로 교체 가능)
│   ├── project-01.svg … project-06.svg  (1200×800, 3:2)
│   └── og-image.svg    (1200×630)
└── favicon.svg
```

## 3. 디자인 토큰 (css/tokens.css 에 그대로)

```css
:root {
  /* 색 */
  --color-bg: #ffffff;
  --color-surface: #f6f7f9;
  --color-text: #1f2328;
  --color-text-muted: #59636e;
  --color-primary: #0969da;
  --color-primary-hover: #0550ae;
  --color-border: #d0d7de;
  --color-accent: #bf3989;

  /* 타이포 */
  --font-sans: "Pretendard", "Noto Sans KR", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --text-xs: 0.75rem;   /* 12px */
  --text-sm: 0.875rem;  /* 14px */
  --text-base: 1rem;    /* 16px */
  --text-lg: 1.25rem;   /* 20px */
  --text-xl: 1.5rem;    /* 24px */
  --text-2xl: 2rem;     /* 32px */
  --text-3xl: 3rem;     /* 48px, 히어로 제목 */
  --leading: 1.6;

  /* 간격 (4px 배수) */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* 레이아웃 */
  --container-max: 72rem;   /* 1152px */
  --radius: 0.5rem;
  --shadow: 0 1px 3px rgb(0 0 0 / 0.1), 0 4px 12px rgb(0 0 0 / 0.06);
  --header-height: 4rem;
}
```

다크모드(modern_css 13편)에서는 `--color-bg: #0d1117; --color-surface: #161b22; --color-text: #e6edf3; --color-text-muted: #9198a1; --color-border: #30363d; --color-primary: #58a6ff;`.

## 4. 레이아웃 스펙

### 브레이크포인트
- 모바일: 기본(~767px), 1열
- 태블릿: `min-width: 768px`, 카드 2열
- 데스크톱: `min-width: 1024px`, 카드 3열, 내비 가로 노출

### 헤더
- 높이 `--header-height`, 상단 고정(`position: sticky; top: 0`), 배경 `--color-bg`, 하단 1px `--color-border`
- 좌측 로고(텍스트 "Zeno Kim", `--text-lg`, 굵게), 우측 내비(링크 간격 `--space-6`)
- 모바일: 내비 숨김, 햄버거 버튼 → modern_html의 popover 메뉴로 열림

### 히어로 (index)
- 세로 여백 `--space-16`, 제목 `--text-3xl`(모바일 `--text-2xl`), 부제 `--text-lg` muted
- 버튼 2개: 기본(`--color-primary` 배경, 흰 글자) / 보조(테두리만). 높이 2.75rem, 좌우 여백 `--space-6`, 반경 `--radius`

### 프로젝트 카드
- `--color-surface` 배경, 1px 테두리, `--radius`, hover 시 `--shadow` + `translateY(-2px)` 전환 200ms
- 구조: 썸네일(3:2, `object-fit: cover`) → 제목(`--text-lg`) → 2줄 설명 → 태그 리스트(칩) → "자세히" 버튼(modern_html에서 dialog 열기)
- 그리드 간격 `--space-6`

### 폼 (contact)
- 필드: 이름(text, required) · 이메일(email, required) · 문의 유형(select: 협업/채용/기타) · 메시지(textarea, minlength 10) · 개인정보 동의(checkbox, required)
- 라벨 위, 입력 아래 도움말/오류 문구(`--text-sm`), 포커스 링 2px `--color-primary`
- 잘못된 필드 테두리 `--color-accent`

### 표 (경력)
- 열: 기간 · 회사 · 역할 · 주요 업무. 헤더 배경 `--color-surface`, 행 구분선 1px

## 5. 원고 (copy.md 참조)
이름·소개·프로젝트 6개·경력 3건·연락처는 `copy.md`의 텍스트를 그대로 쓴다. 가상의 인물 "Zeno Kim"이며 실제 개인정보가 아니다.
