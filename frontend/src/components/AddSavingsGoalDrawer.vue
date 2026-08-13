<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { VyDrawer } from '@vyui/kit/drawer'
import { VyButton } from '@vyui/kit/button'
import { VyInput } from '@vyui/kit/input'

import { useFinanceStore } from '../stores/finance'

const open = defineModel<boolean>('open', { default: false })
const store = useFinanceStore()

const name = ref('')
const target = ref('')

watch(open, (isOpen) => {
  if (isOpen) {
    name.value = ''
    target.value = ''
  }
})

const canSave = computed(() => {
  const value = Number.parseFloat(target.value.replace(',', '.'))
  return name.value.trim().length > 0 && Number.isFinite(value) && value > 0
})

function save() {
  if (!canSave.value) return
  store.addSavingsGoal({
    name: name.value.trim(),
    target: Number.parseFloat(target.value.replace(',', '.')),
  })
  open.value = false
}
</script>

<template>
  <VyDrawer v-model:open="open" side="bottom" title="Nuovo fondo" :snap-points="[0.55]">
    <template #body>
      <view class="flex flex-col gap-5 px-1 pb-2">
        <view class="flex flex-col gap-2">
          <text class="text-xs text-zinc-500">Nome</text>
          <VyInput v-model="name" placeholder="Es. Vacanze" />
        </view>
        <view class="flex flex-col gap-2">
          <text class="text-xs text-zinc-500">Obiettivo</text>
          <VyInput v-model="target" type="number" placeholder="0,00" />
        </view>
      </view>
    </template>
    <template #footer>
      <VyButton
        block
        size="lg"
        label="Crea fondo"
        :disabled="!canSave"
        class="transition-transform active:scale-[0.98]"
        @tap="save"
      />
    </template>
  </VyDrawer>
</template>
