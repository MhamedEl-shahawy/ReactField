import Link from 'next/link'
import clsx from 'clsx'

function ArrowIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m11.5 6.5 3 3.5m0 0-3 3.5m3-3.5h-9"
      />
    </svg>
  )
}

const variantStyles = {
  primary:
    'rounded-full border border-[color:var(--brand-accent)] bg-[color:var(--brand-accent)] py-1.5 px-4 text-white hover:brightness-95 active:scale-95',
  secondary:
    'rounded-full border border-[color:var(--brand-accent)] bg-transparent py-1.5 px-4 text-[color:var(--brand-accent)] hover:bg-[color:var(--brand-accent)]/10 active:scale-95',
  filled:
    'rounded-full border border-[color:var(--brand-accent)] bg-[color:var(--brand-accent)] py-1.5 px-4 text-white hover:brightness-95 active:scale-95',
  outline:
    'rounded-full border border-[color:var(--brand-text)] py-1.5 px-4 text-[color:var(--brand-text)] hover:bg-black/5 active:scale-95',
  text: 'text-[color:var(--brand-accent)] hover:text-[color:var(--brand-primary)]',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  arrow,
  ...props
}) {
  let Component = props.href ? Link : 'button'

  className = clsx(
    'inline-flex gap-0.5 justify-center overflow-hidden text-sm font-semibold transition duration-200',
    variantStyles[variant],
    className
  )

  let arrowIcon = (
    <ArrowIcon
      className={clsx(
        'mt-0.5 h-5 w-5',
        variant === 'text' && 'relative top-px',
        arrow === 'left' && '-ml-1 rotate-180',
        arrow === 'right' && '-mr-1'
      )}
    />
  )

  let arrowDownIcon = (
    <ArrowIcon
      className={clsx(
        'mt-0.5 h-5 w-5 -mr-1 rotate-90',
      )}
    />
  )

  let arrowUpIcon = (
    <ArrowIcon
      className={clsx(
        'mt-0.5 h-5 w-5 -mr-1 -rotate-90',
      )}
    />
  )

  return (
    <Component className={className} {...props}>
      {arrow === 'left' && arrowIcon}
      {children}
      {arrow === 'right' && arrowIcon}
      {arrow === 'down' && arrowDownIcon}
      {arrow === 'up' && arrowUpIcon}
    </Component>
  )
}
