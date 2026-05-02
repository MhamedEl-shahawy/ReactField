import { clsx } from 'clsx'

export function Summary({ children, title = "What You'll Learn" }) {
  return (
    <div
      className={clsx(
        'my-6 rounded-xl border border-[#dedbd6] bg-white px-6 py-6 shadow-sm ring-1 ring-black/[0.04] sm:px-8 sm:py-7',
        'dark:border-zinc-700 dark:bg-zinc-900 dark:ring-white/10'
      )}
    >
      <div className="not-prose mb-4 flex items-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6 shrink-0 text-[#ff5600] dark:text-[#ff7a3d]"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
          />
        </svg>
        <h3 className="my-0 text-lg font-semibold text-[#111111] dark:text-zinc-100">{title}</h3>
      </div>
      <div
        className={clsx(
          'not-prose text-[15px] leading-relaxed text-[#313130]',
          '[&>:first-child]:mt-0 [&>:last-child]:mb-0',
          '[&_ul]:my-0 [&_ul]:list-disc [&_ul]:space-y-2.5 [&_ul]:pl-5',
          '[&_ol]:my-0 [&_ol]:list-decimal [&_ol]:space-y-2.5 [&_ol]:pl-5',
          '[&_li]:pl-1 [&_li]:text-[#313130] dark:[&_li]:text-zinc-200 [&_ul>li]:marker:text-[#ff5600]',
          '[&_a]:font-medium [&_a]:text-[#ff5600] [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-[#ff5600]/35',
          '[&_a]:transition-colors hover:[&_a]:text-[#cc4400]',
          'dark:[&_a]:text-sky-400 dark:[&_a]:decoration-sky-400/40 dark:hover:[&_a]:text-sky-300'
        )}
      >
        {children}
      </div>
    </div>
  )
}
