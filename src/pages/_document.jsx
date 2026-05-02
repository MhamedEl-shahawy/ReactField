import { Head, Html, Main, NextScript } from 'next/document'

/** Light theme only: keep Tailwind `dark:` variants inactive. */
const modeScript = `
  document.documentElement.classList.remove('dark')
`

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script dangerouslySetInnerHTML={{ __html: modeScript }} />
      </Head>
      <body className="antialiased bg-[color:var(--brand-neutral-warm)]">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
