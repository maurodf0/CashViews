<script setup lang="ts">
import { computed, ref } from 'vue'
import { VyIcon } from '@vyui/kit/icon'

import AddRecurringExpenseDrawer from '../components/AddRecurringExpenseDrawer.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import RecurringExpenseRow from '../components/RecurringExpenseRow.vue'
import { useFinanceStore } from '../stores/finance'
import { formatCurrency } from '../lib/format'
import { ACCENT_GRADIENT, ICON_COLOR } from '../lib/colors'
import { RECURRING_TYPE_META, RECURRING_TYPES } from '../lib/recurring'
import { useCountUp } from '../composables/useCountUp'
import type { RecurringExpenseType } from '../types'

const store = useFinanceStore()
const addOpen = ref(false)
const confirmDeleteId = ref<string | null>(null)
const filter = ref<'tutti' | RecurringExpenseType>('tutti')

function confirmDelete() {
  if (confirmDeleteId.value) store.removeRecurringExpense(confirmDeleteId.value)
}

const animatedMonthlyTotal = useCountUp(computed(() => store.monthlyRecurringTotal))

const filtered = computed(() => {
  if (filter.value === 'tutti') return store.sortedRecurringExpenses
  return store.sortedRecurringExpenses.filter((e) => e.type === filter.value)
})

const filters: { id: 'tutti' | RecurringExpenseType; label: string }[] = [
  { id: 'tutti', label: 'Tutti' },
  ...RECURRING_TYPES.map((t) => ({ id: t, label: RECURRING_TYPE_META[t].label })),
]
</script>

<template>
  <view class="flex flex-col gap-4 px-4 pb-8 pt-4">
    <view class="flex flex-row items-center justify-between animate-fade-in-up">
      <text class="text-xl font-semibold text-white">Spese Ricorrenti</text>
      <view
        class="flex size-9 items-center justify-center rounded-full transition-transform active:scale-90"
        :style="{ background: ACCENT_GRADIENT }"
        @tap="addOpen = true"
      >
        <VyIcon name="i-lucide-plus" :color="ICON_COLOR.white" class="size-5" />
      </view>
    </view>

    <view
      class="flex flex-col gap-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 animate-fade-in-up"
      style="animation-delay: 40ms"
    >
      <text class="text-xs text-zinc-500">Totale mensile</text>
      <text class="text-2xl font-semibold text-white">{{ formatCurrency(animatedMonthlyTotal) }}</text>
      <text class="text-xs text-zinc-500">{{ store.recurringExpenses.length }} spese attive</text>
    </view>

    <view class="flex flex-row gap-2 animate-fade-in-up" style="animation-delay: 60ms">
      <view
        v-for="f in filters"
        :key="f.id"
        class="rounded-full px-3.5 py-1.5 transition-colors active:scale-95"
        :class="filter === f.id ? 'bg-white/15' : 'bg-white/5'"
        @tap="filter = f.id"
      >
        <text class="text-xs font-medium" :class="filter === f.id ? 'text-white' : 'text-zinc-500'">
          {{ f.label }}
        </text>
      </view>
    </view>

    <view v-if="filtered.length === 0" class="items-center py-12 animate-fade-in">
      <text class="text-center text-sm text-zinc-500">Nessuna spesa ricorrente qui</text>
    </view>

    <view class="flex flex-col gap-2">
      <view
        v-for="(e, index) in filtered"
        :key="e.id"
        class="rounded-2xl border border-zinc-800 bg-zinc-900 animate-fade-in-up"
        :style="{ animationDelay: `${100 + index * 40}ms` }"
      >
        <RecurringExpenseRow :expense="e" @press="confirmDeleteId = e.id" />
      </view>
    </view>

    <AddRecurringExpenseDrawer v-model:open="addOpen" />

    <ConfirmModal
      :open="confirmDeleteId !== null"
      title="Rimuovere questa spesa ricorrente?"
      description="Puoi aggiungerla di nuovo in qualsiasi momento."
      confirm-label="Rimuovi"
      @update:open="(v) => { if (!v) confirmDeleteId = null }"
      @confirm="confirmDelete"
    />
  </view>
</template>
