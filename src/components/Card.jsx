import Link from 'next/link'

function CardIcon({ icon: Icon }) {
  return (
    <div className="mb-4 mt-4 flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--brand-neutral-warm)] ring-1 ring-black/15 backdrop-blur-[2px] transition duration-300 group-hover:bg-white group-hover:ring-black/20">
      <Icon className="w-5 h-5 transition-colors duration-300 fill-black/10 stroke-[color:var(--brand-primary)] group-hover:stroke-[color:var(--brand-accent)]" />
    </div>
  )
}

export function Card({ resource }) {
  return (
    <div
      key={resource.href}
      className="group relative flex rounded-xl bg-white transition-all hover:-translate-y-1"
      style={{ boxShadow: 'var(--brand-card-shadow)' }}
    >
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10 group-hover:ring-black/15" />
      <div className="relative px-4 pt-8 pb-4 rounded-xl">
        {resource.icon ? <CardIcon icon={resource.icon} /> : null}
        <h3 className="text-sm font-semibold leading-7 text-[color:var(--brand-text)]">
          <Link href={resource.href}>
            <span className="absolute inset-0 rounded-xl" />
            {resource.name}
          </Link>
        </h3>
        <p className="pb-4 mt-1 text-sm text-[color:var(--brand-text-soft)]">
          {resource.description}
        </p>
      </div>
    </div>
  )
}
