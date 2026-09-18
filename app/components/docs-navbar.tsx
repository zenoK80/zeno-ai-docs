'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Folder, MdxFile, PageMapItem } from 'nextra'
import { Search } from 'nextra/components'
import { ThemeSwitch, setMenu, useMenu } from 'nextra-theme-docs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

interface NavNode {
  title: string
  href: string
  section: string
  children: NavNode[]
}

function isFolder(item: PageMapItem): item is Folder {
  return 'children' in item
}

function isPage(item: PageMapItem): item is MdxFile {
  return 'route' in item && !isFolder(item)
}

function metaOf(items: PageMapItem[]): Record<string, unknown> {
  const meta = items.find(item => 'data' in item)
  return meta && 'data' in meta ? meta.data as Record<string, unknown> : {}
}

function titleOf(item: Folder | MdxFile, meta: Record<string, unknown>): string {
  const value = meta[item.name]
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'title' in value && typeof value.title === 'string') return value.title
  if ('frontMatter' in item) {
    const title = item.frontMatter?.sidebarTitle ?? item.frontMatter?.title
    if (typeof title === 'string') return title
  }
  return 'title' in item && typeof item.title === 'string' ? item.title : item.name
}

function isHidden(name: string, meta: Record<string, unknown>): boolean {
  const value = meta[name]
  return !!value && typeof value === 'object' && 'display' in value && value.display === 'hidden'
}

function firstPageRoute(items: PageMapItem[]): string | undefined {
  const meta = metaOf(items)
  for (const item of items) {
    if (!('name' in item) || isHidden(item.name, meta)) continue
    if (isFolder(item)) {
      const route = firstPageRoute(item.children)
      if (route) return route
    } else if (isPage(item)) return item.route
  }
}

/** 중간 폴더는 펼침 메뉴, 문서가 들어 있는 과목 폴더는 첫 문서 링크다. */
function getNavNodes(items: PageMapItem[]): NavNode[] {
  const meta = metaOf(items)
  return items.flatMap(item => {
    if (!('name' in item) || isHidden(item.name, meta)) return []
    if (isFolder(item)) {
      const children = getNavNodes(item.children)
      const href = firstPageRoute(item.children) ?? children[0]?.href
      return href ? [{ title: titleOf(item, meta), href, section: item.route, children }] : []
    }

    // 실제 문서가 없는 준비중 메뉴는 Nextra의 가상 menu 항목을 사용한다.
    const value = meta[item.name] as {
      title?: string
      type?: string
      items?: Record<string, { title?: string; href?: string }>
    } | undefined
    if (value?.type !== 'menu' || !value.items) return []
    const children = Object.entries(value.items).flatMap(([key, link]) =>
      link.href ? [{ title: link.title ?? key, href: link.href, section: link.href, children: [] }] : [],
    )
    return children.length ? [{ title: value.title ?? item.name, href: children[0].href, section: item.name, children }] : []
  })
}

