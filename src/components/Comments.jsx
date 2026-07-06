import Giscus from '@giscus/react'
import { useRouter } from 'next/router'

const repo = process.env.NEXT_PUBLIC_GISCUS_REPO
const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID
const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY
const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID

function isGiscusConfigured() {
  return Boolean(repo && repoId && category && categoryId)
}

export function Comments() {
  const router = useRouter()

  if (!isGiscusConfigured()) {
    return null
  }

  return (
    <section
      className="mb-[14px] rounded-[8px] border border-[#dedbd6] bg-white px-4 py-4 sm:px-6 sm:py-5"
      aria-labelledby="comments-heading"
    >
      <h3 id="comments-heading" className="mb-4 text-[15px] font-medium text-[#111111]">
        Discussion
      </h3>
      <Giscus
        key={routeScrollKey(router.asPath)}
        repo={repo}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="bottom"
        theme="light"
        lang="en"
        loading="lazy"
      />
    </section>
  )
}

function routeScrollKey(asPath) {
  const withoutHash = asPath.split('#')[0] ?? ''
  return withoutHash.split('?')[0] ?? ''
}
