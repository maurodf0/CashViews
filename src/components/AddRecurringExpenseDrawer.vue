<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { VyDrawer } from '@vyui/kit/drawer'
import { VyButton } from '@vyui/kit/button'
import { VyInput } from '@vyui/kit/input'

import type { BillingCycle } from '../types'
import { useFinanceStore } from '../stores/finance'

const open = defineModel<boolean>('open', { default: false })
const store = useFinanceStore()

const ICONS = ['tv', 'music', 'cloud', 'dumbbell', 'package', 'gamepad-2', 'newspaper', 'repeat']
const COLORS = ['#ef4444', '#22c55e', '#60a5fa', '#fb923c', '#a78bfa', '#f472b6', '#facc15']

const name = ref('')
const amount = ref('')
const cycle = ref<BillingCycle>('mensile')
const daysUntilBilling = ref('30')
const icon = ref(ICONS[0])
const color = ref(COLORS[0])

watch(open, (isOpen) => {
  if (isOpen) {
    name.value = ''
    amount.value = ''
    cycle.value = 'mensile'
    daysUntilBilling.value = '30'
    icon.value = ICONS[0]
    color.value = COLORS[0]
  }
})

const canSave = computed(() => {
  const value = Number.parseFloat(amount.value.replace(',', '.'))
  return name.value.trim().length > 0 && Number.isFinite(value) && value > 0
})

function save() {
  if (!canSave.value) return
  const value = Number.parseFloat(amount.value.replace(',', '.'))
  const days = Number.parseInt(daysUntilBilling.value, 10) || 0
  const next = new Date()
  next.setDate(next.getDate() + days)
  store.addSubscription({
    name: name.value.trim(),
    amount: value,
    cycle: cycle.value,
    nextBillingDate: next.toISOString().slice(0, 10),
    icon: icon.value,
    color: color.value,
  })
  open.value = false
}
</script>

<template>
  <VyDrawer v-model:open="open" side="bottom" title="Nuovo abbonamento" :snap-points="[0.85]">
    <template #body>
      <view class="flex flex-col gap-5 px-1 pb-2">
        <view class="flex flex-col gap-2">
          <text class="text-xs text-zinc-500">Nome</text>
          <VyInput v-model="name" placeholder="Es. Netflix" />
        </view>

        <view class="flex flex-col gap-2">
          <text class="text-xs text-zinc-500">Importo</text>
          <VyInput v-model="amount" type="number" placeholder="0,00" />
        </view>

        <view class="flex flex-col gap-2">
          <text class="text-xs text-zinc-500">Ricorrenza</text>
          <view class="flex flex-row gap-2 rounded-xl bg-white/5 p-1">
            <view
              class="flex-1 rounded-lg py-2 text-center transition-colors duration-200"
              :class="cycle === 'mensile' ? 'bg-white/10' : ''"
              @tap="cycle = 'mensile'"
            >
              <text class="text-sm font-medium" :class="cycle === 'mensile' ? 'text-white' : 'text-zinc-500'">
                Mensile
              </text>
            </view>
            <view
              class="flex-1 rounded-lg py-2 text-center transition-colors duration-200"
              :class="cycle === 'annuale' ? 'bg-white/10' : ''"
              @tap="cycle = 'annuale'"
            >
              <text class="text-sm font-medium" :class="cycle === 'annuale' ? 'text-white' : 'text-zinc-500'">
                Annuale
              </text>
            </view>
          </view>
        </view>

        <view class="flex flex-col gap-2">
          <text class="text-xs text-zinc-500">Prossimo addebito tra (giorni)</text>
          <VyInput v-model="daysUntilBilling" type="number" placeholder="30" />
        </view>

        <view class="flex flex-col gap-2">
          <text class="text-xs text-zinc-500">Colore</text>
          <view class="flex flex-row flex-wrap gap-2">
            <view
              v-for="c in COLORS"
              :key="c"
              class="size-8 rounded-full border-2 transition-transform duration-150 active:scale-90"
              :class="color === c ? 'scale-110' : ''"
              :style="{ backgroundColor: c, borderColor: color === c ? '#fff' : 'transparent' }"
              @tap="color = c"
            />
          </view>
        </view>
      </view>
    </template>
    <template #footer>
      <VyButton
        block
        size="lg"
        label="Salva"
        :disabled="!canSave"
        class="transition-transform active:scale-[0.98]"
        @tap="save"
      />
    </template>
  </VyDrawer>
</template>
