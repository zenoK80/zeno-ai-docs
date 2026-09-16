//----------------------------------------------------------------------------------
// [핵심 개념]
// 1. 이 단계 = GPT의 "보강 패스" + 배치·빌드:
//    ① 편별로 GPT가 03의 완성 MDX + 04 검수보고서를 읽고
//       검수 반영 + 추가하면 좋을 내용·섹션을 실제로 얹은 최종본을 출력
//    ② 출력을 content/ 배치 경로에 저장 ③ leaf _meta.js 자동 생성 ④ npm run build
// 2. "보강: 생략" 을 적으면 GPT 호출 없이 03 결과물을 그대로 복사만 한다 (비용 $0)
// 3. 수동으로 남긴 것: 최상위 content/_meta.js 메뉴 연결, 브라우저 표본 확인, 커밋
//    (검수 "확인 필요" 항목 판단 포함 — Claude Code에게 시키면 됨)
// 4. _meta.js는 "실제로 존재하는 .mdx"만 넣음 — 없는 페이지를 넣으면
//    nextra의 _meta 검증 에러로 빌드가 깨짐 (일부 편만 테스트할 때 중요)
//----------------------------------------------------------------------------------
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const { ROOT } = require('../lib/env')
const { readInstruction, readOrFail, writeOut, parseToc, filterEpisodes } = require('../lib/files')

//----------------------------------------------------------------------------------
// [1] 배치 경로 결정
// - 최우선: 작업지시.md의 "경로:" (opts.path) — 사용자가 명시한 값을 그대로 사용
// - 없을 때만: 02_목차.md 본문에서 "content/..." 문자열을 추출 (AI 산출물 의존)
//----------------------------------------------------------------------------------
function resolveContentPath(opts, toc) {
  if (opts.path) {
    const p = opts.path.trim().replace(/\\/g, '/').replace(/\/$/, '')
    if (!/^content\//.test(p)) {
      throw new Error(`경로는 content/ 로 시작해야 합니다: "${opts.path}" (예: content/web/react/react_1)`)
    }
    console.log(`  배치 경로(작업지시서 지정): ${p}`)
    return p
  }
  const m = toc.match(/content\/[A-Za-z0-9_\-/]+/)
  if (!m) throw new Error('배치 경로를 알 수 없습니다. 작업지시.md에 "경로: content/..." 를 적어주세요.')
  console.log(`  배치 경로(목차 문서에서 추출): ${m[0]}`)
  return m[0].replace(/\/$/, '')
}

