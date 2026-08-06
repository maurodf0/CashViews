<script setup lang="ts">
import { VyIcon } from '@vyui/kit/icon'
import { ICON_COLOR } from '../lib/colors'

export type TabId = 'home' | 'transazioni' | 'abbonamenti' | 'risparmi'

const props = defineProps<{ active: TabId }>()
const emit = defineEmits<{ change: [TabId] }>()

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: 'i-lucide-house' },
  { id: 'transazioni', label: 'Movimenti', icon: 'i-lucide-arrow-left-right' },
  { id: 'abbonamenti', label: 'Abbonamenti', icon: 'i-lucide-repeat' },
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
        :color="props.active === tab.id ? ICON_COLOR.teal : ICON_COLOR.zinc500"
        class="size-6"
      />
      <text
        class="text-[10px] transition-colors duration-200"
        :class="props.active === tab.id ? 'font-medium text-teal-400' : 'text-zinc-500'"
      >
        {{ tab.label }}
      </text>
    </view>
  </view>
</template>
