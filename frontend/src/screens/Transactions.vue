<script setup lang="ts">
import { computed, ref } from 'vue'
import { VyIcon } from '@vyui/kit/icon'

import TransactionRow from '../components/TransactionRow.vue'
import AddTransactionDrawer from '../components/AddTransactionDrawer.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { useFinanceStore } from '../stores/finance'
import { formatDateFull } from '../lib/format'
import { ACCENT_GRADIENT, ICON_COLOR } from '../lib/colors'
import type { TransactionKind } from '../types'

const store = useFinanceStore()

const addOpen = ref(false)
const filter = ref<'tutti' | TransactionKind>('tutti')
const confirmDeleteId = ref<string | null>(null)

function confirmDelete() {
  if (confirmDeleteId.value) store.removeTransaction(confirmDeleteId.value)
}

const filtered = computed(() => {
  if (filter.value === 'tutti') return store.sortedTransactions
  return store.sortedTransactions.filter((t) => t.kind === filter.value)
})

const groups = computed(() => {
  const map = new Map<string, typeof filtered.value>()
  for (const t of filtered.value) {
    const list = map.get(t.date) ?? []
    list.push(t)
    map.set(t.date, list)
  }
  return [...map.entries()].map(([date, items]) => ({ date, items }))
})

const filters: { id: 'tutti' | TransactionKind; label: string }[] = [
  { id: 'tutti', label: 'Tutti' },
  { id: 'entrata', label: 'Entrate' },
  { id: 'uscita', label: 'Uscite' },
]
</script>

<template>
  <view class="flex flex-col gap-4 px-4 pb-8 pt-4">
    <view class="flex flex-row items-center justify-between animate-fade-in-up">
      <text class="text-xl font-semibold text-white">Movimenti</text>
      <view
        class="flex size-9 items-center justify-center rounded-full transition-transform active:scale-90"
        :style="{ background: ACCENT_GRADIENT }"
        @tap="addOpen = true"
      >
        <VyIcon name="i-lucide-plus" :color="ICON_COLOR.white" class="size-5" />
      </view>
    </view>

    <view class="flex flex-row gap-2 animate-fade-in-up" style="animation-delay: 40ms">
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

    <view v-if="groups.length === 0" class="items-center py-12 animate-fade-in">
      <text class="text-center text-sm text-zinc-500">Nessun movimento trovato</text>
    </view>

    <view
      v-for="(group, groupIndex) in groups"
      :key="group.date"
      class="flex flex-col gap-1 animate-fade-in-up"
      :style="{ animationDelay: `${80 + groupIndex * 40}ms` }"
    >
      <text class="px-1 text-xs font-medium uppercase text-zinc-500">{{ formatDateFull(group.date) }}</text>
      <view class="rounded-2xl border border-zinc-800 bg-zinc-900">
        <TransactionRow
          v-for="t in group.items"
          :key="t.id"
          :transaction="t"
          @press="confirmDeleteId = t.id"
        />
      </view>
    </view>

    <AddTransactionDrawer v-model:open="addOpen" />

    <ConfirmModal
      :open="confirmDeleteId !== null"
      title="Eliminare il movimento?"
      description="Questa azione non può essere annullata."
      confirm-label="Elimina"
      @update:open="(v) => { if (!v) confirmDeleteId = null }"
      @confirm="confirmDelete"
    />
  </view>
</template>
