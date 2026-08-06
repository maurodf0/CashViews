<script setup lang="ts">
import { VyIcon } from '@vyui/kit/icon'
import { VySwipeAction } from '@vyui/kit/swipe-action'

import type { Transaction } from '../types'
import { getCategory } from '../lib/categories'
import { formatDate, formatSignedCurrency } from '../lib/format'
import { ICON_COLOR } from '../lib/colors'

const props = withDefaults(defineProps<{ transaction: Transaction; swipeable?: boolean }>(), {
  swipeable: false,
})
const emit = defineEmits<{ delete: [] }>()

const category = getCategory(props.transaction.categoryId)
</script>

<template>
  <VySwipeAction :action-width="88" :row-width="360" :disabled="!swipeable" side="right">
    <template #default="{ close }">
      <view
        class="flex flex-row items-center gap-3 bg-zinc-900 px-4 py-3 transition-colors active:bg-white/5"
        @tap="close"
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
