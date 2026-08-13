<script setup lang="ts">
import { VyIcon } from '@vyui/kit/icon'

import type { Transaction } from '../types'
import { formatDate, formatSignedCurrency } from '../lib/format'
import { useFinanceStore } from '../stores/finance'

const props = defineProps<{ transaction: Transaction }>()
const emit = defineEmits<{ press: [] }>()

const store = useFinanceStore()
const category = store.categoryOf(props.transaction.categoryId)
</script>

<template>
  <view
    class="flex flex-row items-center gap-3 px-4 py-3 transition-colors active:bg-white/5"
    @tap="emit('press')"
  >
    <view
      class="flex size-10 shrink-0 items-center justify-center rounded-full"
      :style="{ backgroundColor: `${category.color}26` }"
    >
      <VyIcon :name="`i-lucide-${category.icon}`" :color="category.color" class="size-5" />
    </view>
    <view class="flex min-w-0 flex-1 flex-col">
      <text class="truncate text-[15px] text-white">{{ transaction.note || category.label }}</text>
      <text class="truncate text-xs text-zinc-500">{{ category.label }} · {{ formatDate(transaction.date) }}</text>
    </view>
    <text
      class="shrink-0 text-[15px] font-medium"
      :class="transaction.kind === 'entrata' ? 'text-emerald-400' : 'text-rose-400'"
    >
      {{ formatSignedCurrency(transaction.amount, transaction.kind) }}
    </text>
  </view>
</template>
