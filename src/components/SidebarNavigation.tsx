import Link from 'next/link'
import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'

export type SidebarAnchor = {
  id: string
  label: string
}

export type SidebarProps = {
  currentPath: string
  anchors?: SidebarAnchor[]
  onSearchOpen?: () => void
}

export type SidebarNavLink = {
  title: string
  href: string
}

export type SidebarNavGroup = {
  title: string
  links: SidebarNavLink[]
}

export const sidebarNavigation: SidebarNavGroup[] = [
  {
    title: 'Getting Started',
    links: [
      { title: 'Home', href: '/' },
      { title: 'React Fundamentals', href: '/fundamentals' },
    ],
  },
  {
    title: 'Topics',
    links: [
      { title: 'Project Standards', href: '/project-standards' },
      { title: 'Accessibility & Semantics', href: '/semantics' },
      { title: 'Styling & UI Libraries', href: '/styling' },
      { title: 'Ecosystem & npm libraries', href: '/ecosystem' },
      { title: 'Books & Reading', href: '/books' },
      { title: 'Proficiency with Hooks', href: '/hooks' },
      { title: 'State Management Fundamentals', href: '/state-management' },
      { title: 'Data Fetching & Caching', href: '/data-fetching-caching' },
      { title: 'AI with React Best Practices', href: '/ai-with-react-best-practices' },
      { title: 'React Rendering Strategies', href: '/react-rendering-strategies' },
      { title: 'Performance & Optimization', href: '/react-performance-optimization' },
      { title: 'Stop Unnecessary Re-renders', href: '/stop-unnecessary-rerenders' },
      { title: 'Eliminating Async Waterfalls', href: '/eliminating-async-waterfalls' },
      { title: 'Bundle Size Optimization', href: '/bundle-size-optimization' },
      { title: 'JavaScript Performance Patterns', href: '/javascript-performance-patterns-react' },
      { title: 'NX Introduction & Architecture', href: '/nx-introduction-architecture' },
      { title: 'Automated Testing', href: '/automated-testing' },
    ],
  },
  {
    title: 'React Frameworks',
    links: [
      { title: 'Frameworks & Build Tools', href: '/frameworks' },
      { title: 'React Native', href: '/frameworks/react-native' },
      { title: 'Next.js', href: '/frameworks/nextjs' },
      { title: 'Remix', href: '/frameworks/remix' },
      { title: 'Alternate React Stacks', href: '/frameworks/alternate-tech-stacks' },
    ],
  },
]

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={clsx(
        'h-3.5 w-3.5 text-[#7b7b78] transition-transform duration-150',
        open ? 'rotate-180' : 'rotate-0'
      )}
    >
      <path
        d="M5.5 7.75 10 12.25l4.5-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-[13px] w-[13px] text-[#7b7b78]">
      <path
        d="m14 14-2.75-2.75m1.5-3.5a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function useActiveAnchor(anchors: SidebarAnchor[]) {
  const [activeAnchorId, setActiveAnchorId] = useState<string>('')

  useEffect(() => {
    if (!anchors.length) {
      setActiveAnchorId('')
      return
    }

    const elements = anchors
      .map((anchor) => document.getElementById(anchor.id))
      .filter((node): node is HTMLElement => Boolean(node))

    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length) {
          setActiveAnchorId(visible[0].target.id)
        }
      },
      {
        threshold: 0.3,
        rootMargin: '-10% 0px -60% 0px',
      }
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [anchors])

  return activeAnchorId
}

