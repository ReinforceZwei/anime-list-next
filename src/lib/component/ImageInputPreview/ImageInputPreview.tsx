'use client'

import { useEffect, useState } from "react"


interface ImageInputPreviewProps {
    imageFile?: File
}

export default function ImageInputPreview(props: ImageInputPreviewProps) {
    const { imageFile } = props
    const [preview, setPreview] = useState<string | undefined>()
    
    useEffect(() => {
        if (!imageFile) {
            setPreview(undefined)
            return
        }
        const objectUrl = URL.createObjectURL(imageFile)
        setPreview(objectUrl)
        return () => URL.revokeObjectURL(objectUrl)
    }, [imageFile])

    return (
        <img src={preview} style={{ width: '100%' }} />
    )
}