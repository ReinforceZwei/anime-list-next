import { useWallpaper } from '@/hooks/useWallpaper'
import classes from './WallpaperLayer.module.css'

export function WallpaperLayer() {
  const { style } = useWallpaper()

  return <div className={classes.wallpaper} style={style} />
}
