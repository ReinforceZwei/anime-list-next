'use client'

import { createBrowserClient } from "@/lib/pocketbase"
import { useGetUserSettingsQuery } from "@/lib/redux/userSettingsSlice"
import { CSSProperties, ReactNode } from "react"


interface WallpaperWrapperClientProps {
    children: ReactNode
    imageSrc?: string
}

export default function WallpaperWrapperClient(props: WallpaperWrapperClientProps) {
    const { children, imageSrc } = props

    const { data: userSettings, isLoading } = useGetUserSettingsQuery()

    let backgroundUrl: string | undefined = imageSrc
    if (!isLoading && userSettings) {
        const pb = createBrowserClient()
        backgroundUrl = pb.files.getUrl(userSettings, userSettings.background_image)
    }

    const style: CSSProperties = {
        ...(backgroundUrl && { backgroundImage: `url(${backgroundUrl})` }),
        //backgroundImage: `url(${backgroundUrl})`,
        backgroundPosition: 'top',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
    }
    return (
        <div style={style}>
            {children}
        </div>
    )
}