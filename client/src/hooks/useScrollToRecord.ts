import { useCallback, useRef } from 'react'
import styles from './useScrollToRecord.module.css'

export function useScrollToRecord() {
  const refMap = useRef<Map<string, HTMLElement>>(new Map())
  // Stable callback ref functions per id — avoids React calling the ref every render
  const refFns = useRef<Map<string, (el: HTMLElement | null) => void>>(new Map())

  const getRef = useCallback((id: string) => {
    if (!refFns.current.has(id)) {
      refFns.current.set(id, (el) => {
        if (el) refMap.current.set(id, el)
        else refMap.current.delete(id)
      })
    }
    return refFns.current.get(id)!
  }, [])

  const jumpTo = useCallback((id: string) => {
    function attempt(retriesLeft: number) {
      const el = refMap.current.get(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add(styles.blink)
        const timer = setTimeout(() => el.classList.remove(styles.blink), 1000)
        // Guard against the element being removed before the timer fires
        return () => clearTimeout(timer)
      } else if (retriesLeft > 0) {
        setTimeout(() => attempt(retriesLeft - 1), 100)
      }
    }
    attempt(6)
  }, [])

  return { getRef, jumpTo }
}
