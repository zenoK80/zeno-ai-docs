# 파이프라인 실행 가이드

과목 제작 5단계를 API로 실행하는 방법입니다.
스크립트 코드가 어떻게 생겼는지는 [build-generate-doc.md](build-generate-doc.md)(코드 해설) 참고.

## 준비물 (1회)

- `.env.local`에 키 5개 — 이미 설정됨:
  `PERPLEXITY_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `XAI_API_KEY`, `CLAUDE_API_KEY`
- Node 18 이상 (`node --version`)

## 방법 A — 작업지시서 + 단계별 bat 더블클릭 (권장, 제일 쉬움)

1. **`실행/작업지시.md`** 에 과목·주제를 적는다:

   ```md
   ## 작업 1
   과목: git
   주제: Git 기초부터 실무까지
   ```

2. **원하는 단계의 bat 파일을 더블클릭**:

   | bat 파일 | 하는 일 |
   |----------|---------|
   | `실행/1단계_학습방향.bat` | 1단계만 (Grok) |
   | `실행/2단계_목차.bat` | 2단계만 (Perplexity) |
   | `실행/3단계_초안.bat` | 3단계만 (Claude — 완성 MDX 작성) |
   | `실행/4단계_검수.bat` | 4단계만 (Gemini) |
   | `실행/5단계_완성.bat` | 5단계만 (GPT — 보강 후 배치+빌드) |
   | `실행/전체_1부터5.bat` | **1~5 전부** 연속 실행 |

   창에 진행 로그가 나오고, 끝나면 아무 키나 눌러 닫는다.

- **다시 눌러도 안전**: 이미 만들어진 산출물이 있는 단계는 자동으로 건너뛴다 (API 비용 안 나감). 다시 만들고 싶을 때만 `다시: 예` 추가.
- 작업을 여러 개 적으면(`## 작업 2`…) 위에서부터 순서대로, 누른 bat의 단계로 실행된다.
- `키: 값` 줄만 읽으므로 나머지는 자유롭게 메모해도 된다.
- 선택 키:

  | 키 | 뜻 | 예 |
  |----|----|----|
  | 주제 | 1단계에 줄 상세 주제 | `주제: Git 기초부터 실무까지` |
  | 경로 | mdx가 들어갈 content 폴더 — 적으면 5단계가 AI 산출물 표기와 무관하게 **정확히 이 경로 사용** (권장) | `경로: content/web/react/react_1` |
  | 편 | 3·5단계 대상 편 지정 — 지정하면 **있어도 재생성** (수정용) | `편: 01` / `편: 1-4` / `편: 01,03,10` / `편: 전부` |
  | 다시 | 예 → 있는 것도 재생성 | `다시: 예` |
  | 전부 | 예 → 3·5단계 품질 게이트(첫 실행 시 1편만) 해제 | `전부: 예` |
  | 빌드 | 생략 → 5단계 빌드 건너뜀 | `빌드: 생략` |
  | 담당 | AI 교체 | `담당: grok` |
  | 모델 | 이번 실행 전체의 모델 교체 | `모델: sonar-reasoning-pro` |
  | 모델1~모델5 | 특정 단계의 모델만 교체 (모델3=초안 등) | `모델3: gpt-5-6-sol` |
  | 단계 | bat 없이 쓸 때만 필요 | `단계: 2-4` |

## 모델 선택과 비용

- 고를 수 있는 모델·가격 카탈로그는 **작업지시.md 안에** 정리되어 있다 (2026-08 기준). 기본값은 `scripts/lib/api.js`의 CONFIG 블록.
- **비용 자동 기록**: 실행할 때마다 호출별 비용이 `costs/연-월/연-월-일.md`(사람이 읽는 표)와 `costs/log.jsonl`(집계 원본)에 쌓인다. 실행 끝에 이번 실행 총액도 출력된다.
- **집계**: `실행/비용보고서.bat` 더블클릭 → 월별 / 과목별 / 과목×단계별 총액 (USD).

## 방법 B — AI 에이전트(Claude Code·Codex)에게 시키기

API 크레딧이 없거나, 구독 요금 안에서 처리하고 싶을 때. 에이전트에게 이렇게 말하면 된다:

> "react_1 3단계 해줘" / "작업지시.md 보고 4단계 진행해"

에이전트는 [AGENTS.md](../AGENTS.md)의 "단계를 실행하는 두 가지 방법 → 방법 B" 규칙에 따라, 해당 단계 지시문(`prompts/0N_*.md`)을 자기 지시로 삼아 **스크립트와 같은 위치·같은 파일명으로** 산출물을 만든다. 그래서 "1단계는 bat으로, 3단계는 Claude Code로" 처럼 **A·B를 단계마다 섞어 써도** 파이프라인이 그대로 이어진다.

## 방법 C — 터미널 명령어 (선택)

```bash
node scripts/generate-doc.js --subject <과목폴더명> --step <N | N-M> [옵션]
```

- `--subject`: 과목 폴더명(react_1처럼 영문 소문자+언더스코어). `prompts/plan/<과목>/`과 배치 경로에 쓰인다.
- `--step`: 숫자 하나(`3`)면 그 단계만, 범위(`1-5`, `2-4`)면 연속 일괄 실행.

## 단계별 담당 AI와 산출물

