'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon } from 'nextra/icons'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DiIllustrator, DiPhotoshop } from 'react-icons/di'
import {
  SiCss,
  SiFigma,
  SiHtml5,
  SiJavascript,
  SiNextdotjs,
  SiNextra,
  SiNodedotjs,
  SiReact,
  SiTypescript,
} from 'react-icons/si'
import styles from './home-landing-v2.module.css'
// content/ 폴더를 스캔해 자동 생성되는 데이터 (scripts/gen-home-data.js — npm run dev/build 시 갱신)
import homeData from './home-data.json'

type PreviewKind = 'code' | 'browser' | 'sets' | 'chart' | 'sql'
type AccentColor = 'blue' | 'green' | 'red' | 'amber'
type Series = {
  title: string
  description: string
  href: string
  documentCount: number
  preview: PreviewKind
  accent: AccentColor
}

type SeriesGroup = {
  title: string
  description: string
  order: string
  series: Series[]
}

const techLogos = [
  { label: 'HTML', Icon: SiHtml5, color: '#e34f26' },
  { label: 'CSS', Icon: SiCss, color: '#1572b6' },
  { label: 'JavaScript', Icon: SiJavascript, color: '#d4a900' },
  { label: 'TypeScript', Icon: SiTypescript, color: '#3178c6' },
  { label: 'React', Icon: SiReact, color: '#149eca' },
  { label: 'Next.js', Icon: SiNextdotjs, color: '#151515' },
  { label: 'Nextra', Icon: SiNextra, color: '#4913ec' },
  { label: 'Node.js', Icon: SiNodedotjs, color: '#339933' },
  { label: 'Figma', Icon: SiFigma, color: '#f24e1e' },
  { label: 'Photoshop', Icon: DiPhotoshop, color: '#31a8ff' },
  { label: 'Illustrator', Icon: DiIllustrator, color: '#ff9a00' },
]
const groups = homeData.groups as SeriesGroup[]
const firstDocHref = groups[0]?.series[0]?.href ?? '#series'
const seriesTotal = groups.reduce((n, g) => n + g.series.length, 0)

