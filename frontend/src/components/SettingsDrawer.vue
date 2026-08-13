<script setup lang="ts">
import { ref } from 'vue'
import { VyDrawer } from '@vyui/kit/drawer'
import { VyIcon } from '@vyui/kit/icon'

import ManageCategoriesDrawer from './ManageCategoriesDrawer.vue'
import { useThemeStore } from '../stores/theme'
import { ACCENT_PRESETS } from '../lib/colors'

const open = defineModel<boolean>('open', { default: false })
const theme = useThemeStore()

const categoriesOpen = ref(false)
</script>

<template>
  <VyDrawer v-model:open="open" side="bottom" title="Impostazioni" :snap-points="[0.7]">
    <template #body>
      <view class="flex flex-col gap-6 px-1 pb-2">
        <view class="flex flex-col gap-2">
          <text class="text-xs text-zinc-500">Colore accento</text>
          <view class="flex flex-row flex-wrap gap-3">
            <view
              v-for="preset in ACCENT_PRESETS"
              :key="preset"
              class="flex size-10 items-center justify-center rounded-full border-2 transition-transform duration-150 active:scale-90"
              :class="theme.accentColor === preset ? 'scale-110' : ''"
              :style="{ backgroundColor: preset, borderColor: theme.accentColor === preset ? '#fff' : 'transparent' }"
              @tap="theme.setAccentColor(preset)"
            >
              <VyIcon v-if="theme.accentColor === preset" name="i-lucide-check" color="#ffffff" class="size-4" />
            </view>
          </view>
        </view>

        <view
          class="flex flex-row items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition-transform active:scale-[0.98] active:bg-white/5"
          @tap="categoriesOpen = true"
        >
          <view class="flex flex-row items-center gap-2">
            <VyIcon name="i-lucide-tags" color="#d4d4d8" class="size-5" />
            <text class="text-sm font-medium text-white">Gestisci categorie</text>
          </view>
          <VyIcon name="i-lucide-chevron-right" color="#71717a" class="size-4" />
        </view>
      </view>
    </template>
  </VyDrawer>

  <ManageCategoriesDrawer v-model:open="categoriesOpen" />
</template>
