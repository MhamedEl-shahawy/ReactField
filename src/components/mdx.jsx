import Link from 'next/link'
import clsx from 'clsx'
import { Heading } from '@/components/Heading'

export const a = Link;
export { CodeGroup, CodeComparison, Code as code, Pre as pre } from '@/components/Code';
export * from '@/components/Accordion'
export { Button } from '@/components/Button';
export * from '@/components/Details';
export * from '@/components/Expand';
export * from '@/components/FAQ';
export * from '@/components/LeadHeading'
export * from '@/components/PillTab';
export * from '@/components/Resource';
export * from '@/components/Summary';
export * from '@/components/StepList';
export * from '@/components/Tab';
export * from '@/components/Tweet';
export { ImpactBadge, MutedCallout, NextPageLink } from '@/components/DocCallouts';

export const h2 = function H2(props) {
  return <Heading level={2} {...props} />
}

export const h3 = function H3(props) {
  return <Heading level={3} {...props} />
}

function InfoIcon(props) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" {...props}>
      <circle cx="8" cy="8" r="8" strokeWidth="0" />
      <path
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M6.75 7.75h1.5v3.5"
      />
      <circle cx="8" cy="4" r=".5" fill="none" />
    </svg>
  )
}

export function Note({ children }) {
  return (
    <div
      className="not-prose my-6"
      style={{
        display: 'flex',
        gap: '0.625rem',
        borderRadius: '1rem',
        border: '1px solid rgba(14, 165, 233, 0.25)',
        background: 'rgba(240, 249, 255, 0.95)',
        padding: '1rem',
        fontSize: 14,
        lineHeight: 1.625,
        color: '#0c4a6e',
      }}
    >
      <InfoIcon
        aria-hidden
        style={{ flex: 'none', width: 16, height: 16, marginTop: 4, fill: '#0ea5e9', stroke: '#fff' }}
      />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  )
}

export function Row({ children }) {
  return (
    <div className="grid items-start grid-cols-1 gap-x-16 gap-y-10 xl:grid-cols-2">
      {children}
    </div>
  )
}

export function Col({ children, sticky = false }) {
  return (
    <div
      className={clsx(
        '[&>:first-child]:mt-0 [&>:last-child]:mb-0',
        sticky && 'xl:sticky xl:top-24'
      )}
    >
      {children}
    </div>
  )
}

export function Properties({ children }) {
  return (
    <div className="my-6">
      <ul
        role="list"
        className="m-0 max-w-[calc(theme(maxWidth.lg)-theme(spacing.8))] list-none divide-y divide-zinc-900/5 p-0 dark:divide-white/5"
      >
        {children}
      </ul>
    </div>
  )
}

export function Property({ name, type, children }) {
  return (
    <li className="px-0 py-4 m-0 first:pt-0 last:pb-0">
      <dl className="flex flex-wrap items-center m-0 gap-x-3 gap-y-2">
        <dt className="sr-only">Name</dt>
        <dd>
          <code>{name}</code>
        </dd>
        <dt className="sr-only">Type</dt>
        <dd className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
          {type}
        </dd>
        <dt className="sr-only">Description</dt>
        <dd className="w-full flex-none [&>:first-child]:mt-0 [&>:last-child]:mb-0">
          {children}
        </dd>
      </dl>
    </li>
  )
}
