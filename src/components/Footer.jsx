import Link from 'next/link'
import { useRouter } from 'next/router'

import { Button } from '@/components/Button'
import { Logo } from '@/components/Logo'
import { navigation } from '@/components/Navigation'
import { Resource } from '@/components/Resource'

function Feedback() {
  return (
    <div className="relative">
      <p className="text-sm prose text-white/75">
        Have recommendations?{' '}
        <Resource
          url="https://github.com/MhamedEl-shahawy/ReactField/issues"
        >
          Create an issue
        </Resource>{' '}
        on our GitHub repository to start a discussion.
      </p>
    </div>
  )
}

function PageLink({ label, page, previous = false }) {
  return (
    <>
      <Button
        href={page.href}
        aria-label={`${label}: ${page.title}`}
        variant="secondary"
        arrow={previous ? 'left' : 'right'}
      >
        {label}
      </Button>
      <Link
        href={page.href}
        tabIndex={-1}
        aria-hidden="true"
        className="text-base font-semibold transition text-white hover:text-white/80"
      >
        {page.title}
      </Link>
    </>
  )
}

function PageNavigation() {
  let router = useRouter()
  let allPages = navigation.flatMap((group) => group.links)
  let currentPageIndex = allPages.findIndex(
    (page) => page.href === router.pathname
  )

  if (currentPageIndex === -1) {
    return null
  }

  let previousPage = allPages[currentPageIndex - 1]
  let nextPage = allPages[currentPageIndex + 1]

  if (!previousPage && !nextPage) {
    return null
  }

  return (
    <div className="flex mb-24">
      {previousPage && (
        <div className="flex flex-col items-start gap-3">
          <PageLink label="Previous" page={previousPage} previous />
        </div>
      )}
      {nextPage && (
        <div className="flex flex-col items-end gap-3 ml-auto">
          <PageLink label="Next" page={nextPage} />
        </div>
      )}
    </div>
  )
}

function GitHubIcon(props) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 1.667c-4.605 0-8.334 3.823-8.334 8.544 0 3.78 2.385 6.974 5.698 8.106.417.075.573-.182.573-.406 0-.203-.011-.875-.011-1.592-2.093.397-2.635-.522-2.802-1.002-.094-.246-.5-1.005-.854-1.207-.291-.16-.708-.556-.01-.567.656-.01 1.124.62 1.281.876.75 1.292 1.948.93 2.427.705.073-.555.291-.93.531-1.143-1.854-.213-3.791-.95-3.791-4.218 0-.929.322-1.698.854-2.296-.083-.214-.375-1.09.083-2.265 0 0 .698-.224 2.292.876a7.576 7.576 0 0 1 2.083-.288c.709 0 1.417.096 2.084.288 1.593-1.11 2.291-.875 2.291-.875.459 1.174.167 2.05.084 2.263.53.599.854 1.357.854 2.297 0 3.278-1.948 4.005-3.802 4.219.302.266.563.78.563 1.58 0 1.143-.011 2.061-.011 2.35 0 .224.156.491.573.405a8.365 8.365 0 0 0 4.11-3.116 8.707 8.707 0 0 0 1.567-4.99c0-4.721-3.73-8.545-8.334-8.545Z"
      />
    </svg>
  )
}

function SocialLink({ href, icon: Icon, children }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group"
    >
      <span className="sr-only">{children}</span>
      <Icon className="w-5 h-5 transition fill-white/80" />
    </Link>
  )
}

function SmallPrint() {
  return (
    <>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <Logo />
          <p className="mt-1 text-xs text-white/75">
            The field guide to production React.
          </p>
        </div>
        <div className="rounded-full border border-white/25 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-[-0.01em] text-white/85">
          reactfield.dev
        </div>
      </div>
      <div className="grid gap-3 rounded-xl border border-white/15 bg-white/5 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <p className="text-xs text-white/75">
          Opinionated best practices for shipping reliable React products.
        </p>
        <Feedback />
      </div>
      <div className="mt-4 flex flex-col items-center justify-between gap-5 border-t border-white/20 pt-4 sm:flex-row">
        <p className="text-xs text-white/75">
          &copy; {new Date().getFullYear()} ReactField. All rights reserved.
        </p>
        <SocialLinksList />
      </div>
    </>
  )
}

export function SocialLinksList() {
  return (
    <div className="flex items-center gap-4">
      <SocialLink
        href="https://github.com/MhamedEl-shahawy/ReactField/"
        icon={GitHubIcon}
      >
        Follow on GitHub
      </SocialLink>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="max-w-2xl py-16 mx-auto space-y-5 lg:max-w-5xl">
      <div className="rounded-2xl bg-[color:var(--brand-house)]/95 px-6 py-8 shadow-[0_16px_40px_rgba(0,0,0,0.2)] ring-1 ring-white/10 backdrop-blur-sm">
        <PageNavigation />
        <SmallPrint />
      </div>
    </footer>
  )
}
