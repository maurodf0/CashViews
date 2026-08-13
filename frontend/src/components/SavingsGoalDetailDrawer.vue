<script setup lang="ts">
import { computed, ref } from 'vue'
import { VyDrawer } from '@vyui/kit/drawer'
import { VyIcon } from '@vyui/kit/icon'

import SavingsActionDrawer from './SavingsActionDrawer.vue'
import ConfirmModal from './ConfirmModal.vue'
import { useFinanceStore } from '../stores/finance'
import { useThemeStore } from '../stores/theme'
import { formatCurrency } from '../lib/format'
import { ICON_COLOR } from '../lib/colors'

const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{ goalId: string }>()
const emit = defineEmits<{ deleted: [] }>()

const store = useFinanceStore()
const theme = useThemeStore()

const goal = computed(() => store.savingsGoals.find((g) => g.id === props.goalId))
const percent = computed(() => (goal.value ? Math.round(store.savingsProgressOf(goal.value) * 100) : 0))
const remaining = computed(() => (goal.value ? Math.max(0, goal.value.target - goal.value.current) : 0))

const actionOpen = ref(false)
const actionMode = ref<'deposita' | 'preleva'>('deposita')
const confirmDeleteOpen = ref(false)

function openAction(mode: 'deposita' | 'preleva') {
  actionMode.value = mode
  actionOpen.value = true
}

async function confirmDelete() {
  if (!goal.value) return
  await store.removeSavingsGoal(goal.value.id)
  open.value = false
  emit('deleted')
}
</script>

<template>
  <VyDrawer v-model:open="open" side="bottom" :title="goal?.name ?? ''" :snap-points="[0.75]">
    <template #body>
      <view v-if="goal" class="flex flex-col gap-6 px-1 pb-2">
        <view class="flex flex-col items-center gap-2 py-2">
          <text class="text-[32px] font-semibold text-white">{{ formatCurrency(goal.current) }}</text>
          <view class="flex w-full flex-col gap-2">
            <view class="h-2 overflow-hidden rounded-full bg-white/10">
              <view
                class="h-full rounded-full transition-[width] duration-500"
                :style="{ width: `${percent}%`, background: theme.accentGradientCss }"
              />
            </view>
            <view class="flex flex-row items-center justify-between">
              <text class="text-xs text-zinc-400">{{ percent }}% dell'obiettivo</text>
              <text class="text-xs text-zinc-400">Obiettivo {{ formatCurrency(goal.target) }}</text>
            </view>
          </view>
        </view>

        <view class="flex flex-row gap-3">
          <view
            class="flex flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] py-3.5 transition-transform active:scale-[0.97] active:bg-white/10"
            @tap="openAction('deposita')"
          >
            <VyIcon name="i-lucide-arrow-down-to-line" :color="ICON_COLOR.emerald400" class="size-4" />
            <text class="text-sm font-medium text-white">Deposita</text>
          </view>
          <view
            class="flex flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] py-3.5 transition-transform active:scale-[0.97] active:bg-white/10"
            @tap="openAction('preleva')"
          >
            <VyIcon name="i-lucide-arrow-up-from-line" :color="ICON_COLOR.rose400" class="size-4" />
            <text class="text-sm font-medium text-white">Preleva</text>
          </view>
        </view>

        <view class="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <view class="flex flex-row items-center justify-between">
            <text class="text-sm text-zinc-400">Mancano</text>
            <text class="text-sm font-medium text-white">{{ formatCurrency(remaining) }}</text>
          </view>
        </view>

        <view
          class="flex flex-row items-center justify-center gap-2 py-2 transition-transform active:scale-95"
          @tap="confirmDeleteOpen = true"
        >
          <VyIcon name="i-lucide-trash-2" :color="ICON_COLOR.rose400" class="size-4" />
          <text class="text-sm font-medium text-rose-400">Elimina fondo</text>
        </view>
      </view>
    </template>
  </VyDrawer>

  <SavingsActionDrawer v-if="goal" v-model:open="actionOpen" :mode="actionMode" :goal-id="goal.id" />

  <ConfirmModal
    v-model:open="confirmDeleteOpen"
    title="Eliminare questo fondo?"
    description="I risparmi accumulati andranno persi. Questa azione non può essere annullata."
    confirm-label="Elimina"
    @confirm="confirmDelete"
  />
</template>
