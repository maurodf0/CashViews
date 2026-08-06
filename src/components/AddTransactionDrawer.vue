<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { VyDrawer } from '@vyui/kit/drawer'
import { VyButton } from '@vyui/kit/button'
import { VyInput } from '@vyui/kit/input'
import { VyIcon } from '@vyui/kit/icon'

import type { TransactionKind } from '../types'
import { CATEGORIES } from '../lib/categories'
import { useFinanceStore } from '../stores/finance'

const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{ initialKind?: TransactionKind }>()

const store = useFinanceStore()

const kind = ref<TransactionKind>(props.initialKind ?? 'uscita')
const amount = ref('')
const note = ref('')
const categoryId = ref(CATEGORIES.find((c) => c.kind === kind.value)!.id)

watch(open, (isOpen) => {
  if (isOpen) {
    kind.value = props.initialKind ?? 'uscita'
    amount.value = ''
    note.value = ''
    categoryId.value = CATEGORIES.find((c) => c.kind === kind.value)!.id
  }
})

watch(kind, (newKind) => {
  const stillValid = CATEGORIES.some((c) => c.id === categoryId.value && c.kind === newKind)
  if (!stillValid) {
    categoryId.value = CATEGORIES.find((c) => c.kind === newKind)!.id
  }
})

const categoriesForKind = computed(() => CATEGORIES.filter((c) => c.kind === kind.value))

const canSave = computed(() => {
  const value = Number.parseFloat(amount.value.replace(',', '.'))
  return Number.isFinite(value) && value > 0
})

function save() {
  if (!canSave.value) return
  const value = Number.parseFloat(amount.value.replace(',', '.'))
  store.addTransaction({
    kind: kind.value,
    amount: value,
    categoryId: categoryId.value,
    note: note.value.trim(),
    date: new Date().toISOString().slice(0, 10),
  })
  open.value = false
}
</script>

<template>
  <VyDrawer v-model:open="open" side="bottom" title="Nuovo movimento" :snap-points="[0.85]">
    <template #body>
      <view class="flex flex-col gap-5 px-1 pb-2">
        <view class="flex flex-row gap-2 rounded-xl bg-white/5 p-1">
          <view
            class="flex-1 rounded-lg py-2 text-center transition-colors duration-200"
            :class="kind === 'uscita' ? 'bg-white/10' : ''"
            @tap="kind = 'uscita'"
          >
            <text class="text-sm font-medium" :class="kind === 'uscita' ? 'text-white' : 'text-zinc-500'">
              Uscita
            </text>
          </view>
          <view
            class="flex-1 rounded-lg py-2 text-center transition-colors duration-200"
            :class="kind === 'entrata' ? 'bg-white/10' : ''"
            @tap="kind = 'entrata'"
          >
            <text class="text-sm font-medium" :class="kind === 'entrata' ? 'text-emerald-400' : 'text-zinc-500'">
              Entrata
            </text>
          </view>
        </view>

        <view class="flex flex-col items-center gap-1 py-2">
          <text class="text-xs text-zinc-500">Importo</text>
          <VyInput
            v-model="amount"
            type="number"
            placeholder="0,00"
            class="w-56"
            :ui="{ base: 'text-center text-2xl bg-transparent border-0' }"
          />
        </view>

        <view class="flex flex-col gap-2">
          <text class="text-xs text-zinc-500">Categoria</text>
          <view class="flex flex-row flex-wrap gap-2">
            <view
              v-for="c in categoriesForKind"
              :key="c.id"
              class="flex flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 transition-all duration-150 active:scale-95"
              :style="
                categoryId === c.id
                  ? { backgroundColor: `${c.color}26`, borderColor: c.color }
                  : { borderColor: 'rgba(255,255,255,0.12)' }
              "
              @tap="categoryId = c.id"
            >
              <VyIcon :name="`i-lucide-${c.icon}`" :color="c.color" class="size-4" />
              <text class="text-xs text-white">{{ c.label }}</text>
            </view>
          </view>
        </view>

        <view class="flex flex-col gap-2">
          <text class="text-xs text-zinc-500">Nota (opzionale)</text>
          <VyInput v-model="note" placeholder="Es. Cena con amici" />
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