module.exports = {
  name: '보강·완성',
  provider: 'openai',

  //--------------------------------------------------------------------------------
  // [2] 실행
  // - 입력: 03_초안/*.mdx + 04_검수.md + 02_목차.md(순서·제목·경로)
  // - 출력: content/[배치경로]/NN.mdx (보강본) + _meta.js + 빌드 결과
  // - opts.all: 이미 배치된 편도 다시 보강·배치 / opts.skipEnhance: 보강 없이 복사만
  //--------------------------------------------------------------------------------
  async run(dirs, opts, chat) {
    const toc = readOrFail(path.join(dirs.plan, '02_목차.md'), '2단계를 먼저.')
    const episodes = parseToc(toc)
    const contentDir = path.join(ROOT, resolveContentPath(opts, toc))

    const reviewPath = path.join(dirs.plan, '04_검수.md')
    const review = fs.existsSync(reviewPath)
      ? fs.readFileSync(reviewPath, 'utf8')
      : '(검수 결과 없음 — 지적 반영 없이 보강만 수행)'

    // 05 지시문 + 공통 MDX 규칙(00)을 하나의 system 프롬프트로 합친다
    const instruction =
      readInstruction('05_최종완성.md') + '\n\n---\n\n' + readInstruction('00_MDX규칙.md')

    //------------------------------------------------------------------------------
    // [3] 편별 보강 루프 (보강: 생략 이면 복사만)
    // - 품질 게이트: 보강 첫 실행이면 1편만 보강하고 멈춤 (전부: 예 로 해제)
    //------------------------------------------------------------------------------
    let targets = episodes
    let forced = false // 편 지정 시: 이미 완성돼 있어도 다시 보강·배치
    if (opts.file) {
      targets = filterEpisodes(episodes, opts.file)
      if (!targets.length) throw new Error(`편: ${opts.file} 에 해당하는 편이 목차에 없습니다.`)
      forced = true
      console.log(`  편 지정: ${targets.map((e) => e.file.slice(0, 2)).join(', ')}번 (있어도 재작업)`)
    } else if (!opts.skipEnhance && !opts.all && !opts.full) {
      const nothingPlacedYet = episodes.every((e) => !fs.existsSync(path.join(contentDir, `${e.file}.mdx`)))
      const available = episodes.filter((e) => fs.existsSync(path.join(dirs.draft, `${e.file}.mdx`)))
      if (nothingPlacedYet && available.length > 1) {
        const { ask } = require('../lib/ask')
        console.log(`  보강 대상이 ${available.length}편입니다. 첫 실행이므로 선택하세요:`)
        const a = await ask('  [1] 1편만 보강해서 품질 확인 (권장)   [2] 전부 보강   → 번호 입력 후 엔터: ')
        if (a === '2') {
          console.log(`  전부 보강을 선택했습니다 (${available.length}편).`)
        } else {
          targets = available.slice(0, 1)
          console.log('  1편만 보강·배치합니다. 검토 후 같은 bat을 다시 누르면 나머지를 진행합니다.')
        }
      }
    }

    let done = 0
    for (const [i, ep] of targets.entries()) {
      const src = path.join(dirs.draft, `${ep.file}.mdx`)
      if (!fs.existsSync(src)) { console.log(`  건너뜀(3단계 산출물 없음): ${ep.file}`); continue }
      const dst = path.join(contentDir, `${ep.file}.mdx`)
      if (!forced && !opts.all && fs.existsSync(dst)) { console.log(`  건너뜀(이미 완성됨): ${ep.file}`); continue }

      if (opts.skipEnhance) {
        fs.mkdirSync(contentDir, { recursive: true })
        fs.copyFileSync(src, dst)
        console.log(`  복사(보강 생략): ${path.relative(ROOT, dst)}`)
      } else {
        console.log(`  [${i + 1}/${targets.length}편 (${Math.round((i / targets.length) * 100)}% 완료)] ${ep.file} 보강 중`)
        const result = await chat(
          instruction,
          [
            '# 검수 보고서 (이 파일에 해당하는 지적을 찾아 반영하라)', review,
            `# 보강 대상 파일: ${ep.file} (${ep.title})`, fs.readFileSync(src, 'utf8'),
            '# 이번 작업',
            '위 파일을 지시문대로 검수 반영 + 내용·섹션 보강한 최종본으로 다시 출력하라.',
            '코드펜스로 감싸지 말고 .mdx 본문만, frontmatter부터 참고 자료까지 전체를 출력하라.',
          ].join('\n\n')
        )
        const clean = result.replace(/^```mdx?\r?\n/, '').replace(/\r?\n```\s*$/, '')
        writeOut(dst, clean)
      }
      done++
    }

    //------------------------------------------------------------------------------
    // [4] leaf _meta.js 자동 생성 (실존하는 .mdx만, 목차 순서대로)
    //------------------------------------------------------------------------------
    const placed = episodes.filter((e) => fs.existsSync(path.join(contentDir, `${e.file}.mdx`)))
    if (!placed.length) { console.log('  배치된 파일이 없어 _meta.js 를 만들지 않습니다.'); return }
    const metaBody = placed.map((e) => `  '${e.file}': '${e.title.replace(/'/g, '')}',`).join('\n')
    writeOut(path.join(contentDir, '_meta.js'), `const meta = {\n${metaBody}\n}\nexport default meta\n`)

    //------------------------------------------------------------------------------
    // [4-1] 홈 화면 데이터 갱신 (content 스캔 → 카드·문서 수 자동 연동)
    //------------------------------------------------------------------------------
    execSync('node scripts/gen-home-data.js', { cwd: ROOT, stdio: 'inherit' })

    //------------------------------------------------------------------------------
    // [5] 빌드 확인 + 남은 작업 안내
    //------------------------------------------------------------------------------
    if (opts.skipBuild) {
      console.log('  빌드 생략(빌드: 생략). 나중에 npm run build 로 확인하세요.')
    } else {
      console.log('  npm run build 실행... (dev 서버가 켜져 있으면 끄고 실행할 것)')
      execSync('npm run build', { cwd: ROOT, stdio: 'inherit' })
    }

    console.log(`
  ${done}편 완성. 남은 작업 (Claude Code에게 시키면 됨):
  1. content/_meta.js(최상위)에 메뉴 연결 (guide/menu-structure.md)
  2. 검수 보고서의 "확인 필요" 항목 판단
  3. 브라우저 표본 확인 (볼드 깨짐은 빌드로 안 걸러짐) 후 커밋`)
  },
}
