import { useState, useCallback } from 'react'

const STORAGE_KEY = 'ui-scale'
const MIN_SCALE = 70
const MAX_SCALE = 150
const STEP = 10

function readStoredScale(): number {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? parseInt(stored, 10) : 100
}

function applyScale(value: number) {
  document.documentElement.style.fontSize = `${value}%`
  localStorage.setItem(STORAGE_KEY, String(value))
}

export function useUiScale() {
  const [scale, setScale] = useState<number>(readStoredScale)

  const changeScale = useCallback((value: number) => {
    const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, value))
    setScale(clamped)
    applyScale(clamped)
  }, [])

  const decrement = useCallback(() => changeScale(scale - STEP), [scale, changeScale])
  const increment = useCallback(() => changeScale(scale + STEP), [scale, changeScale])

  return { scale, changeScale, decrement, increment, min: MIN_SCALE, max: MAX_SCALE }
}
