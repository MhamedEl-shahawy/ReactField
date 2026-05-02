/**
 * Page chrome callouts using inline styles so MDX stays readable without Tailwind.
 */
export function ImpactBadge({ children }) {
  return (
    <div
      className="not-prose"
      style={{
        margin: '1rem 0',
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 3,
        border: '1px solid rgba(255, 86, 0, 0.2)',
        background: '#fff8f5',
        padding: '4px 8px',
        fontSize: 11,
        fontWeight: 600,
        color: '#ff5600',
      }}
    >
      {children}
    </div>
  )
}

export function MutedCallout({ children }) {
  return (
    <div
      className="not-prose"
      style={{
        margin: '1rem 0',
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 3,
        border: '1px solid #dedbd6',
        background: '#fff',
        padding: '4px 8px',
        fontSize: 11,
        color: '#626260',
      }}
    >
      {children}
    </div>
  )
}

export function NextPageLink({ href, children }) {
  return (
    <div className="not-prose" style={{ marginTop: '2rem' }}>
      <a
        href={href}
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: '#ff5600',
          textDecoration: 'underline',
          textUnderlineOffset: '0.15em',
        }}
      >
        {children}
      </a>
    </div>
  )
}
