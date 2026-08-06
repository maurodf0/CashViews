<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { VyDrawer } from '@vyui/kit/drawer'
import { VyButton } from '@vyui/kit/button'
import { VyInput } from '@vyui/kit/input'

import { useFinanceStore } from '../stores/finance'

const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{ mode: 'deposita' | 'preleva' }>()

const store = useFinanceStore()
const amount = ref('')

watch(open, (isOpen) => {
  if (isOpen) amount.value = ''
})

const canSave = computed(() => {
  const value = Number.parseFloat(amount.value.replace(',', '.'))
  return Number.isFinite(value) && value > 0
})

function confirm() {
  if (!canSave.value) return
  const value = Number.parseFloat(amount.value.replace(',', '.'))
  if (props.mode === 'deposita') {
    store.depositToSavings(value)
  } else {
    store.withdrawFromSavings(value)
  }
  open.value = false
}
</script>

<template>
  <VyDrawer
    v-model:open="open"
    side="bottom"
    :title="props.mode === 'deposita' ? 'Deposita nel fondo' : 'Preleva dal fondo'"
    :snap-points="[0.55]"
  >
    <template #body>
      <view class="flex flex-col items-center gap-1 px-1 py-4">
        <text class="text-xs text-zinc-500">Importo</text>
        <VyInput
          v-model="amount"
          type="number"
          placeholder="0,00"
          class="w-56"
          :ui="{ base: 'text-center text-2xl bg-transparent border-0' }"
        />
      </view>
    </template>
    <template #footer>
      <VyButton
        block
        size="lg"
        :color="props.mode === 'deposita' ? 'primary' : 'error'"
        :label="props.mode === 'deposita' ? 'Deposita' : 'Preleva'"
        :disabled="!canSave"
        class="transition-transform active:scale-[0.98]"
        @tap="confirm"
      />
    </template>
  </VyDrawer>
</template>
