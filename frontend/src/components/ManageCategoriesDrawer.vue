<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { VyDrawer } from '@vyui/kit/drawer'
import { VyButton } from '@vyui/kit/button'
import { VyInput } from '@vyui/kit/input'
import { VyIcon } from '@vyui/kit/icon'

import ConfirmModal from './ConfirmModal.vue'
import { useFinanceStore } from '../stores/finance'
import type { TransactionKind } from '../types'

const ICONS = [
  'tag',
  'wallet',
  'gift',
  'home',
  'car',
  'utensils',
  'popcorn',
  'heart-pulse',
  'shopping-bag',
  'plane',
  'graduation-cap',
  'dumbbell',
  'paw-print',
  'baby',
  'wrench',
  'briefcase',
  'coffee',
  'book-open',
  'gamepad-2',
  'circle-dot',
]
const COLORS = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#14b8a6', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#94a3b8']

const open = defineModel<boolean>('open', { default: false })
const store = useFinanceStore()

const formOpen = ref(false)
const kind = ref<TransactionKind>('uscita')
const label = ref('')
const icon = ref(ICONS[0])
const color = ref(COLORS[0])
const confirmDeleteId = ref<string | null>(null)

watch(open, (isOpen) => {
  if (!isOpen) formOpen.value = false
})

function resetForm() {
  kind.value = 'uscita'
  label.value = ''
  icon.value = ICONS[0]
  color.value = COLORS[0]
}

function openForm() {
  resetForm()
  formOpen.value = true
}

const canSave = computed(() => label.value.trim().length > 0)
const saving = ref(false)

async function save() {
  if (!canSave.value || saving.value) return
  saving.value = true
  try {
    await store.addCustomCategory({ label: label.value.trim(), kind: kind.value, icon: icon.value, color: color.value })
    formOpen.value = false
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  if (confirmDeleteId.value) await store.removeCustomCategory(confirmDeleteId.value)
  confirmDeleteId.value = null
}
</script>

<template>
  <VyDrawer v-model:open="open" side="bottom" title="Categorie" :snap-points="[0.85]">
    <template #body>
      <view class="flex flex-col gap-5 px-1 pb-2">
        <view v-if="!formOpen" class="flex flex-col gap-4">
          <view
            class="flex flex-row items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] py-3 transition-transform active:scale-[0.98]"
            @tap="openForm"
          >
            <VyIcon name="i-lucide-plus" color="#ffffff" class="size-4" />
            <text class="text-sm font-medium text-white">Nuova categoria</text>
          </view>

          <view class="flex flex-col gap-2">
            <text class="text-xs uppercase text-zinc-500">Predefinite</text>
            <view class="flex flex-row flex-wrap gap-2">
              <view
                v-for="c in store.builtInCategories"
                :key="c.id"
                class="flex flex-row items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5"
              >
                <VyIcon :name="`i-lucide-${c.icon}`" :color="c.color" class="size-4" />
                <text class="text-xs text-white">{{ c.label }}</text>
              </view>
            </view>
          </view>

          <view v-if="store.customCategories.length > 0" class="flex flex-col gap-2">
            <text class="text-xs uppercase text-zinc-500">Personalizzate</text>
            <view class="flex flex-col gap-2">
              <view
                v-for="c in store.customCategories"
                :key="c.id"
                class="flex flex-row items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 px-3 py-2.5"
              >
                <view class="flex flex-row items-center gap-2">
                  <VyIcon :name="`i-lucide-${c.icon}`" :color="c.color" class="size-4" />
                  <text class="text-xs text-white">{{ c.label }}</text>
                </view>
                <VyIcon
                  name="i-lucide-trash-2"
                  color="#fb7185"
                  class="size-4"
                  @tap="confirmDeleteId = c.id"
                />
              </view>
            </view>
          </view>
        </view>

        <view v-else class="flex flex-col gap-5">
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

          <view class="flex flex-col gap-2">
            <text class="text-xs text-zinc-500">Nome</text>
            <VyInput v-model="label" placeholder="Es. Regali di Natale" />
          </view>

          <view class="flex flex-col gap-2">
            <text class="text-xs text-zinc-500">Icona</text>
            <view class="flex flex-row flex-wrap gap-2">
              <view
                v-for="i in ICONS"
                :key="i"
                class="flex size-9 items-center justify-center rounded-full border transition-transform active:scale-90"
                :style="icon === i ? { borderColor: color, backgroundColor: `${color}26` } : { borderColor: 'rgba(255,255,255,0.12)' }"
                @tap="icon = i"
              >
                <VyIcon :name="`i-lucide-${i}`" :color="icon === i ? color : '#a1a1aa'" class="size-4" />
              </view>
            </view>
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
      </view>
    </template>
    <template #footer v-if="formOpen">
      <VyButton
        block
        size="lg"
        label="Salva categoria"
        :disabled="!canSave || saving"
        class="transition-transform active:scale-[0.98]"
        @tap="save"
      />
    </template>
  </VyDrawer>

  <ConfirmModal
    :open="confirmDeleteId !== null"
    title="Eliminare la categoria?"
    description="Le transazioni esistenti la manterranno come riferimento."
    confirm-label="Elimina"
    @update:open="(v) => { if (!v) confirmDeleteId = null }"
    @confirm="confirmDelete"
  />
</template>
