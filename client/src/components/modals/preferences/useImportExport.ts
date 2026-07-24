import { useRef, useState, useCallback } from 'react'
import { exportData, importData, type ImportResult } from '@/api/importexport'
import { showErrorNotification } from '@/lib/notifications'

export function useImportExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const resetFileRef = useRef<() => void>(null)

  const handleExport = useCallback(async () => {
    setIsExporting(true)
    try {
      await exportData()
    } catch (err) {
      showErrorNotification(err)
    } finally {
      setIsExporting(false)
    }
  }, [])

  const handleImport = useCallback(async (file: File | null) => {
    if (!file) return
    setIsImporting(true)
    setImportResult(null)
    setImportError(null)
    try {
      const result = await importData(file)
      setImportResult(result)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : '匯入失敗')
    } finally {
      setIsImporting(false)
      resetFileRef.current?.()
    }
  }, [])

  return { isExporting, isImporting, importResult, importError, resetFileRef, handleExport, handleImport }
}
