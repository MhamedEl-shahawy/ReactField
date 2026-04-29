import clsx from 'clsx'

export function Prose({ as: Component = 'div', className, ...props }) {
  return (
    <Component
      className={clsx(
        className,
        'prose dark:prose-invert prose-code:rounded-[3px] prose-code:border prose-code:border-[#dedbd6] prose-code:bg-[#faf9f6] prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.9em] prose-code:text-[#313130] prose-code:before:content-none prose-code:after:content-none'
      )}
      {...props}
    />
  )
}
