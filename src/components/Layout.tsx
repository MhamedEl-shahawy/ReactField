import { type ReactNode, type RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { Document as FlexSearchDocument } from 'flexsearch'
import SidebarNavigation, { sidebarNavigation, type SidebarAnchor } from '@/components/SidebarNavigation'
import { Prose } from '@/components/Prose'
import { SectionProvider } from '@/components/SectionProvider'

type LayoutProps = {
  currentPath?: string
  anchors?: SidebarAnchor[]
  children: ReactNode
  title?: string
  description?: string
  sections?: { id: string; title?: string; level?: number }[]
}

type SearchDoc = {
  id: string
  href: string
  pageTitle: string
  sectionTitle: string
  title: string
  content: string
}

const RECENT_SEARCHES_KEY = 'reactfield-recent-searches-v1'
const MAX_RECENT_SEARCHES = 5

function normalizePath(path: string) {
  if (!path) return '/'
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1)
  return path
}

function getSectionContent(heading: Element) {
  const chunks = [heading.textContent ?? '']
  let sibling = heading.nextElementSibling
  let scanned = 0
  while (sibling && sibling.tagName.toLowerCase() !== 'h2' && scanned < 4) {
    chunks.push(sibling.textContent ?? '')
    sibling = sibling.nextElementSibling
    scanned += 1
  }
  return chunks.join(' ').replace(/\s+/g, ' ').trim()
}

function buildSearchDocsFromDocument(doc: globalThis.Document, href: string, fallbackTitle: string) {
  const docs: SearchDoc[] = []
  const pageTitle = (doc.querySelector('h1')?.textContent || fallbackTitle || href).trim()
  const articleText = (doc.querySelector('article')?.textContent || doc.querySelector('main')?.textContent || '')
    .replace(/\s+/g, ' ')
    .trim()

  docs.push({
    id: `${href}::overview`,
    href,
    pageTitle,
    sectionTitle: 'Overview',
    title: `${pageTitle} > Overview`,
    content: articleText,
  })

  const sectionHeadings = Array.from(doc.querySelectorAll('h2[id]'))
  for (const heading of sectionHeadings) {
    const id = heading.getAttribute('id')
    if (!id) continue
    const sectionTitle = (heading.textContent || id).trim()
    docs.push({
      id: `${href}::${id}`,
      href: `${href}#${id}`,
      pageTitle,
      sectionTitle,
      title: `${pageTitle} > ${sectionTitle}`,
      content: getSectionContent(heading),
    })
  }

  return docs
}

function highlightText(text: string, query: string) {
  if (!query) return [{ text, match: false }]
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig')
  return text.split(regex).filter(Boolean).map((part) => ({
    text: part,
    match: part.toLowerCase() === query.toLowerCase(),
  }))
}

function getSnippet(content: string, query: string) {
  const clean = content.replace(/\s+/g, ' ').trim()
  if (!clean) return ''
  if (!query) return clean.slice(0, 140)
  const lower = clean.toLowerCase()
  const at = lower.indexOf(query.toLowerCase())
  if (at === -1) return clean.slice(0, 140)
  const start = Math.max(0, at - 45)
  return clean.slice(start, start + 170)
}

