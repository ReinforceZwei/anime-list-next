import {
  combinePresetAndAppleSplashScreens,
  createAppleSplashScreens,
  defineConfig,
  minimal2023Preset,
} from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: combinePresetAndAppleSplashScreens(
    minimal2023Preset,
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
      png: { compressionLevel: 9, quality: 60 },
      name: (landscape, size, dark) =>
        `apple-splash-${landscape ? 'landscape' : 'portrait'}-${dark ? 'dark-' : ''}${size.width}x${size.height}.png`,
    }),
  ),
  images: ['public/Anime.png'],
})
