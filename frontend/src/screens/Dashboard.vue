<script setup lang="ts">
import { computed } from 'vue'
import { VyIcon } from '@vyui/kit/icon'

import TransactionRow from '../components/TransactionRow.vue'
import { useFinanceStore } from '../stores/finance'
import { useThemeStore } from '../stores/theme'
import { formatCurrency } from '../lib/format'
import { ICON_COLOR } from '../lib/colors'
import { useCountUp } from '../composables/useCountUp'
import GlassCard from '../components/GlassCard.vue'

const emit = defineEmits<{
  navigate: ['transazioni' | 'ricorrenti' | 'risparmi']
  openSettings: []
}>()

const store = useFinanceStore()
const theme = useThemeStore()

const recent = computed(() => store.sortedTransactions.slice(0, 5))
const savingsPercent = computed(() => {
  const target = store.savingsGoals.reduce((s, g) => s + g.target, 0)
  return target > 0 ? Math.round((store.totalSavings / target) * 100) : 0
})

const animatedBalance = useCountUp(computed(() => store.balance))
const animatedEntrate = useCountUp(computed(() => store.totalEntrate))
const animatedUscite = useCountUp(computed(() => store.totalUscite))
const animatedSavingsPercent = useCountUp(savingsPercent)
const animatedRecurringTotal = useCountUp(computed(() => store.monthlyRecurringTotal))
</script>

<template>
  <view class="flex flex-col gap-6 px-4 pb-8 pt-4">
    <view class="flex flex-row items-center justify-between animate-fade-in-up">
      <view class="flex flex-col">
        <text class="text-sm text-zinc-400">Bentornato</text>
        <text class="text-xl font-semibold text-white">Il tuo conto</text>
      </view>
      <view
        class="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/10 transition-transform active:scale-90"
        @tap="emit('openSettings')"
      >
        <VyIcon name="i-lucide-settings" :color="ICON_COLOR.white" class="size-5" />
      </view>
    </view>

    <GlassCard class="flex flex-col gap-4 p-5 animate-fade-in-up" style="animation-delay: 40ms">
      <text class="text-xs font-medium uppercase tracking-wide text-zinc-400">Saldo disponibile</text>
      <text class="text-[34px] font-semibold text-white">{{ formatCurrency(animatedBalance) }}</text>
      <view class="flex flex-row gap-6">
        <view class="flex flex-col gap-0.5">
          <text class="text-xs text-zinc-400">Entrate</text>
          <text class="text-sm font-medium text-emerald-400">{{ formatCurrency(animatedEntrate) }}</text>
        </view>
        <view class="flex flex-col gap-0.5">
          <text class="text-xs text-zinc-400">Uscite</text>
          <text class="text-sm font-medium text-rose-400">{{ formatCurrency(animatedUscite) }}</text>
        </view>
      </view>
    </GlassCard>

    <view
      class="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition-transform active:scale-[0.98] active:bg-white/5 animate-fade-in-up"
      style="animation-delay: 120ms"
      @tap="emit('navigate', 'risparmi')"
    >
      <view class="flex flex-row items-center justify-between">
        <view class="flex min-w-0 flex-row items-center gap-2">
          <VyIcon name="i-lucide-piggy-bank" :color="theme.accentColor" class="size-5 shrink-0" />
          <text class="truncate text-sm font-medium text-white">
            {{ store.savingsGoals.length }} {{ store.savingsGoals.length === 1 ? 'fondo' : 'fondi' }}
          </text>
        </view>
        <VyIcon name="i-lucide-chevron-right" :color="ICON_COLOR.zinc500" class="size-4 shrink-0" />
      </view>
      <view class="h-2 overflow-hidden rounded-full bg-white/10">
        <view
          class="h-full rounded-full transition-[width] duration-500"
          :style="{ width: `${animatedSavingsPercent}%`, background: theme.accentGradientCss }"
        />
      </view>
      <view class="flex flex-row items-center justify-between">
        <text class="text-xs text-zinc-400">{{ formatCurrency(store.totalSavings) }} risparmiati</text>
        <text class="text-xs font-medium" :style="{ color: theme.accentColor }">
          {{ Math.round(animatedSavingsPercent) }}%
        </text>
      </view>
    </view>

    <view
      class="flex flex-row items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition-transform active:scale-[0.98] active:bg-white/5 animate-fade-in-up"
      style="animation-delay: 160ms"
      @tap="emit('navigate', 'ricorrenti')"
    >
      <view class="flex min-w-0 flex-row items-center gap-2">
        <VyIcon name="i-lucide-repeat" :color="ICON_COLOR.zinc300" class="size-5 shrink-0" />
        <view class="flex min-w-0 flex-col">
          <text class="truncate text-sm font-medium text-white">Spese Ricorrenti</text>
          <text class="truncate text-xs text-zinc-500">{{ store.recurringExpenses.length }} attive</text>
        </view>
      </view>
      <view class="flex shrink-0 flex-row items-center gap-2">
        <text class="text-sm font-medium text-white">{{ formatCurrency(animatedRecurringTotal) }}/mese</text>
        <VyIcon name="i-lucide-chevron-right" :color="ICON_COLOR.zinc500" class="size-4" />
      </view>
    </view>

    <view class="flex flex-col gap-1 animate-fade-in-up" style="animation-delay: 200ms">
      <view class="flex flex-row items-center justify-between px-1">
        <text class="text-sm font-medium text-white">Ultimi movimenti</text>
        <text class="text-xs" :style="{ color: theme.accentColor }" @tap="emit('navigate', 'transazioni')">
          Vedi tutti
        </text>
      </view>
      <view class="rounded-2xl border border-zinc-800 bg-zinc-900">
        <TransactionRow v-for="t in recent" :key="t.id" :transaction="t" />
        <view v-if="recent.length === 0" class="px-4 py-6">
          <text class="text-center text-sm text-zinc-500">Nessun movimento ancora</text>
        </view>
      </view>
    </view>
  </view>
</template>
