import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { useSectionStore } from '@/components/SectionProvider'
import SidebarNavigation, { sidebarNavigation } from '@/components/SidebarNavigation'

export const navigation = sidebarNavigation

export function Navigation(props) {
  let router = useRouter()
  let sections = useSectionStore((s) => s.sections)

  let anchors = useMemo(
    () =>
      (sections || [])
        .filter((section) => (section.level ?? 2) === 2 && section.id !== '_top')
        .map((section) => ({ id: section.id, label: section.title })),
    [sections]
  )

  return <SidebarNavigation currentPath={router.pathname} anchors={anchors} />
}
