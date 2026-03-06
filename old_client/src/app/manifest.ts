import { MetadataRoute } from 'next'
import { themeOptions } from '@/themeOptions'
 
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Anime List',
        short_name: 'Anime List',
        description: 'Anime List',
        start_url: '/',
        display: 'standalone',
        theme_color: themeOptions.palette.primary.main,
        icons: [
            {
                src: '/Anime.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}