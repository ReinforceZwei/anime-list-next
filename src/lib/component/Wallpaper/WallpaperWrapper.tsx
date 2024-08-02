import { getBackgroundImageUrl, getUserSettings } from "@/lib/service/userSettings";
import { CSSProperties, ReactNode } from "react";




interface WallpaperWrapperProps {
    children: ReactNode
}

export default async function WallpaperWrapper(props: WallpaperWrapperProps) {
    const { children } = props
    const userSettings = await getUserSettings()

    const backgroundUrl = userSettings ? await getBackgroundImageUrl(userSettings) : 'https://reinforce.moe/img/1.jpg'
    //https://reinforce.moe/web/data/User/reinforce/home/%E5%9B%BE%E7%89%87/wallpaper%20with%20chrome/kanna/21.jpg
    //const backgroundUrl = 'https://reinforce.moe/web/data/User/reinforce/home/%E5%9B%BE%E7%89%87/wallpaper%20with%20chrome/kanna/21.jpg'

    const style: CSSProperties = {
        backgroundImage: `url(${backgroundUrl})`,
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