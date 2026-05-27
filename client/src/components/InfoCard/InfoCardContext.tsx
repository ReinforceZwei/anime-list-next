import { createContext, useContext } from 'react'
import type { AnimeRecord, TagRecord } from '../../types/anime'
import type { ActionButton } from '../../types/filter'

export interface InfoCardContextValue {
  anime: AnimeRecord | undefined
  tags: TagRecord[]
  loading: boolean
  posterUrl: string | null
  hasTmdbId: boolean
  onClose: () => void
  onEdit: () => void
  onPosterClick: () => void
  onJumpTo?: (id: string) => void
  /** Custom user-defined action buttons from preferences */
  actionButtons: ActionButton[]
  /** Map of tag ID → TagRecord, for resolving tag names in confirmation dialogs */
  tagMap: Map<string, TagRecord>
}

export const InfoCardContext = createContext<InfoCardContextValue | null>(null)

export function useInfoCard(): InfoCardContextValue {
  const ctx = useContext(InfoCardContext)
  if (!ctx) throw new Error('useInfoCard must be used inside <InfoCard>')
  return ctx
}
