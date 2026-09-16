'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Folder, MdxFile, PageMapItem } from 'nextra'
import { Search } from 'nextra/components'
import { ThemeSwitch, setMenu, useMenu } from 'nextra-theme-docs'
import { FocusEvent, MouseEvent, useEffect, useMemo, useState } from 'react'

interface NavItem {
  title: string
  href: string
  section: string
}

interface NavGroup extends NavItem {
  section: string
  items: NavItem[]
}

function isFolder(item: PageMapItem): item is Folder {
  return 'children' in item
}

function isPage(item: PageMapItem): item is MdxFile {
  return 'route' in item && !('children' in item)
}

/** 폴더 children 중 _meta 데이터({ data }) 항목을 찾는다. */
function metaOf(children: PageMapItem[]): Record<string, unknown> {
  for (const child of children) {
    if ('data' in child) return child.data as Record<string, unknown>
  }
  return {}
}

/** _meta 제목 → frontMatter 제목 → 이름 순으로 표시 제목을 정한다. */
function titleOf(
  item: Folder | MdxFile,
  parentMeta: Record<string, unknown>,
): string {
  const metaValue = parentMeta[item.name]
  if (typeof metaValue === 'string') return metaValue
  if (
    metaValue &&
    typeof metaValue === 'object' &&
    'title' in metaValue &&
    typeof metaValue.title === 'string'
  ) {
    return metaValue.title
  }
  if ('frontMatter' in item) {
    const { sidebarTitle, title } = item.frontMatter ?? {}
    if (typeof sidebarTitle === 'string') return sidebarTitle
    if (typeof title === 'string') return title
  }
  if ('title' in item && typeof item.title === 'string') return item.title
  return item.name
}

function isHidden(name: string, parentMeta: Record<string, unknown>): boolean {
  const metaValue = parentMeta[name]
  return (
    !!metaValue &&
    typeof metaValue === 'object' &&
    'display' in metaValue &&
    metaValue.display === 'hidden'
  )
}

/** 폴더를 따라 내려가며 첫 번째 실제 페이지 route를 찾는다. */
function firstPageRoute(item: PageMapItem): string | undefined {
  if (isPage(item)) return item.route
  if (isFolder(item)) {
    for (const child of item.children) {
      const route = firstPageRoute(child)
      if (route) return route
    }
  }
  return undefined
}

/**
 * 사이드바처럼 pageMap(content 폴더 구조)에서 헤더 메뉴를 만든다.
 * 최상위 폴더 = 메뉴, 하위 폴더(없으면 페이지들) = 드롭다운 항목.
 */
function getNavGroups(pageMap: PageMapItem[]): NavGroup[] {
  const rootMeta = metaOf(pageMap)
  const groups: NavGroup[] = []

  for (const item of pageMap) {
    if (!('name' in item) || isHidden(item.name, rootMeta)) continue

    // Nextra는 실제 폴더가 없는 type: 'menu' 항목도 pageMap에 포함한다.
    // 준비중 메뉴도 _meta.js의 제목·링크·순서를 그대로 사용한다.
    if (!isFolder(item)) {
      const meta = rootMeta[item.name] as {
        title?: string
        type?: string
        items?: Record<string, { title?: string; href?: string }>
      } | undefined
      if (meta?.type !== 'menu' || !meta.items) continue
      const items: NavItem[] = Object.entries(meta.items).flatMap(([name, link]) =>
        link.href ? [{ title: link.title ?? name, href: link.href, section: link.href }] : [],
      )
      if (items.length) {
        groups.push({
          title: meta.title ?? item.name,
          href: items[0].href,
          section: `/${item.name}`,
          items,
        })
      }
      continue
    }

    const href = firstPageRoute(item)
    if (!href) continue

    const folderMeta = metaOf(item.children)
    const subFolders = item.children.filter(isFolder)
    const children: (Folder | MdxFile)[] =
      subFolders.length > 0 ? subFolders : item.children.filter(isPage)

    const items: NavItem[] = []
    for (const child of children) {
      if (isHidden(child.name, folderMeta)) continue
      const childHref = firstPageRoute(child)
      if (childHref) {
        const childSection = isFolder(child) ? child.route : childHref
        items.push({ title: titleOf(child, folderMeta), href: childHref, section: childSection })
      }
    }

    groups.push({
      title: titleOf(item, rootMeta),
      href,
      section: item.route,
      items,
    })
  }

  return groups
}

