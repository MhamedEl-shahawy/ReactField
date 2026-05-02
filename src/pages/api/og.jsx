import { ImageResponse } from '@vercel/og'

export const config = {
  runtime: 'edge',
}

const WIDTH = 1200
const HEIGHT = 630
const MAX_TITLE_LENGTH = 90
const MAX_DESCRIPTION_LENGTH = 140

function clampText(value, maxLength) {
  if (!value) return ''
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength - 1)}…`
}

export default function handler(request) {
  const { searchParams } = new URL(request.url)
  const title = clampText(searchParams.get('title') || 'ReactField', MAX_TITLE_LENGTH)
  const description = clampText(
    searchParams.get('description') ||
      'Production React handbook with practical best practices, architecture guidance, and performance patterns.',
    MAX_DESCRIPTION_LENGTH
  )

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background:
            'linear-gradient(160deg, rgba(17,17,17,1) 0%, rgba(17,17,17,1) 60%, rgba(38,38,38,1) 100%)',
          color: '#ffffff',
          padding: '58px',
          fontFamily: 'Inter, Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#111111',
              border: '2px solid #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '-0.04em',
            }}
          >
            RF
          </div>
          <div style={{ fontSize: '34px', fontWeight: 600, lineHeight: 1.2 }}>ReactField</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div style={{ fontSize: '66px', fontWeight: 700, lineHeight: 1.06, letterSpacing: '-0.02em' }}>
            {title}
          </div>
          <div style={{ fontSize: '30px', color: '#d4d4d8', lineHeight: 1.35 }}>{description}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '24px', color: '#ff5600' }}>Production React handbook</div>
          <div style={{ fontSize: '24px', color: '#a1a1aa' }}>reactfield.dev</div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    }
  )
}
