<script setup lang="ts">
import { computed, ref } from 'vue'
import { VyIcon } from '@vyui/kit/icon'
import { VyProgress } from '@vyui/kit/progress'

import TransactionRow from '../components/TransactionRow.vue'
import AddTransactionDrawer from '../components/AddTransactionDrawer.vue'
import { useFinanceStore } from '../stores/finance'
import { formatCurrency } from '../lib/format'
import { ICON_COLOR } from '../lib/colors'
import { useCountUp } from '../composables/useCountUp'
import GlowOrb from '../components/GlowOrb.vue'
import type { TransactionKind } from '../types'

const emit = defineEmits<{ navigate: ['transazioni' | 'ricorrenti' | 'risparmi'] }>()

const store = useFinanceStore()

const addOpen = ref(false)
const addKind = ref<TransactionKind>('uscita')

function openAdd(kind: TransactionKind) {
  addKind.value = kind
  addOpen.value = true
}

const recent = computed(() => store.sortedTransactions.slice(0, 5))
const savingsPercent = computed(() => Math.round(store.savingsProgress * 100))

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
      <view class="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/10">
        <VyIcon name="i-lucide-user" :color="ICON_COLOR.white" class="size-5" />
      </view>
    </view>

    <view
      class="relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-5 animate-fade-in-up"
      style="animation-delay: 40ms"
    >
      <GlowOrb class="-right-10 -top-16 size-48 opacity-50" />
      <GlowOrb class="-bottom-16 -left-10 size-40 opacity-30" />
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
    </view>

    <view class="flex flex-row gap-3 animate-fade-in-up" style="animation-delay: 80ms">
      <view
        class="flex flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] py-3.5 transition-transform active:scale-[0.97] active:bg-white/10"
        @tap="openAdd('entrata')"
      >
        <VyIcon name="i-lucide-plus" :color="ICON_COLOR.emerald400" class="size-4" />
        <text class="text-sm font-medium text-white">Entrata</text>
      </view>
      <view
        class="flex flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] py-3.5 transition-transform active:scale-[0.97] active:bg-white/10"
        @tap="openAdd('uscita')"
      >
        <VyIcon name="i-lucide-minus" :color="ICON_COLOR.rose400" class="size-4" />
        <text class="text-sm font-medium text-white">Uscita</text>
      </view>
    </view>

    <view
      class="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition-transform active:scale-[0.98] active:bg-white/5 animate-fade-in-up"
      style="animation-delay: 120ms"
      @tap="emit('navigate', 'risparmi')"
    >
      <view class="flex flex-row items-center justify-between">
        <view class="flex min-w-0 flex-row items-center gap-2">
          <VyIcon name="i-lucide-piggy-bank" :color="ICON_COLOR.teal" class="size-5 shrink-0" />
          <text class="truncate text-sm font-medium text-white">{{ store.savingsGoal.name }}</text>
        </view>
        <VyIcon name="i-lucide-chevron-right" :color="ICON_COLOR.zinc500" class="size-4 shrink-0" />
      </view>
      <VyProgress
        :model-value="animatedSavingsPercent"
        :max="100"
        size="md"
        :ui="{ indicator: 'bg-[linear-gradient(90deg,#0284c7,#0d9488)]' }"
      />
      <view class="flex flex-row items-center justify-between">
        <text class="text-xs text-zinc-400">
          {{ formatCurrency(store.savingsGoal.current) }} di {{ formatCurrency(store.savingsGoal.target) }}
        </text>
        <text class="text-xs font-medium text-teal-400">{{ Math.round(animatedSavingsPercent) }}%</text>
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
        <text class="text-xs text-teal-400" @tap="emit('navigate', 'transazioni')">Vedi tutti</text>
      </view>
      <view class="rounded-2xl border border-zinc-800 bg-zinc-900">
        <TransactionRow v-for="t in recent" :key="t.id" :transaction="t" />
        <view v-if="recent.length === 0" class="px-4 py-6">
          <text class="text-center text-sm text-zinc-500">Nessun movimento ancora</text>
        </view>
      </view>
    </view>

    <AddTransactionDrawer v-model:open="addOpen" :initial-kind="addKind" />
  </view>
</template>
