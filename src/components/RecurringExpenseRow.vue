<script setup lang="ts">
import { computed } from 'vue'
import { VyIcon } from '@vyui/kit/icon'
import { VySwipeAction } from '@vyui/kit/swipe-action'

import type { RecurringExpense } from '../types'
import { formatCurrency, formatDateFull, daysUntil } from '../lib/format'
import { ICON_COLOR } from '../lib/colors'
import { RECURRING_TYPE_META } from '../lib/recurring'
import { useFinanceStore } from '../stores/finance'

const props = defineProps<{ expense: RecurringExpense }>()
const emit = defineEmits<{ delete: [] }>()

const store = useFinanceStore()
const typeLabel = computed(() => RECURRING_TYPE_META[props.expense.type].label)
const remainingBalance = computed(() =>
  props.expense.type === 'mutuo' ? store.mortgageRemainingBalance(props.expense) : null,
)
</script>

<template>
  <VySwipeAction :action-width="88" :row-width="360" side="right">
    <template #default="{ close }">
      <view
        class="flex flex-row items-center gap-3 bg-zinc-900 p-4 transition-colors active:bg-white/5"
        @tap="close"
      >
        <view
          class="flex size-11 shrink-0 items-center justify-center rounded-full"
          :style="{ backgroundColor: `${expense.color}26` }"
        >
          <VyIcon :name="`i-lucide-${expense.icon}`" :color="expense.color" class="size-5" />
        </view>
        <view class="flex min-w-0 flex-1 flex-col">
          <text class="truncate text-[15px] text-white">{{ expense.name }}</text>
          <text v-if="remainingBalance !== null" class="truncate text-xs text-zinc-500">
            {{ typeLabel }} · residuo {{ formatCurrency(remainingBalance) }}
          </text>
          <text v-else class="truncate text-xs text-zinc-500">
            {{ typeLabel }} · tra {{ daysUntil(expense.nextBillingDate) }}g · {{ formatDateFull(expense.nextBillingDate) }}
          </text>
        </view>
        <view class="flex shrink-0 flex-col items-end">
          <text class="text-[15px] font-medium text-white">{{ formatCurrency(expense.amount) }}</text>
          <text class="text-xs text-zinc-500">al mese</text>
        </view>
      </view>
    </template>
    <template #actions="{ close }">
      <view
        class="flex h-full w-[88px] items-center justify-center bg-rose-500 active:bg-rose-600"
        @tap="
          () => {
            close()
            emit('delete')
          }
        "
      >
        <VyIcon name="i-lucide-trash-2" :color="ICON_COLOR.white" class="size-5" />
      </view>
    </template>
  </VySwipeAction>
</template>
