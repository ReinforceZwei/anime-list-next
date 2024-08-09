import { getBackgroundImageUrl, getUserSettings, getBackgroundImageUrlForClient } from "@/lib/service/userSettings";
import { CSSProperties, ReactNode } from "react";
import WallpaperWrapperClient from "./WallpaperWrapperClient";




interface WallpaperWrapperProps {
    children: ReactNode
}

export default async function WallpaperWrapper(props: WallpaperWrapperProps) {
    const { children } = props
    const userSettings = await getUserSettings()

    const backgroundUrl = userSettings ? await getBackgroundImageUrlForClient(userSettings) : 'https://reinforce.moe/img/1.jpg'
    //https://reinforce.moe/web/data/User/reinforce/home/%E5%9B%BE%E7%89%87/wallpaper%20with%20chrome/kanna/21.jpg
    //const backgroundUrl = 'https://reinforce.moe/web/data/User/reinforce/home/%E5%9B%BE%E7%89%87/wallpaper%20with%20chrome/kanna/21.jpg'

    return (
        <WallpaperWrapperClient imageSrc={backgroundUrl}>
            {children}
        </WallpaperWrapperClient>
    )
}