function GridJunctions({ bottom = false, top = false }: { bottom?: boolean; top?: boolean }) {
  return (
    <>
      {top && <span aria-hidden="true" className={`${styles.gridJunction} ${styles.gridJunctionLeft} ${styles.gridJunctionTop}`} data-grid-junction />}
      {top && <span aria-hidden="true" className={`${styles.gridJunction} ${styles.gridJunctionRight} ${styles.gridJunctionTop}`} data-grid-junction />}
      {bottom && <span aria-hidden="true" className={`${styles.gridJunction} ${styles.gridJunctionLeft} ${styles.gridJunctionBottom}`} data-grid-junction />}
      {bottom && <span aria-hidden="true" className={`${styles.gridJunction} ${styles.gridJunctionRight} ${styles.gridJunctionBottom}`} data-grid-junction />}
    </>
  )
}
export function HomeLanding() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.registerPlugin(ScrollTrigger)

    const context = gsap.context(() => {
      gsap
        .timeline({ defaults: { duration: 0.6, ease: 'power2.out' } })
        .from('[data-gsap="hero-copy"]', { autoAlpha: 0, x: -18 })
        .from('[data-gsap="hero-video"]', { autoAlpha: 0, x: 18 }, 0.08)
        .from('[data-gsap="feature-rail"]', { autoAlpha: 0, y: 12 }, 0.22)

      gsap.utils.toArray<HTMLElement>('[data-gsap="scroll-reveal"]').forEach((element) => {
        gsap.from(element, {
          autoAlpha: 0,
          y: 18,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 84%',
            once: true,
          },
        })
      })
    }, root)

    return () => context.revert()
  }, [])

  useEffect(() => {
    document.body.classList.add('home-page')
    const junctions = document.querySelectorAll<HTMLElement>('[data-grid-junction]')
    let lastRotation = 0

    const rotateJunctions = () => {
      const now = window.performance.now()
      if (now - lastRotation < 650) return
      lastRotation = now

      junctions.forEach((junction) => {
        delete junction.dataset.active
        void junction.offsetWidth
        junction.dataset.active = 'true'
      })
    }

    window.addEventListener('scroll', rotateJunctions, { passive: true })
    return () => {
      window.removeEventListener('scroll', rotateJunctions)
      document.body.classList.remove('home-page')
    }
  }, [])

  const showComingSoon = (name: string) => {
    window.alert(`${name}는 준비 중입니다.`)
  }

  return (
    <main ref={rootRef} className={`home-landing ${styles.home}`}>
      <div className={styles.frame}>
        <section className={styles.hero} aria-labelledby="home-title">
          <div className={styles.heroCopy} data-gsap="hero-copy">
            <div className={styles.badge}>
              <Image src="/zenoLogo.svg" alt="" width={20} height={20} />
              <span>ZENO AI DOCS</span>
            </div>
            <h1 id="home-title">학습 자료 정리<br />개인 문서입니다.</h1>
            <p>깊고 자세하게 구성했습니다.</p>
            <div className={styles.actions}>
              <Link className={styles.primaryAction} href="#series">학습 시리즈 보기 <ArrowRightIcon aria-hidden="true" width="16" /></Link>
              <Link className={styles.secondaryAction} href={firstDocHref}>첫 문서 읽기</Link>
            </div>
          </div>

          <div className={styles.heroVideoPanel} data-gsap="hero-video" aria-hidden="true">
            <video autoPlay className={styles.heroVideo} loop muted playsInline preload="metadata">
              <source src="/pong-work.mp4" type="video/mp4" />
            </video>
          </div>
        </section>
        <div className={styles.featureRail} data-gsap="feature-rail" aria-label="학습 방식">
          <span><b>01</b> 원리까지 깊은 개념</span><span><b>02</b> 실행 가능한 예제</span><span><b>03</b> 바로 푸는 문제</span>
          <GridJunctions bottom />
        </div>

        <section className={styles.catalog} id="series" aria-labelledby="series-title">
          <header className={styles.catalogHeader} data-gsap="scroll-reveal">
            <span>LEARNING LIBRARY</span><h2 id="series-title">배울 내용을 선택하세요</h2><p>과목별 시리즈를 선택하면 해당 문서의 첫 단계부터 시작합니다.</p>
          </header>

          {groups.length === 0 && (
            <p data-gsap="scroll-reveal" style={{ textAlign: 'center', opacity: 0.7, padding: '3rem 0' }}>
              아직 공개된 과목이 없습니다. 첫 과목이 준비되는 대로 여기에 자동으로 나타납니다.
            </p>
          )}
          {groups.map((group) => (
            <section className={styles.group} data-gsap="scroll-reveal" key={group.title} aria-labelledby={`group-${group.order}`}>
              <header className={styles.groupHeader}><span>{group.order}</span><div><h3 id={`group-${group.order}`}>{group.title}</h3><p>{group.description}</p></div></header>
                <span className={`${styles.groupJoint} ${styles.groupJointLeft}`} aria-hidden="true" data-grid-junction />
                <span className={`${styles.groupJoint} ${styles.groupJointRight}`} aria-hidden="true" data-grid-junction />
                <div className={styles.seriesGrid}>
                {group.series.map((series) => (
                  <Link className={styles.seriesCard} data-accent={series.accent} href={series.href} key={series.title}>
                    <div className={styles.cardBody}><div><span className={styles.count}>{String(series.documentCount).padStart(2, '0')} DOCUMENT</span><h4>{series.title}</h4><p>{series.description}</p></div><span className={styles.openLabel}>시작하기 <ArrowRightIcon aria-hidden="true" width="15" /></span></div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </section>


        <section className={styles.closing} data-gsap="scroll-reveal" aria-labelledby="closing-title">
          <GridJunctions top />
          <div className={styles.closingCopy}>
            <span>STUDY ROUTINE</span>
            <h2 id="closing-title">오늘의 한 문서가<br />내일의 감각이 됩니다.</h2>
            <p>깊게 읽고, 직접 확인하고, 다시 꺼내 보는 학습 기록을 쌓아갑니다.</p>
          </div>
          <div className={styles.closingSignal} aria-hidden="true">
              <div className={styles.signalStep}><span>01</span><div><b>READ</b><small>핵심 개념</small></div></div>
              <div className={styles.signalStep}><span>02</span><div><b>TRY</b><small>짧은 실행</small></div></div>
              <div className={styles.signalStep}><span>03</span><div><b>CHECK</b><small>문제 확인</small></div></div>
            </div>
            <div className={styles.closingAction}>
            <p>새로운 과목과 문서는 같은 학습 흐름 안에서 계속 추가됩니다.</p>
            <div className={styles.closingLinks}>
              <Link href={firstDocHref}>첫 문서 읽기 <ArrowRightIcon aria-hidden="true" width="16" /></Link>
              <Link href="#series">시리즈 전체 보기 <ArrowRightIcon aria-hidden="true" width="16" /></Link>
            </div>
            <small>현재 {groups.length}개 영역 · {seriesTotal}개 학습 시리즈</small>
          </div>
        </section>

        <footer className={styles.siteFooter}>
          <GridJunctions top />
          <div className={styles.footerIdentity}>
            <span><Image src="/zenoLogo.svg" alt="" width={20} height={20} /> Zeno AI Docs</span>
            <p>읽고, 실행하고, 내 것으로 만드는 개인 학습 문서.</p>
          </div>
          <nav aria-label="외부 링크" className={styles.footerNav}>
              <a href="https://blog.zeno.it.kr" target="_blank" rel="noreferrer">Blog</a>
              <Link href="/portfolio" onClick={(event) => { event.preventDefault(); showComingSoon('Portfolio') }}>Portfolio</Link>
              <a href="https://github.com/zenoK80" target="_blank" rel="noreferrer">GitHub</a>
            </nav>
          <small className={styles.copyright}>© 2026 Zeno AI Docs</small>
          <div className={styles.studyTicker} aria-hidden="true">
            <div className={styles.tickerTrack}>
            {[0, 1].map((set) => (
              <div className={styles.tickerSet} key={set}>
                {techLogos.map(({ label, Icon, color }) => (
                  <span key={`${set}-${label}`}>
                    <Icon style={{ color }} />
                    <b>{label}</b>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        </footer>
      </div>
    </main>
  )
}
