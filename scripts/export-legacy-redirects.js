/* eslint-disable @typescript-eslint/no-require-imports -- Node.js CommonJS 빌드 스크립트 */
// 정적 배포에서도 이전 문서 주소가 새 폴더 구조로 이어지도록 작은 HTML을 생성한다.
const fs = require('fs')
const path = require('path')
const migrations = require('./lib/content-route-migrations.json')
const root = path.join(__dirname, '..')
const output = path.join(root, 'out')
let count = 0

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(file) : entry.name.endsWith('.mdx') ? [file] : []
  })
}

for (const [oldPrefix, newPrefix] of Object.entries(migrations)) {
  const source = path.join(root, 'content', newPrefix)
  for (const file of walk(source)) {
    const suffix = path.relative(source, file).split(path.sep).join('/').replace(/\.mdx$/, '')
    const target = '/' + newPrefix + '/' + suffix
    const exported = path.join(output, newPrefix, suffix + '.html')
    if (!fs.existsSync(exported)) throw new Error('새 문서의 정적 출력이 없습니다: ' + exported)
    const legacy = path.join(output, oldPrefix, suffix + '.html')
    const url = encodeURI(target)
    const html = '<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="robots" content="noindex"><link rel="canonical" href="https://zeno.it.kr' + url +
      '"><meta http-equiv="refresh" content="0;url=' + url + '"><title>문서 이동</title><script>location.replace(' +
      JSON.stringify(url) + '+location.search+location.hash)</script><a href="' + url + '">새 문서로 이동</a></html>'
    fs.mkdirSync(path.dirname(legacy), { recursive: true })
    fs.writeFileSync(legacy, html)
    count++
  }
}
console.log('이전 문서 주소 연결: ' + count + '개')
