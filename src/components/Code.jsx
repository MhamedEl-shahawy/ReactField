import {
  Children,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Tab } from '@headlessui/react'
import clsx from 'clsx'
import { create } from 'zustand'

import { Tag } from '@/components/Tag'

const languageNames = {
  js: 'JavaScript',
  ts: 'TypeScript',
  jsx: 'JSX',
  tsx: 'TSX',
  bash: 'Bash',
  sh: 'Shell',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  php: 'PHP',
  python: 'Python',
  ruby: 'Ruby',
  go: 'Go',
}

function getPanelTitle({ title, language }) {
  return title ?? languageNames[language] ?? 'Code'
}

function getCodeLines(code = '') {
  let normalized = code.replace(/\n$/, '')
  return normalized.length > 0 ? normalized.split('\n') : []
}

function getLanguageLabel(language = '') {
  return String(language || 'text').toLowerCase()
}

function ClipboardIcon(props) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" {...props}>
      <path
        strokeWidth="0"
        d="M5.5 13.5v-5a2 2 0 0 1 2-2l.447-.894A2 2 0 0 1 9.737 4.5h.527a2 2 0 0 1 1.789 1.106l.447.894a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2Z"
      />
      <path
        fill="none"
        strokeLinejoin="round"
        d="M12.5 6.5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2m5 0-.447-.894a2 2 0 0 0-1.79-1.106h-.527a2 2 0 0 0-1.789 1.106L7.5 6.5m5 0-1 1h-3l-1-1"
      />
    </svg>
  )
}

function CopyButton({ code }) {
  let [copyCount, setCopyCount] = useState(0)
  let copied = copyCount > 0

  useEffect(() => {
    if (copyCount > 0) {
      let timeout = setTimeout(() => setCopyCount(0), 1000)
      return () => {
        clearTimeout(timeout)
      }
    }
  }, [copyCount])
  
  function copyToClipboard() {
    window.navigator.clipboard.writeText(code).then(() => {
      setCopyCount((count) => count + 1)
    })
  }

  return (
    <button
      type="button"
      className={clsx(
        'group/button overflow-hidden rounded-[4px] py-1 pl-2 pr-3 text-2xs font-medium backdrop-blur transition',
        copied
          ? 'bg-sky-400/10 ring-1 ring-inset ring-sky-400/20'
          : 'bg-black/30 hover:bg-black/45 dark:bg-white/5 dark:hover:bg-white/10'
      )}
      onClick={copyToClipboard}
    >
      <span
        aria-hidden={copied}
        className={clsx(
          'pointer-events-none flex items-center gap-0.5 text-zinc-400 transition duration-300',
          copied && '-translate-y-1.5 opacity-0'
        )}
      >
        <ClipboardIcon className="h-5 w-5 fill-zinc-500/20 stroke-zinc-500 transition-colors group-hover/button:stroke-zinc-400" />
        Copy
      </span>
      <span
        aria-hidden={!copied}
        className={clsx(
          'pointer-events-none absolute inset-0 flex items-center justify-center text-sky-400 transition duration-300',
          !copied && 'translate-y-1.5 opacity-0'
        )}
      >
        Copied!
      </span>
    </button>
  )
}

function CodePanelHeader({ tag, label }) {
  if (!tag && !label) {
    return null
  }

  return (
    <div className="flex h-9 items-center gap-2 border-y border-t-transparent border-b-white/7.5 bg-zinc-900 bg-white/2.5 px-4 dark:border-b-white/5 dark:bg-white/1">
      {tag && (
        <div className="dark flex">
          <Tag variant="small">{tag}</Tag>
        </div>
      )}
      {tag && label && (
        <span className="h-0.5 w-0.5 rounded-full bg-zinc-500" />
      )}
      {label && (
        <span className="font-mono text-xs text-zinc-400">{label}</span>
      )}
    </div>
  )
}