function useActiveSection(containerRef: RefObject<HTMLElement>, anchors: SidebarAnchor[]) {
  const [activeAnchorId, setActiveAnchorId] = useState<string>('')

  useEffect(() => {
    const container = containerRef.current
    if (!container || anchors.length === 0) {
      setActiveAnchorId('')
      return
    }

    const updateActiveSection = () => {
      const containerTop = container.getBoundingClientRect().top
      const threshold = containerTop + 120

      let currentId = anchors[0]?.id ?? ''
      for (const anchor of anchors) {
        const element = document.getElementById(anchor.id)
        if (!element) continue
        const top = element.getBoundingClientRect().top
        if (top <= threshold) {
          currentId = anchor.id
        } else {
          break
        }
      }

      setActiveAnchorId(currentId)
    }

    updateActiveSection()
    container.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)
    return () => {
      container.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [anchors, containerRef])

  return activeAnchorId
}

function pathToCrumbs(pathname: string) {
  if (pathname === '/') {
    return ['ReactField', 'Getting Started', 'Home']
  }

  const trimmed = pathname.replace(/^\/+|\/+$/g, '')
  const segments = trimmed.split('/').filter(Boolean)
  const pretty = segments.map((segment) =>
    segment
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  )

  return ['ReactField', ...pretty]
}

export function Layout({
  children,
  sections = [],
  anchors,
  currentPath,
  title = 'Home',
  description = 'A practical guide to shipping production React applications.',
}: LayoutProps) {
  const router = useRouter()
  const pathname = currentPath || router.pathname
  const contentRef = useRef<HTMLElement>(null)
  const articleRef = useRef<HTMLElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchIndexRef = useRef<FlexSearchDocument<SearchDoc> | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchDocs, setSearchDocs] = useState<SearchDoc[]>([])
  const [searchReady, setSearchReady] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [activeResultIndex, setActiveResultIndex] = useState(0)
  const [wordCount, setWordCount] = useState(0)
  const [deepDiveCount, setDeepDiveCount] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const computedAnchors = useMemo(() => {
    if (anchors && anchors.length > 0) return anchors

    return (sections || [])
      .filter((section) => (section.level ?? 2) === 2 && section.id !== '_top')
      .map((section) => ({ id: section.id, label: section.title || section.id }))
  }, [anchors, sections])

  const activeAnchorId = useActiveSection(contentRef, computedAnchors)
  const totalSections = computedAnchors.length
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 200))
  const showRightToc = totalSections > 0
  const crumbs = pathToCrumbs(pathname)
  const allPages = useMemo(() => sidebarNavigation.flatMap((group) => group.links), [])

  const groupedResults = useMemo(() => {
    const query = searchTerm.trim()
    if (!query) return []
    const index = searchIndexRef.current
    const docsById = new Map(searchDocs.map((doc) => [doc.id, doc]))
    let ids: string[] = []

    if (index) {
      const raw = index.search(query, { limit: 40, enrich: true }) as Array<{ result: Array<{ id: string }> | string[] }>
      const idList = raw.flatMap((fieldResult) =>
        fieldResult.result.map((entry) => (typeof entry === 'string' ? entry : entry.id))
      )
      ids = Array.from(new Set(idList))
    }

    if (!ids.length) {
      ids = searchDocs
        .filter((doc) => doc.title.toLowerCase().includes(query.toLowerCase()) || doc.content.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 20)
        .map((doc) => doc.id)
    }

    const groups = new Map<string, SearchDoc[]>()
    for (const id of ids) {
      const doc = docsById.get(id)
      if (!doc) continue
      const groupKey = `${doc.pageTitle} > ${doc.sectionTitle}`
      if (!groups.has(groupKey)) groups.set(groupKey, [])
      groups.get(groupKey)?.push(doc)
    }

    return Array.from(groups.entries())
      .map(([group, docs]) => ({ group, docs }))
      .slice(0, 10)
  }, [searchDocs, searchTerm])

  const flatResults = useMemo(() => groupedResults.flatMap((group) => group.docs), [groupedResults])
  const suggestedPages = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    const candidates = allPages.filter((page) => normalizePath(page.href) !== normalizePath(pathname))
    if (!query) return candidates.slice(0, 3)
    const ranked = candidates.sort((a, b) => {
      const aScore = a.title.toLowerCase().includes(query) ? 1 : 0
      const bScore = b.title.toLowerCase().includes(query) ? 1 : 0
      return bScore - aScore
    })
    return ranked.slice(0, 3)
  }, [allPages, pathname, searchTerm])

  function handleSearchResultClick(href: string, queryToPersist?: string) {
    const value = (queryToPersist ?? searchTerm).trim()
    if (value) {
      const next = [value, ...recentSearches.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(
        0,
        MAX_RECENT_SEARCHES
      )
      setRecentSearches(next)
      window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
    }
    setSearchOpen(false)
    router.push(href)
  }

  async function handleShare() {
    const url = window.location.href
    const shareData = {
      title,
      text: description,
      url,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(url)
    } catch {}
  }

  useEffect(() => {
    const stored = window.localStorage.getItem(RECENT_SEARCHES_KEY)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        setRecentSearches(parsed.slice(0, MAX_RECENT_SEARCHES))
      }
    } catch {}
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isEditable =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable

      const isPaletteShortcut =
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey &&
        (event.code === 'KeyK' || event.key.toLowerCase() === 'k')

      if (isPaletteShortcut) {
        event.preventDefault()
        setSearchOpen(true)
      }
      if (event.key === 'Escape' && searchOpen) {
        setSearchOpen(false)
      }

      if (!searchOpen || isEditable) return

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveResultIndex((idx) => Math.min(idx + 1, Math.max(0, flatResults.length - 1)))
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveResultIndex((idx) => Math.max(0, idx - 1))
      }
      if (event.key === 'Enter' && flatResults[activeResultIndex]) {
        event.preventDefault()
        const selected = flatResults[activeResultIndex]
        const value = searchTerm.trim()
        if (value) {
          const next = [value, ...recentSearches.filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(
            0,
            MAX_RECENT_SEARCHES
          )
          setRecentSearches(next)
          window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
        }
        setSearchOpen(false)
        router.push(selected.href)
      }
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [activeResultIndex, flatResults, recentSearches, router, searchOpen, searchTerm])

  useEffect(() => {
    if (!searchOpen) {
      setSearchTerm('')
      setActiveResultIndex(0)
      return
    }
    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 0)
    return () => window.clearTimeout(timer)
  }, [searchOpen])

  useEffect(() => {
    if (!searchOpen || searchReady) return

    let cancelled = false

    const buildIndex = async () => {
      const docs: SearchDoc[] = []
      const currentDocDocs = buildSearchDocsFromDocument(document, pathname, title)
      docs.push(...currentDocDocs)

      for (const page of allPages) {
        const normalizedHref = normalizePath(page.href)
        if (normalizedHref === normalizePath(pathname)) continue

        try {
          const response = await fetch(page.href)
          const html = await response.text()
          const parsed = new DOMParser().parseFromString(html, 'text/html')
          docs.push(...buildSearchDocsFromDocument(parsed, page.href, page.title))
        } catch {}
      }

      if (cancelled) return

      const deduped = Array.from(new Map(docs.map((doc) => [doc.id, doc])).values())
      const index = new FlexSearchDocument<SearchDoc>({
        document: {
          id: 'id',
          index: ['title', 'content', 'pageTitle', 'sectionTitle'],
          store: ['id'],
        },
        tokenize: 'forward',
      })
      deduped.forEach((doc) => index.add(doc))

      searchIndexRef.current = index
      setSearchDocs(deduped)
      setSearchReady(true)
    }

    void buildIndex()
    return () => {
      cancelled = true
    }
  }, [allPages, pathname, searchOpen, searchReady, title])

  useEffect(() => {
    setActiveResultIndex(0)
  }, [searchTerm])

  useEffect(() => {
    const updateWordCount = () => {
      const text = articleRef.current?.innerText ?? ''
      const words = text.trim().match(/\S+/g)
      setWordCount(words ? words.length : 0)
      const dives = articleRef.current?.querySelectorAll('[data-expandable="true"]').length ?? 0
      setDeepDiveCount(dives)
    }

    updateWordCount()
    const timer = window.setTimeout(updateWordCount, 100)
    return () => window.clearTimeout(timer)
  }, [pathname, children])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey || !event.shiftKey) return
      if (event.code === 'KeyE') {
        event.preventDefault()
        window.dispatchEvent(new CustomEvent('rf-expandables:set-all', { detail: { open: true } }))
      }
      if (event.code === 'KeyC') {
        event.preventDefault()
        window.dispatchEvent(new CustomEvent('rf-expandables:set-all', { detail: { open: false } }))
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    searchIndexRef.current = null
    setSearchDocs([])
    setSearchReady(false)
  }, [pathname])

  useEffect(() => {
    const container = contentRef.current
    if (!container) return

    const onScroll = () => setShowBackToTop(container.scrollTop > 400)
    onScroll()
    container.addEventListener('scroll', onScroll, { passive: true })
    return () => container.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const closeMobileNav = () => setMobileNavOpen(false)
    router.events.on('routeChangeComplete', closeMobileNav)
    return () => {
      router.events.off('routeChangeComplete', closeMobileNav)
    }
  }, [router])

  return (
    <SectionProvider sections={sections}>
      <div className="flex h-screen overflow-hidden bg-[#faf9f6] text-[#111111]">
        <div className="hidden h-screen w-[248px] flex-none border-r border-[#dedbd6] bg-white lg:block">
          <SidebarNavigation currentPath={pathname} anchors={computedAnchors} onSearchOpen={() => setSearchOpen(true)} />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[52px] shrink-0 items-center justify-between gap-3 border-b border-[#dedbd6] bg-white px-4 sm:px-7">
            <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border border-[#dedbd6] bg-white text-[#111111] transition hover:bg-[#faf9f6] lg:hidden"
                aria-label="Open navigation menu"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>
              <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto whitespace-nowrap text-[11px] text-[#7b7b78] sm:text-[12px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {crumbs.map((crumb, index) => (
                  <span key={`${crumb}-${index}`} className="flex shrink-0 items-center gap-1.5">
                    {index > 0 ? <span className="text-[#dedbd6]">/</span> : null}
                    <span className={index === crumbs.length - 1 ? 'font-medium text-[#111111]' : ''}>{crumb}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Link
                href="/about"
                className="h-8 rounded-[4px] border border-[#dedbd6] bg-white px-2.5 text-[13px] leading-8 text-[#111111] transition hover:bg-[#faf9f6] sm:px-3.5"
              >
                <span className="sm:hidden">About</span>
                <span className="hidden sm:inline">About ReactField</span>
              </Link>
              <button
                type="button"
                onClick={handleShare}
                className="h-8 rounded-[4px] bg-[#111111] px-2.5 text-[13px] text-white transition hover:bg-[#313130] sm:px-3.5"
              >
                Share
              </button>
            </div>
          </header>

          <main ref={contentRef} className="flex-1 overflow-y-auto bg-[#faf9f6] px-4 py-6 [scroll-behavior:smooth] sm:px-6 sm:py-8 lg:px-10">
            <div className="mx-auto flex w-full max-w-[1240px] gap-8">
              <div className="min-w-0 flex-1">
                <div className="mb-5">
                  <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#7b7b78]">
                    <span>Getting Started</span>
                    <span className="text-[#dedbd6]">·</span>
                    <span>{readingMinutes} min read</span>
                    <span className="text-[#dedbd6]">·</span>
                    <span>Updated Mar 2026</span>
                    {deepDiveCount > 0 ? (
                      <>
                        <span className="text-[#dedbd6]">·</span>
                        <span className="rounded-[3px] border border-[#dedbd6] bg-white px-1.5 py-0.5 normal-case tracking-normal text-[#626260]">
                          {deepDiveCount} deep dives on this page
                        </span>
                      </>
                    ) : null}
                  </div>
                  <h1 className="mb-3 text-[28px] font-normal leading-[1.05] tracking-[-1px] text-[#111111] sm:text-[32px] sm:tracking-[-1.1px] lg:text-[36px] lg:tracking-[-1.2px]">
                    {title}
                  </h1>
                  <p className="max-w-[72ch] text-[15px] leading-[1.8] tracking-[-0.01em] text-[#626260]">{description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-[3px] border border-[#dedbd6] bg-white px-2 py-1 text-[11px] text-[#626260]">
                      Docs
                    </span>
                    <span className="rounded-[3px] border border-[rgba(255,86,0,0.2)] bg-[#fff8f5] px-2 py-1 text-[11px] text-[#ff5600]">
                      React 19
                    </span>
                    <span className="rounded-[3px] border border-[#dedbd6] bg-white px-2 py-1 text-[11px] text-[#626260]">
                      {wordCount > 0 ? `${wordCount} words` : 'TypeScript'}
                    </span>
                  </div>
                </div>

                <h2 className="mb-3 text-[20px] font-normal tracking-[-0.48px] text-[#111111]">Overview</h2>
                {deepDiveCount > 0 ? (
                  <div className="mb-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('rf-expandables:set-all', { detail: { open: true } }))
                      }}
                      className="h-8 rounded-[4px] border border-[#dedbd6] bg-white px-3 text-[12px] font-medium text-[#111111] transition hover:bg-[#faf9f6]"
                    >
                      Expand all
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('rf-expandables:set-all', { detail: { open: false } }))
                      }}
                      className="h-8 rounded-[4px] border border-[#dedbd6] bg-white px-3 text-[12px] font-medium text-[#111111] transition hover:bg-[#faf9f6]"
                    >
                      Collapse all
                    </button>
                    <span className="hidden text-[11px] text-[#7b7b78] sm:inline">
                      Shortcut: Alt+Shift+E / Alt+Shift+C
                    </span>
                  </div>
                ) : null}

                <section className="mb-[14px] rounded-[8px] border border-[#dedbd6] bg-white px-4 py-4 sm:px-6 sm:py-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-medium text-[#111111]">Main content</h3>
                    <span className="rounded-[3px] border border-[rgba(255,86,0,0.2)] bg-[#fff8f5] px-2 py-1 text-[11px] text-[#ff5600]">
                      Active
                    </span>
                  </div>
                  <article ref={articleRef} className="min-w-0 overflow-x-auto">
                    <Prose
                      as="div"
                      className="mt-5 max-w-[72ch] prose-zinc leading-[1.8] prose-headings:font-normal prose-headings:tracking-[-0.02em]"
                    >
                      {children}
                    </Prose>
                  </article>
                </section>

              </div>
              {showRightToc ? (
                <aside className="sticky top-6 hidden h-fit w-64 rounded-[8px] border border-[#dedbd6] bg-white p-4 xl:block">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.08em] text-[#7b7b78]">On this page</p>
                  <ul className="space-y-1">
                    {computedAnchors.map((anchor) => (
                      <li key={anchor.id}>
                        <a
                          href={`#${anchor.id}`}
                          className={`block rounded-[4px] px-2 py-1 text-[12px] tracking-[-0.01em] ${
                            activeAnchorId === anchor.id
                              ? 'bg-[#fff8f5] font-medium text-[#ff5600]'
                              : 'text-[#626260] hover:bg-[#faf9f6] hover:text-[#111111]'
                          }`}
                        >
                          {anchor.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </aside>
              ) : null}
            </div>
          </main>
        </div>
      </div>
      {showBackToTop ? (
        <button
          type="button"
          onClick={() => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-4 right-4 z-[120] rounded-[4px] border border-[#dedbd6] bg-white px-3 py-2 text-[12px] font-medium text-[#111111] shadow-sm transition hover:bg-[#faf9f6] sm:bottom-6 sm:right-8"
        >
          Back to top
        </button>
      ) : null}

      <Dialog open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} className="relative z-[150] lg:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-[#111111]/30 transition-opacity duration-200 ease-out data-[closed]:opacity-0"
        />
        <DialogPanel
          transition
          className="fixed inset-y-0 left-0 flex h-full w-full max-w-[min(280px,92vw)] flex-col border-r border-[#dedbd6] bg-white shadow-xl transition duration-200 ease-out data-[closed]:-translate-x-full data-[closed]:opacity-0"
        >
          <div className="flex shrink-0 items-center justify-end border-b border-[#dedbd6] bg-white px-3 py-2">
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-[4px] text-[#626260] transition hover:bg-[#faf9f6] hover:text-[#111111]"
              aria-label="Close navigation menu"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <SidebarNavigation
              currentPath={pathname}
              anchors={computedAnchors}
              onSearchOpen={() => {
                setMobileNavOpen(false)
                setSearchOpen(true)
              }}
            />
          </div>
        </DialogPanel>
      </Dialog>

      {searchOpen ? (
        <div className="fixed inset-0 z-[200] flex items-start justify-center bg-[#111111]/30 p-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:p-6 sm:pt-20">
          <button
            type="button"
            aria-label="Close search"
            className="absolute inset-0"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative w-full max-w-2xl rounded-[8px] border border-[#dedbd6] bg-white shadow-lg">
            <div className="border-b border-[#dedbd6] p-3">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search docs..."
                className="w-full rounded-[4px] border border-[#dedbd6] bg-[#faf9f6] px-3 py-2 text-[14px] text-[#111111] placeholder:text-[#7b7b78] focus:outline-none"
              />
            </div>
            <div className="max-h-[min(360px,calc(100vh-8rem))] overflow-y-auto p-2 sm:max-h-[360px]">
              {!searchTerm.trim() ? (
                <div className="space-y-3">
                  {recentSearches.length > 0 ? (
                    <div>
                      <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[#7b7b78]">
                        Recent searches
                      </p>
                      <div className="space-y-1">
                        {recentSearches.map((recent) => (
                          <button
                            key={recent}
                            type="button"
                            onClick={() => setSearchTerm(recent)}
                            className="block w-full rounded-[6px] px-3 py-2 text-left text-[13px] text-[#313130] transition hover:bg-[#faf9f6]"
                          >
                            {recent}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div>
                    <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[#7b7b78]">Suggested pages</p>
                    <div className="space-y-1">
                      {suggestedPages.map((page) => (
                        <button
                          key={page.href}
                          type="button"
                          onClick={() => handleSearchResultClick(page.href)}
                          className="block w-full rounded-[6px] px-3 py-2 text-left text-[13px] text-[#313130] transition hover:bg-[#faf9f6]"
                        >
                          {page.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : !searchReady ? (
                <p className="px-2 py-3 text-[12px] text-[#7b7b78]">Indexing documentation pages...</p>
              ) : groupedResults.length > 0 ? (
                <div className="space-y-3">
                  {groupedResults.map((group) => (
                    <div key={group.group}>
                      <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-[0.08em] text-[#7b7b78]">{group.group}</p>
                      <ul className="space-y-1">
                        {group.docs.map((result) => {
                          const globalIndex = flatResults.findIndex((item) => item.id === result.id)
                          const isActive = globalIndex === activeResultIndex
                          const snippet = getSnippet(result.content, searchTerm)
                          const parts = highlightText(snippet, searchTerm)
                          return (
                            <li key={result.id}>
                              <button
                                type="button"
                                onClick={() => handleSearchResultClick(result.href)}
                                className={`flex w-full items-center justify-between rounded-[6px] px-3 py-2 text-left transition ${
                                  isActive ? 'bg-[#fff8f5]' : 'hover:bg-[#faf9f6]'
                                }`}
                              >
                                <span className="min-w-0">
                                  <span className="block truncate text-[13px] font-medium text-[#111111]">{result.sectionTitle}</span>
                                  <span className="block truncate text-[11px] text-[#7b7b78]">
                                    {parts.map((part, index) =>
                                      part.match ? (
                                        <mark key={`${result.id}-m-${index}`} className="rounded bg-[#ffe4d4] px-[1px] text-[#111111]">
                                          {part.text}
                                        </mark>
                                      ) : (
                                        <span key={`${result.id}-t-${index}`}>{part.text}</span>
                                      )
                                    )}
                                  </span>
                                </span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-2 py-3">
                  <p className="text-[12px] text-[#7b7b78]">No results found.</p>
                  <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.08em] text-[#7b7b78]">Try these pages</p>
                  <div className="mt-1 space-y-1">
                    {suggestedPages.map((page) => (
                      <button
                        key={`suggest-${page.href}`}
                        type="button"
                        onClick={() => handleSearchResultClick(page.href)}
                        className="block w-full rounded-[6px] px-3 py-2 text-left text-[13px] text-[#313130] transition hover:bg-[#faf9f6]"
                      >
                        {page.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </SectionProvider>
  )
}
