import { useRef, useState, useCallback } from 'react'

const ACCEPT = 'image/png,image/jpeg,image/webp,image/tiff,image/bmp'

export function useWallpaperUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const resetRef = useRef<() => void>(null)

  const handleFileChange = useCallback((f: File | null) => {
    // Revoke previous object URL to avoid memory leaks
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setFile(f)
    if (f) {
      setPreviewUrl(URL.createObjectURL(f))
    } else {
      setPreviewUrl(null)
    }
  }, [previewUrl])

  /** Append wallpaper file + non-file fields to an existing FormData object. */
  const appendToFormData = useCallback((fd: FormData, values: {
    uiConfig: unknown
    sections: unknown
    actionButtons: unknown
  }) => {
    if (file) {
      fd.append('wallpaper', file)
    }
    fd.append('uiConfig', JSON.stringify(values.uiConfig))
    fd.append('sections', JSON.stringify(values.sections ?? []))
    fd.append('actionButtons', JSON.stringify(values.actionButtons ?? []))
  }, [file])

  const reset = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setFile(null)
    setPreviewUrl(null)
    resetRef.current?.()
  }, [previewUrl])

  return { file, previewUrl, resetRef, accept: ACCEPT, handleFileChange, appendToFormData, reset }
}
