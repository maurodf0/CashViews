<script setup lang="ts">
import { computed } from 'vue'
import { VyIcon } from '@vyui/kit/icon'

import { useFinanceStore } from '../stores/finance'
import { formatCurrency } from '../lib/format'
import { dailyBuckets, categoryBreakdown } from '../lib/stats'

const CHART_HEIGHT = 120

const store = useFinanceStore()

const days = computed(() => dailyBuckets(store.transactions, 7))
const maxDayValue = computed(() =>
  Math.max(1, ...days.value.flatMap((d) => [d.entrata, d.uscita])),
)

function barHeight(value: number): number {
  return Math.max(value > 0 ? 3 : 0, (value / maxDayValue.value) * CHART_HEIGHT)
}

const categories = computed(() => categoryBreakdown(store.transactions))
const totalSpent = computed(() => categories.value.reduce((s, c) => s + c.amount, 0))
</script>

<template>
  <view class="flex flex-col gap-6 px-4 pb-8 pt-4">
    <text class="text-xl font-semibold text-white animate-fade-in-up">Statistiche</text>

    <view
      class="flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-5 animate-fade-in-up"
      style="animation-delay: 40ms"
    >
      <view class="flex flex-row items-center justify-between">
        <text class="text-sm font-medium text-white">Entrate e uscite</text>
        <view class="flex flex-row items-center gap-3">
          <view class="flex flex-row items-center gap-1.5">
            <view class="size-2 rounded-full bg-emerald-400" />
            <text class="text-xs text-zinc-400">Entrate</text>
          </view>
          <view class="flex flex-row items-center gap-1.5">
            <view class="size-2 rounded-full bg-rose-400" />
            <text class="text-xs text-zinc-400">Uscite</text>
          </view>
        </view>
      </view>

      <view class="flex flex-row items-end justify-between gap-1" :style="{ height: `${CHART_HEIGHT}px` }">
        <view v-for="day in days" :key="day.date" class="flex flex-1 flex-col items-center justify-end gap-1">
          <view class="flex flex-row items-end gap-1" :style="{ height: `${CHART_HEIGHT}px` }">
            <view
              class="w-2 rounded-t-sm bg-emerald-400 transition-[height] duration-500"
              :style="{ height: `${barHeight(day.entrata)}px` }"
            />
            <view
              class="w-2 rounded-t-sm bg-rose-400 transition-[height] duration-500"
              :style="{ height: `${barHeight(day.uscita)}px` }"
            />
          </view>
        </view>
      </view>
      <view class="flex flex-row items-start justify-between gap-1">
        <text v-for="day in days" :key="day.date" class="flex-1 text-center text-[10px] capitalize text-zinc-500">
          {{ day.label }}
        </text>
      </view>
    </view>

    <view
      class="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 animate-fade-in-up"
      style="animation-delay: 80ms"
    >
      <view class="flex flex-row items-center justify-between">
        <text class="text-sm font-medium text-white">Spese per categoria</text>
        <text class="text-sm text-zinc-400">{{ formatCurrency(totalSpent) }}</text>
      </view>

      <view v-if="categories.length === 0" class="items-center py-6">
        <text class="text-center text-sm text-zinc-500">Nessuna spesa registrata</text>
      </view>

      <view v-for="cat in categories" :key="cat.categoryId" class="flex flex-col gap-1.5">
        <view class="flex flex-row items-center justify-between">
          <view class="flex flex-row items-center gap-2">
            <VyIcon :name="`i-lucide-${cat.icon}`" :color="cat.color" class="size-4" />
            <text class="text-sm text-white">{{ cat.label }}</text>
          </view>
          <view class="flex flex-row items-center gap-2">
            <text class="text-xs text-zinc-500">{{ Math.round(cat.percent) }}%</text>
            <text class="text-sm font-medium text-white">{{ formatCurrency(cat.amount) }}</text>
          </view>
        </view>
        <view class="h-2 overflow-hidden rounded-full bg-white/5">
          <view
            class="h-full rounded-full transition-[width] duration-500"
            :style="{ width: `${cat.percent}%`, backgroundColor: cat.color }"
          />
        </view>
      </view>
    </view>
  </view>
</template>