export default function SidebarNavigation({ currentPath, anchors = [], onSearchOpen }: SidebarProps) {
  const [showAnchors, setShowAnchors] = useState(true)
  const activeAnchorId = useActiveAnchor(anchors)
  const normalizedPath = useMemo(() => {
    if (currentPath.length > 1 && currentPath.endsWith('/')) {
      return currentPath.slice(0, -1)
    }
    return currentPath
  }, [currentPath])

  const truncatedAnchors = useMemo(
    () =>
      anchors.map((anchor) => ({
        ...anchor,
        label: anchor.label?.trim() || anchor.id,
      })),
    [anchors]
  )

  return (
    <aside className="flex h-full flex-col bg-white text-[#111111]">
      <div className="border-b border-[#dedbd6] px-4 pb-4 pt-5">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#111111]">
            <span aria-hidden="true" className="text-sm font-semibold text-white">
              ⚛
            </span>
          </div>
          <span className="text-[15px] font-medium tracking-[-0.02em]">ReactField</span>
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#ff5600]" aria-hidden="true" />
        </div>

        <button
          type="button"
          onClick={onSearchOpen}
          className="flex w-full items-center gap-2 rounded border border-[#dedbd6] bg-[#faf9f6] px-[10px] py-[7px] text-left transition hover:bg-white"
        >
          <SearchIcon />
          <span className="w-full text-[13px] text-[#7b7b78]">Search docs...</span>
          <span className="rounded-[3px] border border-[#dedbd6] bg-white px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.06em] text-[#7b7b78]">
            ⌘K
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-3">
        {sidebarNavigation.map((group) => (
          <section key={group.title}>
            <h2 className="px-4 pb-1 pt-2 text-[10px] font-medium uppercase tracking-[0.08em] text-[#7b7b78]">
              {group.title}
            </h2>
            <ul role="list">
              {group.links.map((link) => {
                const normalizedHref =
                  link.href.length > 1 && link.href.endsWith('/') ? link.href.slice(0, -1) : link.href
                const isActive = normalizedHref === normalizedPath
                const isSoon =
                  link.title === 'React Native' ||
                  link.title === 'Alternate React Stacks' ||
                  link.title === 'State Management Fundamentals' ||
                  link.title === 'Data Fetching & Caching' ||
                  link.title === 'AI with React Best Practices' ||
                  link.title === 'Remix'

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-disabled={isSoon ? true : undefined}
                      tabIndex={isSoon ? -1 : undefined}
                      className={clsx(
                        'mx-[6px] my-px flex items-center gap-[9px] rounded-[6px] px-[10px] py-[7px] text-[13px] tracking-[-0.01em] transition-colors duration-100',
                        isSoon && 'pointer-events-none opacity-40',
                        isActive
                          ? 'border border-[#dedbd6] bg-[#faf9f6] text-[#111111]'
                          : 'text-[#313130] hover:bg-[#faf9f6]'
                      )}
                      title={link.title}
                    >
                      <span
                        className={clsx(
                          'flex h-[22px] w-[22px] items-center justify-center rounded border text-[11px]',
                          isActive
                            ? 'border-[#111111] bg-[#111111] text-white'
                            : 'border-[#dedbd6] bg-[#faf9f6] text-[#7b7b78]'
                        )}
                        aria-hidden="true"
                      >
                        •
                      </span>
                      <span className={clsx('truncate', isActive && 'font-medium text-[#111111]')}>
                        {link.title}
                      </span>
                      {isSoon ? (
                        <span className="ml-auto rounded-[3px] border border-[#dedbd6] bg-[#faf9f6] px-1.5 py-0.5 text-[10px] text-[#7b7b78]">
                          Soon
                        </span>
                      ) : null}
                    </Link>

                    {isActive && truncatedAnchors.length > 0 ? (
                      <div className="mx-[6px] mt-0.5 rounded-[6px] border border-[#dedbd6] bg-[#faf9f6]">
                        <button
                          type="button"
                          onClick={() => setShowAnchors((value) => !value)}
                          className="flex w-full items-center justify-between px-[10px] py-2 text-left"
                        >
                          <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-[#7b7b78]">
                            On this page
                          </span>
                          <ChevronIcon open={showAnchors} />
                        </button>
                        {showAnchors ? (
                          <ul role="list" className="pb-1">
                            {truncatedAnchors.map((anchor, index) => (
                              <li key={anchor.id}>
                                <Link
                                  href={`${link.href}#${anchor.id}`}
                                  className={clsx(
                                    'flex items-center gap-2 px-[10px] py-[5px] text-[12px] tracking-[-0.01em]',
                                    index === truncatedAnchors.length - 1 && 'pb-2',
                                    activeAnchorId === anchor.id
                                      ? 'font-medium text-[#ff5600]'
                                      : 'text-[#7b7b78]'
                                  )}
                                >
                                  <span className="h-px w-3 bg-[#dedbd6]" aria-hidden="true" />
                                  <span className="truncate">{anchor.label}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>

      <div className="border-t border-[#dedbd6] p-3">
        <a
          href="https://github.com/MhamedEl-shahawy/ReactField"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-[6px] border border-[#dedbd6] bg-white px-2.5 py-2 transition hover:bg-[#faf9f6]"
        >
          <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[#111111] text-[10px] font-medium text-white">
            GH
          </div>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-medium text-[#111111]">MhamedEl-shahawy/ReactField</p>
            <p className="text-[10px] text-[#7b7b78]">View on GitHub</p>
          </div>
          <svg viewBox="0 0 20 20" aria-hidden="true" className="ml-auto h-[14px] w-[14px] text-[#7b7b78]">
            <path
              fill="currentColor"
              d="M10 1.667c-4.605 0-8.334 3.823-8.334 8.544 0 3.78 2.385 6.974 5.698 8.106.417.075.573-.182.573-.406 0-.203-.011-.875-.011-1.592-2.093.397-2.635-.522-2.802-1.002-.094-.246-.5-1.005-.854-1.207-.291-.16-.708-.556-.01-.567.656-.01 1.124.62 1.281.876.75 1.292 1.948.93 2.427.705.073-.555.291-.93.531-1.143-1.854-.213-3.791-.95-3.791-4.218 0-.929.322-1.698.854-2.296-.083-.214-.375-1.09.083-2.265 0 0 .698-.224 2.292.876a7.576 7.576 0 0 1 2.083-.288c.709 0 1.417.096 2.084.288 1.593-1.11 2.291-.875 2.291-.875.459 1.174.167 2.05.084 2.263.53.599.854 1.357.854 2.297 0 3.278-1.948 4.005-3.802 4.219.302.266.563.78.563 1.58 0 1.143-.011 2.061-.011 2.35 0 .224.156.491.573.405a8.365 8.365 0 0 0 4.11-3.116 8.707 8.707 0 0 0 1.567-4.99c0-4.721-3.73-8.545-8.334-8.545Z"
            />
          </svg>
        </a>
      </div>
    </aside>
  )
}
