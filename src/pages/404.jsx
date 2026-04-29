import Link from 'next/link'

export async function getStaticProps() {
  return {
    props: {
      title: '404 - Page Not Found',
      description: 'The page you are looking for does not exist on ReactField.',
    },
  }
}

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-20 text-center">
      <p className="rounded-full border border-[#dedbd6] bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-[#7b7b78]">
        404
      </p>
      <h1 className="mt-5 text-3xl font-semibold tracking-[-0.02em] text-[#111111]">
        Page not found
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-7 text-[#5c5c58]">
        This route does not exist yet, or it may have been moved during a documentation update.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-[8px] bg-[#111111] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#1f1f1f]"
        >
          Go to Home
        </Link>
        <Link
          href="/fundamentals"
          className="rounded-[8px] border border-[#dedbd6] bg-white px-4 py-2 text-sm font-medium text-[#111111] transition hover:bg-[#faf9f6]"
        >
          Start with Fundamentals
        </Link>
      </div>
    </div>
  )
}