export function DocsNavbar({ pageMap }: { pageMap: PageMapItem[] }) {
  const pathname = decodeURIComponent(usePathname())
  const groups = useMemo(() => getNavNodes(pageMap), [pageMap])
  const mobileMenuOpen = useMenu()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const headerRef = useRef<HTMLElement>(null)

  function closeMenus() {
    setOpenMenu(null)
    setOpenSubmenu(null)
  }

  function isActive(section: string) {
    const route = decodeURIComponent(section)
    return route.startsWith('/') && (pathname === route || pathname.startsWith(`${route}/`))
  }

  useEffect(() => {
    // 기존 반응형 기준과 사이드바 폭 복구를 유지한다.
    const mediaQuery = window.matchMedia('(min-width: 1780px)')
    function handleDesktopChange() {
      if (!mediaQuery.matches) return
      setMenu(false)
      document.querySelectorAll<HTMLElement>('aside.nextra-sidebar [style*="width"]').forEach(element => {
        if (element.style.width === '0px') element.style.removeProperty('width')
      })
    }
    handleDesktopChange()
    mediaQuery.addEventListener('change', handleDesktopChange)
    window.addEventListener('resize', handleDesktopChange)
    return () => {
      mediaQuery.removeEventListener('change', handleDesktopChange)
      window.removeEventListener('resize', handleDesktopChange)
    }
  }, [])

  useEffect(() => {
    function handleClick(event: globalThis.MouseEvent) {
      if (!(event.target instanceof Element)) return
      if (event.target.closest('a')?.getAttribute('href') === '#coming-soon') {
        event.preventDefault()
        event.stopPropagation()
        closeMenus()
        setMenu(false)
        window.alert('준비중입니다.')
      } else if (!headerRef.current?.contains(event.target)) closeMenus()
    }
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  function courseLink(item: NavNode) {
    return (
      <Link
        key={item.section}
        href={item.href}
        className="docs-navbar-panel-link"
        aria-current={isActive(item.section) ? 'page' : undefined}
        onClick={event => {
          event.currentTarget.blur()
          closeMenus()
          setMenu(false)
        }}
      >
        {item.title}
      </Link>
    )
  }

  return (
    <header className="docs-navbar" data-menu-open={mobileMenuOpen || undefined} ref={headerRef}>
      <nav className="docs-navbar-inner" aria-label="Main navigation">
        <Link className="docs-navbar-logo" href="/" aria-label="Home page">
          <img src="/zenoLogo.svg" alt="" width="24" height="24" />
          <b>Zeno AI Docs</b>
        </Link>
        <button aria-label="Menu" aria-expanded={mobileMenuOpen} className="docs-navbar-mobile-menu-button"
          onClick={() => setMenu(open => !open)} type="button">
          <span /><span /><span />
        </button>
        <div className="docs-navbar-menu">
          {groups.map((group, groupIndex) => {
            const panelId = `docs-nav-${groupIndex}`
            return (
              <div className="docs-navbar-group" key={group.section} data-open={openMenu === group.section}
                onPointerEnter={event => { if (event.pointerType === 'mouse') { setOpenMenu(group.section); setOpenSubmenu(null) } }}
                onPointerLeave={event => { if (event.pointerType === 'mouse') closeMenus() }}
                onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) closeMenus() }}
                onKeyDown={event => {
                  if (event.key === 'Escape') {
                    closeMenus()
                    event.currentTarget.querySelector<HTMLButtonElement>('.docs-navbar-trigger')?.focus()
                  }
                }}>
                <button type="button" className="docs-navbar-trigger" aria-controls={panelId}
                  aria-expanded={openMenu === group.section} data-active={isActive(group.section)}
                  onClick={() => { setOpenMenu(openMenu === group.section ? null : group.section); setOpenSubmenu(null) }}
                  onKeyDown={event => {
                    if (event.key === 'ArrowDown') {
                      event.preventDefault()
                      flushSync(() => setOpenMenu(group.section))
                      document.getElementById(panelId)?.querySelector<HTMLElement>('button, a')?.focus()
                    }
                  }}>
                  {group.title}<span className="docs-navbar-chevron" aria-hidden="true" />
                </button>
                <div className="docs-navbar-panel" id={panelId} inert={openMenu !== group.section}>
                  <div className="docs-navbar-panel-inner">
                    <div className="docs-navbar-panel-links">
                      {group.children.map((item, itemIndex) => {
                        if (!item.children.length) return courseLink(item)
                        const submenuId = `${panelId}-${itemIndex}`
                        const expanded = openSubmenu === submenuId
                        return (
                          <div className="docs-navbar-branch" key={item.section} data-open={expanded}
                            onPointerEnter={event => { if (event.pointerType === 'mouse') setOpenSubmenu(submenuId) }}
                            onPointerLeave={event => { if (event.pointerType === 'mouse') setOpenSubmenu(null) }}
                            onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpenSubmenu(null) }}
                            onKeyDown={event => {
                              if (expanded && (event.key === 'ArrowLeft' || event.key === 'Escape')) {
                                event.preventDefault()
                                event.stopPropagation()
                                setOpenSubmenu(null)
                                event.currentTarget.querySelector<HTMLButtonElement>('button')?.focus()
                              }
                            }}>
                            <button className="docs-navbar-panel-link docs-navbar-branch-trigger" type="button"
                              aria-expanded={expanded} aria-controls={submenuId} data-active={isActive(item.section)}
                              onClick={() => setOpenSubmenu(expanded ? null : submenuId)}
                              onKeyDown={event => {
                                if (event.key === 'ArrowRight') {
                                  event.preventDefault()
                                  flushSync(() => setOpenSubmenu(submenuId))
                                  document.getElementById(submenuId)?.querySelector<HTMLElement>('a')?.focus()
                                }
                              }}>
                              {item.title}<span className="docs-navbar-side-chevron" aria-hidden="true" />
                            </button>
                            <div className="docs-navbar-submenu" id={submenuId} inert={!expanded}>
                              <div className="docs-navbar-panel-inner docs-navbar-submenu-inner">
                                {item.children.map(courseLink)}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="docs-navbar-tools"><Search /><ThemeSwitch /></div>
      </nav>
    </header>
  )
}
