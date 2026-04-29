import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react'
import { createStore, useStore } from 'zustand'

import { remToPx } from '@/lib/remToPx'

function createSectionStore(sections) {
  let normalizedSections = (sections ?? []).map((section) => ({
    ...section,
    level: section.level ?? 2,
  }))

  return createStore((set) => ({
    sections: normalizedSections,
    visibleSections: [],
    setVisibleSections: (visibleSections) =>
      set((state) =>
        state.visibleSections.join() === visibleSections.join()
          ? {}
          : { visibleSections }
      ),
    registerHeading: ({ id, ref, offsetRem, level = 2 }) =>
      set((state) => {
        let existingSection = state.sections.find((section) => section.id === id)
        let headingTitle = ref.current?.textContent?.trim()

        if (!existingSection) {
          return {
            sections: [
              ...state.sections,
              {
                id,
                title: headingTitle || id,
                level,
                headingRef: ref,
                offsetRem,
              },
            ],
          }
        }

        return {
          sections: state.sections.map((section) => {
            if (section.id === id) {
              return {
                ...section,
                title: section.title ?? headingTitle ?? id,
                level: section.level ?? level,
                headingRef: ref,
                offsetRem,
              }
            }
            return section
          }),
        }
      }),
  }))
}

function useVisibleSections(sectionStore) {
  let setVisibleSections = useStore(sectionStore, (s) => s.setVisibleSections)
  let sections = useStore(sectionStore, (s) => s.sections)

  useEffect(() => {
    let observedHeadings = sections.filter((section) => section.headingRef?.current)
    if (observedHeadings.length === 0) {
      setVisibleSections([])
      return
    }

    let visibilityMap = new Map()

    function updateVisibleSections() {
      let visible = observedHeadings
        .filter((section) => visibilityMap.get(section.id))
        .sort((a, b) => {
          let topA = a.headingRef.current.getBoundingClientRect().top
          let topB = b.headingRef.current.getBoundingClientRect().top
          return topA - topB
        })
        .map((section) => section.id)

      if (visible.length === 0) {
        let firstHeading = observedHeadings[0]
        let offset = remToPx(firstHeading.offsetRem ?? 0)
        let top = firstHeading.headingRef.current.getBoundingClientRect().top
        setVisibleSections(top - offset > 0 ? ['_top'] : [firstHeading.id])
        return
      }

      setVisibleSections(visible)
    }

    let observer = new IntersectionObserver(
      (entries) => {
        for (let entry of entries) {
          visibilityMap.set(entry.target.id, entry.isIntersecting)
        }
        updateVisibleSections()
      },
      {
        rootMargin: `-${remToPx(6)}px 0px -60% 0px`,
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    )

    for (let section of observedHeadings) {
      observer.observe(section.headingRef.current)
    }

    let raf = window.requestAnimationFrame(updateVisibleSections)
    window.addEventListener('resize', updateVisibleSections)

    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', updateVisibleSections)
    }
  }, [setVisibleSections, sections])
}

const SectionStoreContext = createContext()

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

export function SectionProvider({ sections, children }) {
  let [sectionStore] = useState(() => createSectionStore(sections))

  useVisibleSections(sectionStore)

  useIsomorphicLayoutEffect(() => {
    sectionStore.setState({ sections })
  }, [sectionStore, sections])

  return (
    <SectionStoreContext.Provider value={sectionStore}>
      {children}
    </SectionStoreContext.Provider>
  )
}

export function useSectionStore(selector) {
  let store = useContext(SectionStoreContext)
  return useStore(store, selector)
}
