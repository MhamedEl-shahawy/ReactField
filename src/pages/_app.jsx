import Head from 'next/head'
import { Router, useRouter } from 'next/router'
import { MDXProvider } from '@mdx-js/react'
import { Analytics } from '@vercel/analytics/react'

import { Layout } from '@/components/Layout'
import * as mdxComponents from '@/components/mdx'
import { useMobileNavigationStore } from '@/components/MobileNavigation'

import '@/styles/tailwind.css'
import 'focus-visible'

const DEFAULT_TITLE = 'ReactField'
const DEFAULT_DESCRIPTION =
  'ReactField is a production React handbook with best practices, architecture guides, performance patterns, and ecosystem recommendations for modern React teams.'
const DEFAULT_OG_IMAGE_ALT =
  'ReactField — production React handbook with best practices and architecture guidance'
const OG_IMAGE_WIDTH = 1200
const OG_IMAGE_HEIGHT = 630
/** Public site URL for absolute canonical/OG URLs when env is unset (e.g. static host). */
const PRODUCTION_SITE_ORIGIN = 'https://www.reactfield.dev'

function getSiteOrigin() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (explicit) return explicit

  // On Vercel production, VERCEL_URL is *.vercel.app. Using that for og:image/canonical
  // while users share the custom domain breaks many embed crawlers (Discord, OG preview tools).
  if (process.env.VERCEL_ENV === 'production') {
    return PRODUCTION_SITE_ORIGIN
  }

  const vercel = process.env.VERCEL_URL?.replace(/\/$/, '')
  if (vercel) return `https://${vercel}`

  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_SITE_ORIGIN
  }

  return ''
}

function toAbsoluteUrl(origin, path) {
  if (!origin) return ''
  if (!path) return origin
  if (/^https?:\/\//i.test(path)) return path
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`
}

/** Static file — LinkedIn, X, and Slack reliably fetch CDN assets; dynamic `/api/og` often fails their crawlers. */
const STATIC_OG_IMAGE_PATH = '/og.png'
/** Max URL length for og:image — very long URLs get truncated in HTML and break embeds. */
const MAX_OG_IMAGE_URL_LENGTH = 2000

/**
 * Optional per-page dynamic card via `/api/og?title=...` — set `pageProps.ogImage`.
 * Default stays static for LinkedIn/X compatibility.
 */
function createDynamicOgImagePath(pageHeading) {
  const shortTitle = (pageHeading || DEFAULT_TITLE).slice(0, 56)
  return `/api/og?${new URLSearchParams({ title: shortTitle }).toString()}`
}

function onRouteChange() {
  useMobileNavigationStore.getState().close()
}

Router.events.on('hashChangeStart', onRouteChange)
Router.events.on('routeChangeComplete', onRouteChange)
Router.events.on('routeChangeError', onRouteChange)

export default function App({ Component, pageProps }) {
  let router = useRouter()
  const origin = getSiteOrigin()
  const isHome = router.pathname === '/'
  const pageTitle = pageProps.title || DEFAULT_TITLE
  const title = isHome ? DEFAULT_TITLE : `${pageTitle} - ${DEFAULT_TITLE}`
  const description = pageProps.description || DEFAULT_DESCRIPTION
  const canonicalPath = router.asPath?.split('#')[0]?.split('?')[0] || router.pathname || '/'
  const canonicalUrl = toAbsoluteUrl(origin, canonicalPath)
  const ogHeading = isHome ? DEFAULT_TITLE : pageTitle
  const useDynamicOg = process.env.NEXT_PUBLIC_DYNAMIC_OG === 'true'
  const rawOgPath =
    pageProps.ogImage || (useDynamicOg ? createDynamicOgImagePath(ogHeading) : STATIC_OG_IMAGE_PATH)
  let ogImage = toAbsoluteUrl(origin, rawOgPath)
  if (ogImage && ogImage.length > MAX_OG_IMAGE_URL_LENGTH) {
    ogImage = toAbsoluteUrl(origin, STATIC_OG_IMAGE_PATH)
  }
  const ogImageAlt = pageProps.ogImageAlt || DEFAULT_OG_IMAGE_ALT

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="googlebot" content="index, follow, max-image-preview:large" />
        <meta property="og:site_name" content={DEFAULT_TITLE} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
        {ogImage ? <meta property="og:image" content={ogImage} /> : null}
        {ogImage ? <meta property="og:image:secure_url" content={ogImage} /> : null}
        {ogImage ? (
          <meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
        ) : null}
        {ogImage ? (
          <meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />
        ) : null}
        {ogImage ? <meta property="og:image:alt" content={ogImageAlt} /> : null}
        {ogImage ? <meta property="og:image:type" content="image/png" /> : null}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:domain" content="www.reactfield.dev" />
        {canonicalUrl ? <meta name="twitter:url" content={canonicalUrl} /> : null}
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}
        {ogImage ? <meta name="twitter:image:alt" content={ogImageAlt} /> : null}
        {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}
        <link
          rel="icon"
          type="image/svg+xml"
          href="/favicon.svg"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest"></link>
      </Head>
      <MDXProvider components={mdxComponents}>
        <Layout {...pageProps}>
          <Component {...pageProps} />
          <Analytics />
        </Layout>
      </MDXProvider>
    </>
  )
}
