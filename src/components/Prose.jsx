import clsx from 'clsx'

export function Prose({ as: Component = 'div', className, ...props }) {
  return (
    <Component
      className={clsx(
        className,
        'prose prose-headings:text-[#111111] dark:prose-headings:text-[#111111] prose-strong:text-[#111111] dark:prose-strong:text-[#111111]',
        'prose-code:rounded-[3px] prose-code:border prose-code:border-[#dedbd6] prose-code:bg-[#faf9f6] prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.9em] prose-code:text-[#313130] prose-code:before:content-none prose-code:after:content-none',
        'dark:prose-code:border-zinc-600 dark:prose-code:bg-zinc-800 dark:prose-code:text-zinc-100'
      )}
      {...props}
    />
  )
}
