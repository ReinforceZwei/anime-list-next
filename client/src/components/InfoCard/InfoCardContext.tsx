import { createContext, useContext } from 'react'
import type { AnimeRecord, TagRecord } from '../../types/anime'

export interface InfoCardContextValue {
  anime: AnimeRecord | undefined
  tags: TagRecord[]
  loading: boolean
  posterUrl: string | null
  onClose: () => void
  onEdit: () => void
  onPosterClick: () => void
}

export const InfoCardContext = createContext<InfoCardContextValue | null>(null)

export function useInfoCard(): InfoCardContextValue {
  const ctx = useContext(InfoCardContext)
  if (!ctx) throw new Error('useInfoCard must be used inside <InfoCard>')
  return ctx
}
