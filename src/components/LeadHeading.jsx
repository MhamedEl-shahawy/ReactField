import clsx from 'clsx'

export function LeadHeading({ children, className: cn = '' }) {
  return (
    <span
      className={clsx(
        'mb-4 block text-lg text-[#111111] dark:text-[#111111]',
        cn
      )}
    >
      {children}
    </span>
  )
}
