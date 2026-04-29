import clsx from 'clsx'
import { Button } from '@/components/Button'
import { PropsWithChildren, useEffect, useId, useMemo, useRef, useState } from 'react'

interface DetailsProps {
  icon: 'learn' | 'contribute' | 'resources'
  label: string
  id?: string
}

const Icons = {
  'contribute': (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 stroke-zinc-900 dark:stroke-sky-500"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
        />
      </svg>
  ),
  'learn': (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6 stroke-zinc-900 dark:stroke-sky-500"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
        />
      </svg>
  ),
  'resources': (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  ),
}

export function Details({
  children,
  icon = 'learn',
  label = 'Deep Dive',
  id,
}: PropsWithChildren<DetailsProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)
  const generatedId = useId()
  const sectionId = useMemo(
    () =>
      id ??
      `deep-dive-${String(label || 'details')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')}-${generatedId.replace(/:/g, '')}`,
    [generatedId, id, label]
  )

  const Icon = Icons[icon];

  const buttonLabel = icon === 'contribute' ? 'What we need' : 'Read More';

  function toggleOpen() {
        setIsOpen(!isOpen)
  }

  useEffect(() => {
    if (!contentRef.current) return
    setContentHeight(contentRef.current.scrollHeight)
  }, [children, isOpen])

  useEffect(() => {
    if (!isOpen) return
    if (window.location.hash !== `#${sectionId}`) {
      window.history.replaceState(null, '', `#${sectionId}`)
    }
  }, [isOpen, sectionId])

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === `#${sectionId}`) {
        setIsOpen(true)
      }
    }

    onHashChange()
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [sectionId])

  useEffect(() => {
    const onSetAll = (event: Event) => {
      const next = (event as CustomEvent<{ open: boolean }>).detail?.open
      if (typeof next === 'boolean') {
        setIsOpen(next)
      }
    }

    window.addEventListener('rf-expandables:set-all', onSetAll as EventListener)
    return () => window.removeEventListener('rf-expandables:set-all', onSetAll as EventListener)
  }, [])

  return (
    <div
      id={sectionId}
      data-expandable="true"
      className="my-8 rounded-xl border-l-4 border-l-[#ff5600] bg-[#fffaf7] pt-8 ring-1 ring-[#dedbd6] pointer-events-auto dark:bg-zinc-900 dark:ring-zinc-800"
    >
      <div className="px-8">
        <div className="flex items-center gap-3 not-prose">
          {Icon}
          <span className="font-mono text-sm font-semibold uppercase text-zinc-800 dark:text-white">
            {label}
          </span>
        </div>
        <div className="pt-6 pb-2">
          <Button
            variant="filled"
            onClick={toggleOpen}
            arrow={isOpen ? 'up' : 'down'}
          >
            {isOpen ? 'Collapse' : buttonLabel}
          </Button>
          <span
            aria-hidden="true"
            className={clsx(
              'ml-3 inline-flex transition-transform duration-200 text-[#7b7b78]',
              isOpen && 'rotate-180'
            )}
          >
            ▼
          </span>
        </div>
      </div>
      <div className={clsx('pt-4 leading-6')}>
        <div
          ref={contentRef}
          style={{
            maxHeight: isOpen ? `${contentHeight}px` : '0px',
            opacity: isOpen ? 1 : 0,
          }}
          className={clsx(
            'overflow-hidden border-t p-6 transition-all duration-300 ease-out dark:border-zinc-800 [&>:first-child]:mt-0 [&>:last-child]:mb-0'
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
