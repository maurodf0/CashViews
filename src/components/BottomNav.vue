<script setup lang="ts">
import { VyIcon } from '@vyui/kit/icon'
import { ICON_COLOR } from '../lib/colors'
import { useThemeStore } from '../stores/theme'

export type TabId = 'home' | 'transazioni' | 'statistiche' | 'ricorrenti' | 'risparmi'

const props = defineProps<{ active: TabId }>()
const emit = defineEmits<{ change: [TabId] }>()

const theme = useThemeStore()

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: 'i-lucide-house' },
  { id: 'transazioni', label: 'Movimenti', icon: 'i-lucide-arrow-left-right' },
  { id: 'statistiche', label: 'Statistiche', icon: 'i-lucide-bar-chart-3' },
  { id: 'ricorrenti', label: 'Ricorrenti', icon: 'i-lucide-repeat' },
  { id: 'risparmi', label: 'Risparmi', icon: 'i-lucide-piggy-bank' },
]
</script>

<template>
  <view
    class="flex flex-row items-stretch border-t border-zinc-800 bg-zinc-950 pb-safe"
    style="padding-bottom: env(safe-area-inset-bottom, 0px)"
  >
    <view
      v-for="tab in tabs"
      :key="tab.id"
      class="flex flex-1 flex-col items-center gap-1 py-2.5 transition-transform active:scale-90"
      @tap="emit('change', tab.id)"
    >
      <VyIcon
        :name="tab.icon"
        :color="props.active === tab.id ? theme.accentColor : ICON_COLOR.zinc500"
        class="size-6"
      />
      <text
        class="text-[10px] transition-colors duration-200"
        :class="props.active === tab.id ? 'font-medium' : 'text-zinc-500'"
        :style="props.active === tab.id ? { color: theme.accentColor } : undefined"
      >
        {{ tab.label }}
      </text>
    </view>
  </view>
</template>
