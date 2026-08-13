<script setup lang="ts">
import { ref } from 'vue'
import { VyDrawer } from '@vyui/kit/drawer'
import { VyIcon } from '@vyui/kit/icon'

import ManageCategoriesDrawer from './ManageCategoriesDrawer.vue'
import DataExportImportDrawer from './DataExportImportDrawer.vue'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'
import { ACCENT_PRESETS } from '../lib/colors'

const open = defineModel<boolean>('open', { default: false })
const theme = useThemeStore()
const auth = useAuthStore()

const categoriesOpen = ref(false)
const dataOpen = ref(false)

function signOut() {
  open.value = false
  auth.signOut()
}
</script>

<template>
  <VyDrawer v-model:open="open" side="bottom" title="Impostazioni" :snap-points="[0.75]">
    <template #body>
      <view class="flex flex-col gap-6 px-1 pb-2">
        <view v-if="auth.user" class="flex flex-col gap-0.5">
          <text class="text-sm font-medium text-white">{{ auth.user.name }}</text>
          <text class="text-xs text-zinc-500">{{ auth.user.email }}</text>
        </view>

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

        <view class="flex flex-col gap-2">
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

          <view
            class="flex flex-row items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition-transform active:scale-[0.98] active:bg-white/5"
            @tap="dataOpen = true"
          >
            <view class="flex flex-row items-center gap-2">
              <VyIcon name="i-lucide-database" color="#d4d4d8" class="size-5" />
              <text class="text-sm font-medium text-white">Esporta / Importa dati</text>
            </view>
            <VyIcon name="i-lucide-chevron-right" color="#71717a" class="size-4" />
          </view>
        </view>

        <view class="flex flex-row items-center justify-center gap-2 py-2 transition-transform active:scale-95" @tap="signOut">
          <VyIcon name="i-lucide-log-out" color="#fb7185" class="size-4" />
          <text class="text-sm font-medium text-rose-400">Esci</text>
        </view>
      </view>
    </template>
  </VyDrawer>

  <ManageCategoriesDrawer v-model:open="categoriesOpen" />
  <DataExportImportDrawer v-model:open="dataOpen" />
</template>
