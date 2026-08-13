<script setup lang="ts">
import { ref } from 'vue'
import { VyIcon } from '@vyui/kit/icon'

import AddTransactionDrawer from './AddTransactionDrawer.vue'
import { useThemeStore } from '../stores/theme'
import { ICON_COLOR } from '../lib/colors'
import type { TransactionKind } from '../types'

const theme = useThemeStore()

const expanded = ref(false)
const addOpen = ref(false)
const addKind = ref<TransactionKind>('uscita')

function toggle() {
  expanded.value = !expanded.value
}

function openAdd(kind: TransactionKind) {
  addKind.value = kind
  expanded.value = false
  addOpen.value = true
}
</script>

<template>
  <view class="pointer-events-none absolute inset-0">
    <view v-if="expanded" class="pointer-events-auto absolute inset-0 bg-black/40" @tap="expanded = false" />

    <view class="pointer-events-none absolute bottom-4 right-4 flex flex-col items-end gap-3">
      <view
        v-if="expanded"
        class="pointer-events-auto flex flex-row items-center gap-2 animate-fade-in-up"
        style="animation-delay: 20ms"
        @tap="openAdd('entrata')"
      >
        <text class="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg">Entrata</text>
        <view
          class="flex size-12 items-center justify-center rounded-full border border-white/10 bg-zinc-900 shadow-lg transition-transform active:scale-90"
        >
          <VyIcon name="i-lucide-plus" :color="ICON_COLOR.emerald400" class="size-5" />
        </view>
      </view>

      <view
        v-if="expanded"
        class="pointer-events-auto flex flex-row items-center gap-2 animate-fade-in-up"
        @tap="openAdd('uscita')"
      >
        <text class="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg">Uscita</text>
        <view
          class="flex size-12 items-center justify-center rounded-full border border-white/10 bg-zinc-900 shadow-lg transition-transform active:scale-90"
        >
          <VyIcon name="i-lucide-minus" :color="ICON_COLOR.rose400" class="size-4" />
        </view>
      </view>

      <view
        class="pointer-events-auto flex size-14 items-center justify-center rounded-full shadow-xl transition-transform active:scale-90"
        :style="{ background: theme.accentGradientCss }"
        @tap="toggle"
      >
        <VyIcon
          :name="expanded ? 'i-lucide-x' : 'i-lucide-plus'"
          :color="ICON_COLOR.white"
          class="size-6 transition-transform duration-200"
        />
      </view>
    </view>

    <AddTransactionDrawer v-model:open="addOpen" :initial-kind="addKind" />
  </view>
</template>
