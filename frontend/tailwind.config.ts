import type { Config } from 'tailwindcss'

import { createLynxPreset } from '@lynx-js/tailwind-preset'
import { createVyuiPreset, VYUI_UI_STATES } from '@vyui/kit/tailwind'

import vyuiConfig from './vyui.config'

const lynxPreset = createLynxPreset({
  lynxUIPlugins: {
    uiVariants: {
      prefixes: (defaults) => ({
        ...defaults,
        ui: [...defaults.ui, ...VYUI_UI_STATES],
      }),
    },
  },
})

export default {
  darkMode: 'class',
  content: [
    './src/**/*.{vue,js,ts}',
    './node_modules/@vyui/kit/dist/**/*.js',
    './node_modules/@vyui/core/dist/**/*.js',
  ],
  presets: [lynxPreset, createVyuiPreset(vyuiConfig)],
} satisfies Config
