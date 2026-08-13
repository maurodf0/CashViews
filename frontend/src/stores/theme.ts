import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { accentGradient, DEFAULT_ACCENT } from '../lib/colors'
import { loadJSON, saveJSON } from '../lib/storage'

const STORAGE_KEY = 'cashviews:theme'

export const useThemeStore = defineStore('theme', () => {
  const accentColor = ref<string>(loadJSON(STORAGE_KEY, DEFAULT_ACCENT))

  const accentGradientCss = computed(() => accentGradient(accentColor.value))

  function setAccentColor(hex: string) {
    accentColor.value = hex
    saveJSON(STORAGE_KEY, hex)
  }

  return { accentColor, accentGradientCss, setAccentColor }
})
