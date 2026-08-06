<script setup lang="ts">
import { ref } from 'vue'
import { VyIcon } from '@vyui/kit/icon'

import AddSubscriptionDrawer from '../components/AddSubscriptionDrawer.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import { useFinanceStore } from '../stores/finance'
import { formatCurrency, formatDateFull, daysUntil } from '../lib/format'
import { ACCENT_GRADIENT, ICON_COLOR } from '../lib/colors'

const store = useFinanceStore()
const addOpen = ref(false)
const confirmDeleteId = ref<string | null>(null)

function confirmDelete() {
  if (confirmDeleteId.value) store.removeSubscription(confirmDeleteId.value)
}
</script>

<template>
  <view class="flex flex-col gap-4 px-4 pb-8 pt-4">
    <view class="flex flex-row items-center justify-between animate-fade-in-up">
      <text class="text-xl font-semibold text-white">Abbonamenti</text>
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
      <text class="text-2xl font-semibold text-white">{{ formatCurrency(store.monthlySubscriptionsTotal) }}</text>
      <text class="text-xs text-zinc-500">{{ store.subscriptions.length }} abbonamenti attivi</text>
    </view>

    <view v-if="store.sortedSubscriptions.length === 0" class="items-center py-12 animate-fade-in">
      <text class="text-center text-sm text-zinc-500">Nessun abbonamento ancora</text>
    </view>

    <view class="flex flex-col gap-2">
      <view
        v-for="(s, index) in store.sortedSubscriptions"
        :key="s.id"
        class="flex flex-row items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 transition-colors active:bg-white/5 animate-fade-in-up"
        :style="{ animationDelay: `${80 + index * 40}ms` }"
        @tap="confirmDeleteId = s.id"
      >
        <view
          class="flex size-11 shrink-0 items-center justify-center rounded-full"
          :style="{ backgroundColor: `${s.color}26` }"
        >
          <VyIcon :name="`i-lucide-${s.icon}`" :color="s.color" class="size-5" />
        </view>
        <view class="flex min-w-0 flex-1 flex-col">
          <text class="truncate text-[15px] text-white">{{ s.name }}</text>
          <text class="truncate text-xs text-zinc-500">
            Tra {{ daysUntil(s.nextBillingDate) }} giorni · {{ formatDateFull(s.nextBillingDate) }}
          </text>
        </view>
        <view class="flex shrink-0 flex-col items-end">
          <text class="text-[15px] font-medium text-white">{{ formatCurrency(s.amount) }}</text>
          <text class="text-xs text-zinc-500">{{ s.cycle }}</text>
        </view>
      </view>
    </view>

    <AddSubscriptionDrawer v-model:open="addOpen" />

    <ConfirmModal
      :open="confirmDeleteId !== null"
      title="Rimuovere l'abbonamento?"
      description="Puoi aggiungerlo di nuovo in qualsiasi momento."
      confirm-label="Rimuovi"
      @update:open="(v) => { if (!v) confirmDeleteId = null }"
      @confirm="confirmDelete"
    />
  </view>
</template>
