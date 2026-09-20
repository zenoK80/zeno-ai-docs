'use client'

import { useEffect, useId, useRef, useState } from 'react'

// ABC 표기법(abcjs) 악보 렌더러. MDX에서 <AbcScore abc={"X:1\nT:...\nK:C\nC D E F|"} /> 형태로 쓴다.
// 기타/피아노 과목에서 코드 보이싱·리듬 패턴을 실제 오선보로 보여 주기 위한 전역 컴포넌트.
type Props = {
  abc: string
  title?: string
  /** 재생 버튼 표시 여부 (abcjs synth, 브라우저 Web Audio) */
  playable?: boolean
}

export function AbcScore({ abc, title, playable = true }: Props) {
  const id = useId().replace(/:/g, '')
  const paperRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function render() {
      const paper = paperRef.current
      if (!paper) return
      try {
        const abcjs = await import('abcjs')
        if (cancelled) return
        const tunes = abcjs.renderAbc(paper, abc, {
          responsive: 'resize',
          add_classes: true,
          paddingtop: 4,
          paddingbottom: 4,
        })
        if (playable && audioRef.current && abcjs.synth.supportsAudio()) {
          const controller = new abcjs.synth.SynthController()
          controller.load(audioRef.current, undefined, {
            displayLoop: false,
            displayRestart: true,
            displayPlay: true,
            displayProgress: true,
            displayWarp: false,
          })
          await controller.setTune(tunes[0], false, { chordsOff: false })
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e))
      }
    }
    void render()
    return () => {
      cancelled = true
    }
  }, [abc, playable])

  return (
    <figure className="abc-score" data-score-id={id}>
      {title && <figcaption className="abc-score-title">{title}</figcaption>}
      <div ref={paperRef} className="abc-score-paper" />
      {playable && <div ref={audioRef} className="abc-score-audio" />}
      {error && <pre className="abc-score-error">{error}</pre>}
    </figure>
  )
}
