import clsx from 'clsx'

const rfSans =
  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

/** Square mark; keeps typography aligned with the ReactField wordmark (bold sans). Sync `public/favicon.svg` when changing geometry. */
export function RfSquareMark({ className, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-hidden
      className={clsx('aspect-square shrink-0 overflow-hidden', className)}
      {...props}
    >
      <title>ReactField</title>
      <rect width="64" height="64" rx="14" fill="#111111" />
      <text
        x="32"
        y="32"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#ffffff"
        fontFamily={rfSans}
        fontSize={23}
        fontWeight={700}
        letterSpacing="-0.07em"
      >
        RF
      </text>
      <circle cx="53.5" cy="53.5" r="5" fill="#ff5600" />
    </svg>
  )
}

export function Logo({ className, ...props }) {
  return (
    <div className={clsx('flex items-center gap-2', className)} {...props}>
      <RfSquareMark className="size-6" />
      <span className="text-sm font-semibold leading-none text-[color:var(--brand-primary)]">
        ReactField
      </span>
    </div>
  )
}
