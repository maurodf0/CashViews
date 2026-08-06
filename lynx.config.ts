import { defineConfig } from '@lynx-js/rspeedy'

import { pluginQRCode } from '@lynx-js/qrcode-rsbuild-plugin'
import { pluginTailwindCSS } from 'rsbuild-plugin-tailwindcss'
import { pluginVueLynx } from 'vue-lynx/plugin'

export default defineConfig({
  environments: {
    lynx: {},
    web: {},
  },
  plugins: [
    pluginQRCode({
      schema(url) {
        // We use `?fullscreen=true` to open the page in LynxExplorer in full screen mode
        return `${url}?fullscreen=true`
      },
    }),
    pluginTailwindCSS({
      config: 'tailwind.config.ts',
      exclude: [/[\\/]node_modules[\\/]/],
    }),
    pluginVueLynx({
      optionsApi: false,
      enableCSSInlineVariables: true,
      enableCSSInheritance: true,
      includeWorkletPackages: ['@vyui/core', '@vyui/kit'],
    }),
  ],
})