function CodePanel({ tag, label, code, children }) {
  let child = Children.only(children)
  let rawCode = child.props.code ?? code ?? ''
  let lineCount = getCodeLines(rawCode).length
  let showLineNumbers = lineCount > 8
  let canCollapse = lineCount > 20
  let language = getLanguageLabel(child.props.language)
  let [expanded, setExpanded] = useState(false)

  return (
    <div className="group dark:bg-white/2.5">
      <CodePanelHeader
        tag={child.props.tag ?? tag}
        label={child.props.label ?? label}
      />
      <div className="relative">
        <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
          <span className="rounded-[3px] border border-white/10 bg-black/30 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-zinc-300">
            {language}
          </span>
          <CopyButton code={rawCode} />
        </div>
        <pre
          className={clsx(
            'code-block overflow-x-auto p-4 pr-28 text-xs text-white',
            showLineNumbers && 'code-block--line-numbers',
            canCollapse && !expanded && 'code-block--collapsed'
          )}
        >
          {children}
        </pre>
        {canCollapse ? (
          <div className="border-t border-white/10 bg-zinc-900/95 px-4 py-2 dark:border-white/5">
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="text-[11px] font-medium text-zinc-300 transition hover:text-white"
            >
              {expanded ? 'Collapse code' : `Expand code (${lineCount} lines)`}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function CodeGroupHeader({ title, children, selectedIndex }) {
  let hasTabs = Children.count(children) > 1

  if (!title && !hasTabs) {
    return null
  }

  return (
    <div className="flex min-h-[calc(theme(spacing.12)+1px)] flex-wrap items-start gap-x-4 border-b border-zinc-700 bg-zinc-800 px-4 dark:border-zinc-800 dark:bg-transparent">
      {title && (
        <h3 className="mr-auto pt-3 text-xs font-semibold text-white">
          {title}
        </h3>
      )}
      {hasTabs && (
        <Tab.List className="-mb-px flex gap-4 text-xs font-medium">
          {Children.map(children, (child, childIndex) => (
            <Tab
              className={clsx(
                'border-b py-3 transition focus:[&:not(:focus-visible)]:outline-none',
                childIndex === selectedIndex
                  ? 'border-sky-500 text-sky-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-300'
              )}
            >
              {getPanelTitle(child.props)}
            </Tab>
          ))}
        </Tab.List>
      )}
    </div>
  )
}

function CodeGroupPanels({ children, ...props }) {
  let hasTabs = Children.count(children) > 1

  if (hasTabs) {
    return (
      <Tab.Panels>
        {Children.map(children, (child) => (
          <Tab.Panel>
            <CodePanel {...props}>{child}</CodePanel>
          </Tab.Panel>
        ))}
      </Tab.Panels>
    )
  }

  return <CodePanel {...props}>{children}</CodePanel>
}

function usePreventLayoutShift() {
  let positionRef = useRef()
  let rafRef = useRef()

  useEffect(() => {
    return () => {
      window.cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return {
    positionRef,
    preventLayoutShift(callback) {
      let initialTop = positionRef.current.getBoundingClientRect().top

      callback()

      rafRef.current = window.requestAnimationFrame(() => {
        let newTop = positionRef.current.getBoundingClientRect().top
        window.scrollBy(0, newTop - initialTop)
      })
    },
  }
}

const usePreferredLanguageStore = create((set) => ({
  preferredLanguages: [],
  addPreferredLanguage: (language) =>
    set((state) => ({
      preferredLanguages: [
        ...state.preferredLanguages.filter(
          (preferredLanguage) => preferredLanguage !== language
        ),
        language,
      ],
    })),
}))

function useTabGroupProps(availableLanguages) {
  let { preferredLanguages, addPreferredLanguage } = usePreferredLanguageStore()
  let [selectedIndex, setSelectedIndex] = useState(0)
  let activeLanguage = [...availableLanguages].sort(
    (a, z) => preferredLanguages.indexOf(z) - preferredLanguages.indexOf(a)
  )[0]
  let languageIndex = availableLanguages.indexOf(activeLanguage)
  let newSelectedIndex = languageIndex === -1 ? selectedIndex : languageIndex
  if (newSelectedIndex !== selectedIndex) {
    setSelectedIndex(newSelectedIndex)
  }

  let { positionRef, preventLayoutShift } = usePreventLayoutShift()

  return {
    as: 'div',
    ref: positionRef,
    selectedIndex,
    onChange: (newSelectedIndex) => {
      preventLayoutShift(() =>
        addPreferredLanguage(availableLanguages[newSelectedIndex])
      )
    },
  }
}

const CodeGroupContext = createContext(false)

export function CodeGroup({ children, title, ...props }) {
  let languages = Children.map(children, (child) => getPanelTitle(child.props))
  let tabGroupProps = useTabGroupProps(languages)
  let hasTabs = Children.count(children) > 1
  let Container = hasTabs ? Tab.Group : 'div'
  let containerProps = hasTabs ? tabGroupProps : {}
  let headerProps = hasTabs
    ? { selectedIndex: tabGroupProps.selectedIndex }
    : {}

  return (
    <CodeGroupContext.Provider value={true}>
      <Container
        {...containerProps}
        className="not-prose my-6 overflow-hidden rounded-2xl bg-zinc-900 shadow-md dark:ring-1 dark:ring-white/10"
      >
        <CodeGroupHeader title={title} {...headerProps}>
          {children}
        </CodeGroupHeader>
        <CodeGroupPanels {...props}>{children}</CodeGroupPanels>
      </Container>
    </CodeGroupContext.Provider>
  )
}

function DiffSide({ title, language, code, variant }) {
  let lines = getCodeLines(code)
  let showLineNumbers = lines.length > 8

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-3 py-2">
        <span className="text-xs font-medium text-zinc-700">{title}</span>
        <span className="rounded-[3px] border border-zinc-300 bg-white px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-zinc-500">
          {getLanguageLabel(language)}
        </span>
      </div>
      <div
        className={clsx(
          'code-diff p-3 font-mono text-[12px] leading-6 text-zinc-800',
          showLineNumbers && 'code-diff--line-numbers'
        )}
      >
        {lines.map((line, index) => (
          <div
            key={`${title}-${index}`}
            className={clsx(
              'code-diff-line whitespace-pre',
              variant === 'before' && 'code-diff-line--before',
              variant === 'after' && 'code-diff-line--after'
            )}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  )
}

export function CodeComparison({
  beforeTitle = 'Before',
  afterTitle = 'After',
  beforeCode = '',
  afterCode = '',
  language = 'tsx',
  wide = false,
}) {
  return (
    <div
      className={clsx(
        'not-prose my-6 grid grid-cols-1 gap-3 lg:grid-cols-2',
        wide && 'xl:-mx-14 2xl:-mx-20'
      )}
    >
      <DiffSide title={beforeTitle} language={language} code={beforeCode} variant="before" />
      <DiffSide title={afterTitle} language={language} code={afterCode} variant="after" />
    </div>
  )
}

export function Code({ children, ...props }) {
  let isGrouped = useContext(CodeGroupContext)

  if (isGrouped) {
    return <code {...props} dangerouslySetInnerHTML={{ __html: children }} />
  }

  return <code {...props}>{children}</code>
}

export function Pre({ children, ...props }) {
  let isGrouped = useContext(CodeGroupContext)

  if (isGrouped) {
    return children
  }

  return <CodeGroup {...props}>{children}</CodeGroup>
}
