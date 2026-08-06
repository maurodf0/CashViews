<script setup lang="ts">
import { computed, ref } from 'vue'
import { VyIcon } from '@vyui/kit/icon'
import { VyProgress } from '@vyui/kit/progress'

import SavingsActionDrawer from '../components/SavingsActionDrawer.vue'
import { useFinanceStore } from '../stores/finance'
import { formatCurrency } from '../lib/format'
import { ICON_COLOR } from '../lib/colors'
import { useCountUp } from '../composables/useCountUp'
import GlowOrb from '../components/GlowOrb.vue'

const store = useFinanceStore()
const drawerOpen = ref(false)
const drawerMode = ref<'deposita' | 'preleva'>('deposita')

function open(mode: 'deposita' | 'preleva') {
  drawerMode.value = mode
  drawerOpen.value = true
}

const percent = computed(() => Math.round(store.savingsProgress * 100))
const remaining = computed(() => Math.max(0, store.savingsGoal.target - store.savingsGoal.current))

const animatedCurrent = useCountUp(computed(() => store.savingsGoal.current))
const animatedPercent = useCountUp(percent)
</script>

<template>
  <view class="flex flex-col gap-6 px-4 pb-8 pt-4">
    <text class="text-xl font-semibold text-white animate-fade-in-up">Fondo Monetario</text>

    <view
      class="relative flex flex-col items-center gap-4 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-6 animate-scale-in"
      style="animation-delay: 40ms"
    >
      <GlowOrb class="-right-14 -top-20 size-56 opacity-50" />
      <GlowOrb class="-bottom-20 -left-14 size-48 opacity-40" />
      <view class="flex size-14 items-center justify-center rounded-full border border-white/10 bg-white/10">
        <VyIcon name="i-lucide-piggy-bank" :color="ICON_COLOR.white" class="size-7" />
      </view>
      <text class="truncate text-sm text-zinc-300">{{ store.savingsGoal.name }}</text>
      <text class="text-[36px] font-semibold text-white">{{ formatCurrency(animatedCurrent) }}</text>
      <view class="flex w-full flex-col gap-2">
        <VyProgress
          :model-value="animatedPercent"
          :max="100"
          size="lg"
          :ui="{ base: 'bg-white/15', indicator: 'bg-[linear-gradient(90deg,#0284c7,#0d9488)]' }"
        />
        <view class="flex flex-row items-center justify-between">
          <text class="text-xs text-zinc-300">{{ Math.round(animatedPercent) }}% dell'obiettivo</text>
          <text class="text-xs text-zinc-300">Obiettivo {{ formatCurrency(store.savingsGoal.target) }}</text>
        </view>
      </view>
    </view>

    <view class="flex flex-row gap-3 animate-fade-in-up" style="animation-delay: 100ms">
      <view
        class="flex flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] py-3.5 transition-transform active:scale-[0.97] active:bg-white/10"
        @tap="open('deposita')"
      >
        <VyIcon name="i-lucide-arrow-down-to-line" :color="ICON_COLOR.emerald400" class="size-4" />
        <text class="text-sm font-medium text-white">Deposita</text>
      </view>
      <view
        class="flex flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] py-3.5 transition-transform active:scale-[0.97] active:bg-white/10"
        @tap="open('preleva')"
      >
        <VyIcon name="i-lucide-arrow-up-from-line" :color="ICON_COLOR.rose400" class="size-4" />
        <text class="text-sm font-medium text-white">Preleva</text>
      </view>
    </view>

    <view
      class="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 animate-fade-in-up"
      style="animation-delay: 140ms"
    >
      <view class="flex flex-row items-center justify-between">
        <text class="text-sm text-zinc-400">Mancano</text>
        <text class="text-sm font-medium text-white">{{ formatCurrency(remaining) }}</text>
      </view>
      <view class="flex flex-row items-center justify-between">
        <text class="text-sm text-zinc-400">Obiettivo</text>
        <text class="text-sm font-medium text-white">{{ formatCurrency(store.savingsGoal.target) }}</text>
      </view>
    </view>

    <SavingsActionDrawer v-model:open="drawerOpen" :mode="drawerMode" />
  </view>
</template>