| 단계 | 담당 (기본) | 입력 | 산출물 |
|------|------------|------|--------|
| 1 학습방향 | Grok | 과목명·주제 | `prompts/plan/<과목>/01_학습방향.md` |
| 2 목차구성 | Perplexity | 01 | `.../02_목차.md` |
| 3 본문작성 | Claude | 01+02 (+05의 MDX 규칙) | `.../03_초안/NN_파일명.mdx` (편별 **완성 MDX**) |
| 4 검수 | Gemini | 02+03 전체 | `.../04_검수.md` |
| 5 보강·완성 | GPT | 03+04 (+00 규칙) | 검수 반영+보강한 최종본 → `content/<배치경로>/` + `_meta.js` + 빌드 |

3단계(Claude)가 완성 MDX를 쓰고, 5단계(GPT)가 다른 눈으로 검수 반영+살 붙이기를 한다. 비용을 아끼려면 작업지시서에 `보강: 생략` — 5단계가 API 없이 배치만 하고, 검수 반영은 Claude Code에게 시킨다. 최상위 메뉴 연결·커밋은 항상 Claude Code 몫.

## 추천 흐름: 처음엔 1편만 뽑아 품질 확인

전체 편수(수십 편)를 바로 돌리면 API 비용이 크므로, 1편으로 파이프라인 전체를 먼저 검증한다.

```bash
# ① 학습방향 초안 생성 → 파일 열어 검토·수정
node scripts/generate-doc.js --subject git --topic "Git 기초부터 실무까지" --step 1

# ② 목차 생성 → 목차 표·참고자료 검토
node scripts/generate-doc.js --subject git --step 2

# ③ 초안 1편만 생성 (--file 01 = 목차의 01편)
node scripts/generate-doc.js --subject git --step 3 --file 01

# ④ 검수
node scripts/generate-doc.js --subject git --step 4

# ⑤ MDX 변환 (dev 서버 켜져 있으면 --skip-build 필수, 아래 주의 참고)
node scripts/generate-doc.js --subject git --step 5 --skip-build
```

품질이 괜찮으면 확장:

```bash
node scripts/generate-doc.js --subject git --step 3      # 아직 없는 편 전부 생성
node scripts/generate-doc.js --subject git --step 4 --all # 전체 재검수
node scripts/generate-doc.js --subject git --step 5       # 전체 변환 + 빌드
```

한 번에 끝까지 돌리고 싶으면:

```bash
node scripts/generate-doc.js --subject git --step 1-5
```

(산출물은 전부 파일로 남으므로 끝나고 몰아서 검토 가능. 단, 1단계 학습방향을 검토 없이 그대로 쓰게 되므로 품질이 중요한 과목은 단계별 실행 권장)

## 옵션 전체

| 옵션 | 의미 |
|------|------|
| `--topic "..."` | 1단계에 줄 상세 주제 (기본값: subject) |
| `--file 05` | 3단계에서 특정 편만 생성 (번호 또는 전체 파일명) |
| `--all` | 이미 있는 산출물도 다시 생성 (기본: 없는 것만 = 끊겨도 이어하기) |
| `--skip-build` | 5단계에서 `npm run build` 생략 |
| `--provider grok` | 이번 실행의 담당 AI 교체 (perplexity·openai·gemini·grok·claude) |
| `--model <id>` | 모델만 교체 (예: `--model sonar-reasoning-pro`) |

- **교차 검수**: `--step 4 --provider grok` → 결과가 `04_검수_grok.md`로 분리 저장돼 Gemini 검수와 비교 가능.
- **기본 모델 변경**: `.env.local`에 `PPLX_MODEL`, `OPENAI_MODEL`, `GEMINI_MODEL`, `XAI_MODEL`, `CLAUDE_MODEL` 추가.

## 5단계 후 남는 수동 작업

1. 최상위 `content/_meta.js`에 카테고리·과목 연결 — [menu-structure.md](menu-structure.md) 절차대로
2. `npm run dev`로 브라우저 표본 확인 (볼드 렌더링 깨짐은 빌드로 안 걸러짐)
3. 커밋: `docs: 설명` 형식, AI 서명 금지

## 주의

- **dev 서버와 5단계 빌드는 동시에 못 돌린다** (`.next` 폴더 공유). 5단계 전에 dev를 끄거나 `--skip-build`로 돌리고 나중에 빌드.
- 3단계는 편당 API 1회 호출 — 30편이면 30회. 순차 실행이라 시간도 편당 수 분씩 걸릴 수 있다.
- 특정 편만 다시 변환하려면: 해당 `.mdx` 삭제 후 5단계 재실행 (또는 `--all`로 전체 재변환).

## 트러블슈팅

| 증상 | 원인·해결 |
|------|-----------|
| `401 Unauthorized` | 키 오타 또는 해당 회사 결제 미등록. `.env.local` 확인 |
| `404 model not found` | 모델명이 그 회사에 없음. `--model`이나 `.env.local`의 `*_MODEL`로 유효한 모델 지정 |
| `429 rate limit` | 잠시 후 같은 명령 재실행 (없는 것만 이어서 생성되므로 안전) |
| 컨텍스트 초과 (4단계) | 초안이 매우 많을 때. 절반씩 나눠 검수하거나 편수를 줄여 재시도 |
| 5단계 빌드 실패 | 생성된 .mdx가 MDX 금지 규칙 위반. 에러에 찍힌 파일을 [prompts/05_최종완성.md](../prompts/05_최종완성.md) 규칙과 대조해 수정 |
| `N단계를 먼저 실행하세요` | 이전 단계 산출물이 없음. 안내대로 이전 단계부터 |
