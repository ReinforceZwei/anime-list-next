import {
  combinePresetAndAppleSplashScreens,
  createAppleSplashScreens,
  defineConfig,
  minimal2023Preset,
} from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: combinePresetAndAppleSplashScreens(
    {
      ...minimal2023Preset,
      apple: {
        sizes: [180],
        padding: 0,
      },
    },
    createAppleSplashScreens({
      padding: 0.3,
      resizeOptions: { background: '#1a1b1e', fit: 'contain' },
      darkResizeOptions: { background: '#1a1b1e', fit: 'contain' },
      linkMediaOptions: {
        log: true,
        addMediaScreen: true,
        basePath: '/',
        xhtml: false,
      },
      name: (landscape, size, dark) =>
        `apple-splash-${landscape ? 'landscape' : 'portrait'}-${dark ? 'dark-' : ''}${size.width}x${size.height}.png`,
    }),
  ),
  images: ['public/Anime.png'],
})
