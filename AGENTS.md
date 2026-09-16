# AGENTS.md — 프로젝트 안내판

이 프로젝트는 **Next.js + Nextra** 기반 학습 문서 사이트입니다.
이 파일은 얇은 안내판입니다. 세부 규칙은 아래 문서 지도의 각 파일에 있으므로,
작업 종류에 맞는 파일을 **먼저 읽고** 시작하세요.


> `prompts/` 폴더는 개인 작업 파일(기출 자료 등)을 포함해 저장소에 올리지 않는다. 로컬에만 존재한다.

## 문서 지도

| 파일 | 내용 |
|------|------|
| [guide/tech-stack.md](guide/tech-stack.md) | 프레임워크, 전역 컴포넌트, 시각화 라이브러리와 래퍼 매핑, 실행·빌드 명령어 |
| [guide/menu-structure.md](guide/menu-structure.md) | content 폴더 구조 = 메뉴 구조 원리, `_meta.js` 작성법, 문서·과목·카테고리 추가/삭제 절차 |
| [guide/run-generate-doc.md](guide/run-generate-doc.md) | 파이프라인 실행 가이드 — generate-doc.js 호출 방법·옵션·트러블슈팅 |
| [guide/build-generate-doc.md](guide/build-generate-doc.md) | 스크립트 코드 해설 — 각 파일이 무슨 일을 하는지 |
| [guide/deploy-github-pages.md](guide/deploy-github-pages.md) | 자동 배포 해부 — YAML 문법, `.github/workflows/` 규칙, deploy.yml 한 줄씩 해설, 직접 만드는 절차 |
| `prompts/01_학습방향.md` | 1단계: 과목 컨셉 정의 (Grok 담당) |
| `prompts/02_목차구성.md` | 2단계: 자료 조사 + 목차 설계 (Perplexity 담당) |
| `prompts/03_초안작성.md` | 3단계: 완성 MDX 본문 작성 + 글 품질 규칙 (Claude 담당) |
| `prompts/04_검수.md` | 4단계: 사실 확인·검산·퀴즈 검증 (Gemini 담당) |
| `prompts/05_최종완성.md` | MDX 금지 규칙 전문(3단계 작성 시에도 적용) + 검수 반영·배치·빌드·커밋 지침 |
| `prompts/06_실습형작성.md` | **코딩 과목(HTML·CSS·JS·React) 전용 규격** — 결과물 중심 목차, 편 구조, 영어 식별자, 짧은 문체. 시험 과목은 03의 DEEP 규격, 코딩 과목은 06을 따른다 |

## 과목 제작 흐름 (5단계)

과목 하나를 만들 때 아래 순서로 진행합니다.
각 단계의 중간 산출물은 `prompts/plan/[과목]/`에 저장하고,
**사용자가 검토·승인한 뒤에만** 다음 단계로 넘어갑니다.

1. **학습 방향** (Grok) — 과목 컨셉 정의 → `prompts/plan/[과목]/01_학습방향.md`
2. **목차 구성** (Perplexity) — 자료 조사 + 목차 설계 → `prompts/plan/[과목]/02_목차.md`
3. **본문 작성** (Claude API) — 편별 **완성 MDX**를 직접 작성 → `prompts/plan/[과목]/03_초안/NN_파일명.mdx`
4. **검수** (Gemini) — 사실 확인·검산·퀴즈 정답 검증 → `prompts/plan/[과목]/04_검수.md`
5. **보강·완성** (GPT) — 편별 검수 반영 + 내용·섹션 보강 → content 배치 + `_meta.js` 생성 + 빌드. 메뉴 연결·커밋은 Claude Code가 수행

전 단계를 API로 자동 실행할 수 있다 (키는 `.env.local`). 실행 방법 2가지 — 자세한 건 [guide/run-generate-doc.md](guide/run-generate-doc.md):

- **쉬운 방법**: `실행/작업지시.md`에 과목·주제 작성 → `실행/` 폴더의 원하는 단계 bat 더블클릭 (`1단계_학습방향.bat` … `5단계_완성.bat`, 전부는 `전체_1부터5.bat`)
- 터미널: `node scripts/generate-doc.js --subject <과목> --step <N | N-M>`

## 단계를 실행하는 두 가지 방법

**방법 A — API 자동 실행**: 위의 bat/스크립트 방식. `.env.local`의 키로 외부 모델을 호출한다.

**방법 B — AI 에이전트(Claude Code, Codex 등)에게 직접 시키기**: 사용자가 "react_1 3단계 해줘"라고 말하면, 에이전트는 API 스크립트를 돌리는 게 아니라 **자신이 그 단계의 담당 AI 역할을 수행**한다. 규칙:

1. 해당 단계의 지시문 `prompts/0N_*.md`를 읽고 **그 지시문이 곧 나에 대한 지시**라고 간주한다. MDX를 생성·수정하는 단계(3·5)는 `prompts/00_MDX규칙.md`도 함께 적용한다.
2. 입력·산출물의 **위치와 파일명은 스크립트와 완전히 동일하게** 한다 (`prompts/plan/[과목]/01_학습방향.md`, `02_목차.md`, `03_초안/NN_파일명.mdx`, `04_검수.md`, content 배치 경로). 그래야 방법 A와 B를 단계마다 섞어 써도 파이프라인이 이어진다.
3. 과목명·주제·배치 경로는 `실행/작업지시.md`를 읽어 따른다.
4. 이미 있는 산출물은 사용자가 시키지 않는 한 덮어쓰지 않는다.
5. 편수가 많은 3·5단계는 한 번에 다 쓰지 말고, 1편을 먼저 완성해 사용자 품질 확인을 받은 뒤 진행한다. 사용자가 편을 지정하면("10번만", "1~4편", "전부") 그 편들만 작업하고, 지정된 편은 이미 있어도 다시 만든다.

## 공통 규칙

- **컨셉**: 무조건 깊고 자세히(DEEP). 문서 길이·목차 편수에 제한을 두지 않는다 — 초보자가 읽어도 그 자리에서 전문가가 되게.
- **파일명**: `NN_kebab-case.mdx` (NN은 두 자리 숫자: 01, 02, … 10, 11, …)
- **과목·카테고리 폴더명**: `react_1`, `빅데이터분석기사_필기`처럼 **공백 없이 언더스코어(_)로 연결**한다. 한글도 가능하다. 하이픈(-)과 공백은 `_meta.js` 키에서 문법 오류를 일으키므로 금지 (파일명의 kebab-case와 헷갈리지 말 것 — 하이픈은 파일명에만)
- **frontmatter**: `title`, `description` 두 개만 사용
- **참고 자료**: 모든 MDX 파일은 예외 없이 맨 아래에 `## 참고 자료` 섹션을 두고, 실제 참고한 공식 문서·1차 출처만 링크
- **content 파일과 `_meta.js`는 항상 세트**: 문서를 추가·삭제하면 반드시 해당 폴더의 `_meta.js`도 함께 수정 (자세한 절차는 guide/menu-structure.md)
- **커밋 규칙**:
  - 메시지 형식: `docs: 내용 설명`
  - AI 어시스턴트 서명·공동 작성자 표시(Co-Authored-By 등) 금지
  - 과목 1개 완성 후 즉시 커밋·push
