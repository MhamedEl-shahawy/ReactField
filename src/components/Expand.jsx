import { useEffect, useId, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'

export function Expand({ children, parent, id }) {
  const [hidden, setHidden] = useState(true)
  const contentRef = useRef(null)
  const [contentHeight, setContentHeight] = useState(0)
  const generatedId = useId()
  const labelText = typeof parent === 'string' ? parent : 'expand'
  const sectionId = useMemo(
    () =>
      id ??
      `deep-dive-${String(labelText)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')}-${generatedId.replace(/:/g, '')}`,
    [generatedId, id, labelText]
  )

  function toggleHidden() {
    setHidden(!hidden)
  }

  useEffect(() => {
    if (!contentRef.current) return
    setContentHeight(contentRef.current.scrollHeight)
  }, [children, hidden])

  useEffect(() => {
    if (hidden) return
    if (window.location.hash !== `#${sectionId}`) {
      window.history.replaceState(null, '', `#${sectionId}`)
    }
  }, [hidden, sectionId])

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === `#${sectionId}`) {
        setHidden(false)
      }
    }

    onHashChange()
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [sectionId])

  useEffect(() => {
    const onSetAll = (event) => {
      const next = event.detail?.open
      if (typeof next === 'boolean') {
        setHidden(!next)
      }
    }

    window.addEventListener('rf-expandables:set-all', onSetAll)
    return () => window.removeEventListener('rf-expandables:set-all', onSetAll)
  }, [])

  return (
    <div id={sectionId} data-expandable="true" className="my-3 rounded-lg border-l-2 border-l-[#ff5600] bg-[#fffaf7] px-3 py-2">
      <div>
        <button
          className="flex items-center text-left gap-3 group"
          onClick={toggleHidden}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={clsx('h-5 w-5 transition-all duration-100 dark:stroke-sky-400', {
              'rotate-180': !hidden,
            })}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
          <h3 className="m-0 text-base font-bold">{parent}</h3>
          <span className="m-0 text-xs font-light tracking-tight transition-all -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus:translate-x-0 group-focus:opacity-100">{hidden ? 'show' : 'hide'}</span>
        </button>
      </div>
      <div>
        <div
          ref={contentRef}
          style={{
            maxHeight: hidden ? '0px' : `${contentHeight}px`,
            opacity: hidden ? 0 : 1,
          }}
          className={clsx(
            '[&>:first-child]:mt-0 [&>:last-child]:mb-0 overflow-hidden px-0 py-2 transition-all duration-300 ease-out'
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