export function DocsNavbar({ pageMap }: { pageMap: PageMapItem[] }) {
  const pathname = usePathname()
  const navGroups = useMemo(() => getNavGroups(pageMap), [pageMap])
  const mobileMenuOpen = useMenu()
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => {
    // 1780px부터 전체 헤더와 데스크톱 문서 내비게이션을 표시한다.
    const mediaQuery = window.matchMedia('(min-width: 1780px)')

    // Nextra Collapse(horizontal)는 사이드바 remount 시 inline width를 px로 고정하는데,
    // 모바일 폭에서는 데스크톱 사이드바가 display:none이라 clientWidth가 0으로 측정되어
    // "width: 0px"가 남는다 (열림 상태에서는 height만 제거하고 width는 제거하지 않음).
    // 데스크톱으로 전환될 때 이 잘못된 0px inline width만 걷어내 Nextra 기본 레이아웃을 복원한다.
    function resetStaleSidebarWidth() {
      const sidebar = document.querySelector('aside.nextra-sidebar')
      if (!sidebar) return

      for (const element of sidebar.querySelectorAll<HTMLElement>(
        '[style*="width"]',
      )) {
        if (element.style.width === '0px') {
          element.style.removeProperty('width')
        }
      }
    }

    function handleDesktopChange() {
      if (mediaQuery.matches) {
        setMenu(false)
        resetStaleSidebarWidth()
      }
    }

    handleDesktopChange()
    mediaQuery.addEventListener('change', handleDesktopChange)
    // 일부 환경에서는 matchMedia change가 누락될 수 있어 resize도 함께 감지한다.
    window.addEventListener('resize', handleDesktopChange)

    return () => {
      mediaQuery.removeEventListener('change', handleDesktopChange)
      window.removeEventListener('resize', handleDesktopChange)
    }
  }, [])

  useEffect(() => {
    // 커스텀 헤더와 Nextra 모바일 메뉴의 준비중 링크를 함께 처리한다.
    function handleComingSoon(event: globalThis.MouseEvent) {
      if (!(event.target instanceof Element)) return
      const link = event.target.closest('a')
      if (link?.getAttribute('href') !== '#coming-soon') return
      event.preventDefault()
      event.stopPropagation()
      setOpenMenu(null)
      setMenu(false)
      window.alert('준비중입니다.')
    }

    document.addEventListener('click', handleComingSoon, true)
    return () => document.removeEventListener('click', handleComingSoon, true)
  }, [])

  function closeMenu(event?: MouseEvent<HTMLAnchorElement>) {
    event?.currentTarget.blur()
    setOpenMenu(null)
    setMenu(false)
  }

  function closeMenuAfterFocusLeaves(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setOpenMenu(null)
    }
  }

  return (
    <header className="docs-navbar">
      <nav className="docs-navbar-inner" aria-label="Main navigation">
        <Link className="docs-navbar-logo" href="/" aria-label="Home page">
          <img src="/zenoLogo.svg" alt="" width="24" height="24" />
          <b>Zeno AI Docs</b>
        </Link>

        <button
          aria-label="Menu"
          aria-expanded={mobileMenuOpen}
          className="docs-navbar-mobile-menu-button"
          onClick={() => setMenu((open) => !open)}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>

        <div className="docs-navbar-menu">
          {navGroups.map((group) => {
            const active = pathname.startsWith(group.section)

            return (
              <div
                className="docs-navbar-group"
                data-open={openMenu === group.title}
                key={group.title}
                onBlur={closeMenuAfterFocusLeaves}
                onFocus={() => setOpenMenu(group.title)}
                onMouseEnter={() => setOpenMenu(group.title)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <Link
                  aria-current={active ? 'page' : undefined}
                  aria-expanded={openMenu === group.title}
                  className="docs-navbar-trigger"
                  href={group.href}
                  onClick={closeMenu}
                >
                  {group.title}
                  <span className="docs-navbar-chevron" aria-hidden="true" />
                </Link>
                <div className="docs-navbar-panel">
                  <div className="docs-navbar-panel-inner">
                    <div className="docs-navbar-panel-links">
                      {group.items.map((item) => (
                        <Link
                          aria-current={pathname.startsWith(item.section) ? 'page' : undefined}
                          className="docs-navbar-panel-link"
                          href={item.href}
                          key={item.href}
                          onClick={closeMenu}
                        >
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="docs-navbar-tools">
          <Search />
          <ThemeSwitch />
        </div>
      </nav>
    </header>
  )
}
