import { Fragment, type ReactNode } from 'react'
import katex from 'katex'
import styles from './quiz.module.css'

// Quiz의 question/options/explanation은 일반 문자열 prop이라 MDX 파이프라인(remark-math,
// 마크다운 문법)을 거치지 않는다. 그래서 여기서 최소한의 서식을 직접 렌더링한다.
//   - $...$ 인라인 수식 (KaTeX)
//   - `code`, **강조**
//   - 줄바꿈, 빈 줄로 나뉜 문단, 마크다운 표(| a | b |), 들여쓰기가 있는 출력 블록(pre)

const HANGUL = /[ㄱ-ㆎ가-힣]/

// 여는 $ 뒤와 닫는 $ 앞은 공백이 아니어야 하고, 닫는 $ 뒤에 숫자가 오면 수식이 아니다
// (Pandoc 규칙). 셸 변수($SHELL, $0)나 가격($5) 같은 일반 달러 기호를 수식으로 오인해
// 문장 전체를 KaTeX로 넘기고 공백을 지워 버리던 문제를 막는다.
const MATH = /\$(?!\s)((?:\\.|[^$\\])*?[^\s$\\])\$(?!\d)/g

function renderMath(expr: string, key: string): ReactNode {
  try {
    const html = katex.renderToString(expr, { throwOnError: false })
    // eslint-disable-next-line react/no-danger
    return <span key={key} dangerouslySetInnerHTML={{ __html: html }} />
  } catch {
    return <span key={key}>{`$${expr}$`}</span>
  }
}

const INLINE = /(`[^`\n]+`|\*\*[^*\n]+\*\*)/g

function renderPlain(text: string, keyPrefix: string): ReactNode[] {
  return text.split(INLINE).map((part, index) => {
    const key = `${keyPrefix}-${index}`
    if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
      return (
        <code className={styles.code} key={key}>
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key}>{part.slice(2, -2)}</strong>
    }
    return part ? <Fragment key={key}>{part}</Fragment> : null
  })
}

export function renderInline(text: string, keyPrefix = 'i'): ReactNode[] {
  const nodes: ReactNode[] = []
  let cursor = 0
  let plainStart = 0
  let key = 0

  while (cursor < text.length) {
    MATH.lastIndex = cursor
    const match = MATH.exec(text)
    if (!match) break

    const start = match.index
    const expr = match[1]
    const escaped = start > 0 && text[start - 1] === '\\'
    if (escaped || HANGUL.test(expr)) {
      // 수식이 아닌 달러 기호: 이 $는 글자로 두고 다음 위치부터 다시 찾는다
      cursor = start + 1
      continue
    }

    if (start > plainStart) {
      nodes.push(...renderPlain(text.slice(plainStart, start), `${keyPrefix}-${key++}`))
    }
    nodes.push(renderMath(expr, `${keyPrefix}-m${key++}`))
    cursor = plainStart = start + match[0].length
  }

  if (plainStart < text.length) {
    nodes.push(...renderPlain(text.slice(plainStart), `${keyPrefix}-${key++}`))
  }
  return nodes
}

const TABLE_ROW = /^\|.*\|$/
const TABLE_SEPARATOR = /^\|(?:\s*:?-+:?\s*\|)+$/

function splitCells(row: string): string[] {
  return row
    .slice(1, -1)
    .split('|')
    .map((cell) => cell.trim())
}

function renderLines(lines: string[], keyPrefix: string): ReactNode[] {
  return lines.flatMap((line, index) => [
    index > 0 ? <br key={`${keyPrefix}-br-${index}`} /> : null,
    ...renderInline(line, `${keyPrefix}-${index}`),
  ])
}

function renderBlock(block: string, keyPrefix: string): ReactNode {
  const lines = block.split('\n')
  const trimmed = lines.map((line) => line.trim())

  if (trimmed.length >= 2 && trimmed.every((line) => TABLE_ROW.test(line)) && TABLE_SEPARATOR.test(trimmed[1])) {
    const header = splitCells(trimmed[0])
    const body = trimmed.slice(2).map(splitCells)
    return (
      <div className={styles.tableWrap} key={keyPrefix}>
        <table className={styles.table}>
          <thead>
            <tr>
              {header.map((cell, index) => (
                <th key={index}>{renderInline(cell, `${keyPrefix}-h${index}`)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{renderInline(cell, `${keyPrefix}-r${rowIndex}c${cellIndex}`)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // 들여쓰기로 정렬한 여러 줄(프로그램 출력, 통계 결과 등)은 원래 모양 그대로 보여 준다
  if (lines.length >= 2 && lines.some((line) => /^\s/.test(line))) {
    return (
      <pre className={styles.pre} key={keyPrefix}>
        {block}
      </pre>
    )
  }

  return (
    <div className={styles.block} key={keyPrefix}>
      {renderLines(trimmed, keyPrefix)}
    </div>
  )
}

export function renderRichText(text: string, keyPrefix = 't'): ReactNode {
  const normalized = (text ?? '').replace(/\r\n?/g, '\n')
  if (!normalized.includes('\n')) {
    return renderInline(normalized, keyPrefix)
  }
  const blocks = normalized
    .split(/\n[ \t]*\n+/)
    .map((block) => block.replace(/^\n+|\n+$/g, ''))
    .filter((block) => block.trim().length > 0)
  return blocks.map((block, index) => renderBlock(block, `${keyPrefix}-b${index}`))
}
