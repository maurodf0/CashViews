import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { accentGradient, DEFAULT_ACCENT } from '../lib/colors'
import { loadJSON, saveJSON } from '../lib/storage'
import { apiFetch } from '../lib/api'

const STORAGE_KEY = 'cashviews:theme'

export const useThemeStore = defineStore('theme', () => {
  const accentColor = ref<string>(loadJSON(STORAGE_KEY, DEFAULT_ACCENT))

  const accentGradientCss = computed(() => accentGradient(accentColor.value))

  async function setAccentColor(hex: string) {
    accentColor.value = hex
    saveJSON(STORAGE_KEY, hex)
    try {
      await apiFetch('/api/preferences', { method: 'PATCH', body: JSON.stringify({ accentColor: hex }) })
    } catch {
      // best-effort server sync — the locally cached value is already applied
    }
  }

  /** Called once after login/session-fetch to prefer the server's stored preference over the local cache. */
  function hydrateFromServer(serverColor: string | null) {
    if (!serverColor || serverColor === accentColor.value) return
    accentColor.value = serverColor
    saveJSON(STORAGE_KEY, serverColor)
  }

  return { accentColor, accentGradientCss, setAccentColor, hydrateFromServer }
})
