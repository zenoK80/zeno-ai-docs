/* eslint-disable @typescript-eslint/no-require-imports -- Node.js CommonJS 빌드 스크립트 */
// 실제 문서가 있는 과목까지 재귀 탐색한다. Web/분야/과목과 자격증/과목을 모두 지원한다.
const fs = require('fs')
const path = require('path')
const { pathToFileURL } = require('url')

const ROOT = path.join(__dirname, '..')
const CONTENT = path.join(ROOT, 'content')
const OUT = path.join(ROOT, 'app', 'components', 'home-data.json')
const overridesPath = path.join(ROOT, 'app', 'components', 'home-overrides.json')
const overrides = fs.existsSync(overridesPath) ? JSON.parse(fs.readFileSync(overridesPath, 'utf8')) : {}
const ACCENTS = ['blue', 'green', 'amber', 'red']

async function readMeta(dir) {
  const file = path.join(dir, '_meta.js')
  return fs.existsSync(file) ? (await import(pathToFileURL(file).href)).default : {}
}

function titleOf(meta, name) {
  return typeof meta[name] === 'string' ? meta[name] : meta[name]?.title ?? name
}

function orderedNames(names, meta) {
  return [...Object.keys(meta).filter(key => names.includes(key)), ...names.filter(key => !(key in meta)).sort()]
    .filter(key => meta[key]?.display !== 'hidden')
}

function frontmatterField(file, field) {
  const head = fs.readFileSync(file, 'utf8').slice(0, 800)
  const match = head.match(new RegExp('^' + field + ':\\s*[\'"]?(.+?)[\'"]?\\s*$', 'm'))
  return match?.[1] ?? null
}

function pickPreview(title) {
  if (/sql|데이터베이스|database/i.test(title)) return 'sql'
  if (/네트워크|network|web|api|브라우저/i.test(title)) return 'browser'
  if (/수학|집합|이산|math/i.test(title)) return 'sets'
  if (/통계|데이터|머신|딥|분석|chart/i.test(title)) return 'chart'
  return 'code'
}

async function main() {
  const groups = new Map()
  let accentIndex = 0

  async function walk(dir, trail) {
    const meta = await readMeta(dir)
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    const documentNames = entries.filter(entry => entry.isFile() && entry.name.endsWith('.mdx')).map(entry => entry.name.slice(0, -4))
    const documents = orderedNames(documentNames, meta)
    // 홈 index.mdx는 과목 카드로 취급하지 않는다.
    if (trail.length && documents.length) {
      const title = trail.at(-1)
      const groupTitle = trail.slice(0, -1).join(' · ') || title
      const first = documents[0]
      const relative = path.relative(CONTENT, dir).split(path.sep).join('/')
      const series = {
        title,
        description: overrides[path.basename(dir)] ||
          frontmatterField(path.join(dir, first + '.mdx'), 'description') ||
          title + ' 과목 — 총 ' + documents.length + '편',
        href: '/' + relative + '/' + first,
        documentCount: documents.length,
        preview: pickPreview(title),
        accent: ACCENTS[accentIndex++ % ACCENTS.length],
      }
      if (!groups.has(groupTitle)) groups.set(groupTitle, [])
      groups.get(groupTitle).push(series)
    }
    const folders = entries.filter(entry => entry.isDirectory()).map(entry => entry.name)
    for (const name of orderedNames(folders, meta)) {
      await walk(path.join(dir, name), [...trail, titleOf(meta, name)])
    }
  }

  await walk(CONTENT, [])
  const result = [...groups].map(([title, series], index) => ({
    title,
    description: series.length + '개 시리즈 · 문서 ' + series.reduce((count, item) => count + item.documentCount, 0) + '편',
    order: String(index + 1).padStart(2, '0'),
    series,
  }))
  const seriesCount = result.reduce((count, group) => count + group.series.length, 0)
  fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), groupCount: result.length, seriesCount, groups: result }, null, 2) + '\n')
  console.log('홈 데이터 생성: ' + result.length + '개 영역 · ' + seriesCount + '개 과목')
}

main().catch(error => { console.error(error); process.exitCode = 1 })
