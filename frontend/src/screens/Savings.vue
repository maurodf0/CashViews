<script setup lang="ts">
import { ref } from 'vue'
import { VyIcon } from '@vyui/kit/icon'

import AddSavingsGoalDrawer from '../components/AddSavingsGoalDrawer.vue'
import SavingsGoalDetailDrawer from '../components/SavingsGoalDetailDrawer.vue'
import GlassCard from '../components/GlassCard.vue'
import { useFinanceStore } from '../stores/finance'
import { useThemeStore } from '../stores/theme'
import { formatCurrency } from '../lib/format'
import { ICON_COLOR } from '../lib/colors'

const store = useFinanceStore()
const theme = useThemeStore()

const addOpen = ref(false)
const selectedGoalId = ref<string | null>(null)

function openGoal(id: string) {
  selectedGoalId.value = id
}
</script>

<template>
  <view class="flex flex-col gap-4 px-4 pb-8 pt-4">
    <view class="flex flex-row items-center justify-between animate-fade-in-up">
      <text class="text-xl font-semibold text-white">Fondi Risparmio</text>
      <view
        class="flex size-9 items-center justify-center rounded-full transition-transform active:scale-90"
        :style="{ background: theme.accentGradientCss }"
        @tap="addOpen = true"
      >
        <VyIcon name="i-lucide-plus" :color="ICON_COLOR.white" class="size-5" />
      </view>
    </view>

    <view v-if="store.savingsGoals.length === 0" class="items-center py-12 animate-fade-in">
      <text class="text-center text-sm text-zinc-500">Nessun fondo ancora — creane uno per iniziare</text>
    </view>

    <GlassCard
      v-for="(goal, index) in store.savingsGoals"
      :key="goal.id"
      class="flex flex-col gap-3 p-4 animate-fade-in-up transition-transform active:scale-[0.98]"
      :style="{ animationDelay: `${40 + index * 40}ms` }"
      :glow="index === 0"
      @tap="openGoal(goal.id)"
    >
      <view class="flex flex-row items-center justify-between">
        <view class="flex min-w-0 flex-row items-center gap-2">
          <VyIcon name="i-lucide-piggy-bank" :color="theme.accentColor" class="size-5 shrink-0" />
          <text class="truncate text-sm font-medium text-white">{{ goal.name }}</text>
        </view>
        <VyIcon name="i-lucide-chevron-right" :color="ICON_COLOR.zinc500" class="size-4 shrink-0" />
      </view>
      <text class="text-2xl font-semibold text-white">{{ formatCurrency(goal.current) }}</text>
      <view class="h-2 overflow-hidden rounded-full bg-white/10">
        <view
          class="h-full rounded-full transition-[width] duration-500"
          :style="{ width: `${Math.round(store.savingsProgressOf(goal) * 100)}%`, background: theme.accentGradientCss }"
        />
      </view>
      <text class="text-xs text-zinc-400">
        {{ Math.round(store.savingsProgressOf(goal) * 100) }}% di {{ formatCurrency(goal.target) }}
      </text>
    </GlassCard>

    <AddSavingsGoalDrawer v-model:open="addOpen" />

    <SavingsGoalDetailDrawer
      v-if="selectedGoalId"
      :open="selectedGoalId !== null"
      :goal-id="selectedGoalId"
      @update:open="(v) => { if (!v) selectedGoalId = null }"
      @deleted="selectedGoalId = null"
    />
  </view>
</template>
