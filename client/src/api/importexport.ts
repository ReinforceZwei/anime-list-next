import { pb } from '../lib/pb'

export interface ExportTag {
  id: string
  name: string
  color: string
  weight: number
  hidden: boolean
  deleted: string
}

export interface ExportAnimeRecord {
  tmdbId: number
  tmdbSeasonNumber: number
  tmdbMediaType: string
  customName: string
  cachedTitle: string
  cachedSeasonName: string
  status: string
  downloadStatus: string
  startedAt: string
  completedAt: string
  rating: number
  comment: string
  remark: string
  tags: string[]
  deleted: string
}

export interface ExportData {
  version: number
  exportedAt: string
  tags: ExportTag[]
  animeRecords: ExportAnimeRecord[]
}

export interface ImportResult {
  importedRecords: number
  importedTags: number
}

/**
 * Fetches the authenticated user's anime records and tags from the server and
 * triggers a JSON file download in the browser.
 */
export async function exportData(): Promise<void> {
  const data = await pb.send<ExportData>('/api/export', { method: 'GET' })
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `anime-export-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Reads the given JSON file and uploads it to the import endpoint.
 * Returns a summary of how many records and tags were created or updated.
 */
export async function importData(file: File): Promise<ImportResult> {
  const text = await file.text()
  const data: ExportData = JSON.parse(text)
  return pb.send<ImportResult>('/api/import', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  })
}
