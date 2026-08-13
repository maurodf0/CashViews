<script setup lang="ts">
import { VyIcon } from '@vyui/kit/icon'

import { ICON_COLOR } from '../../lib/colors'

const badges = [
  { icon: 'shield-check', label: 'Dati criptati' },
  { icon: 'lock', label: 'Accesso verificato' },
  { icon: 'eye-off', label: 'Nessuna pubblicità' },
]
</script>

<template>
  <view class="flex flex-col items-center gap-4">
    <view class="flex flex-col items-center gap-1">
      <text class="text-xl font-semibold text-white">CashViews</text>
      <text class="text-sm text-zinc-400">Le tue finanze, sempre sotto controllo</text>
    </view>

    <view class="flex flex-row items-center justify-center gap-x-4 gap-y-1.5">
      <view v-for="badge in badges" :key="badge.icon" class="flex flex-row items-center gap-1.5">
        <VyIcon :name="`i-lucide-${badge.icon}`" :color="ICON_COLOR.zinc400" class="size-3.5" />
        <text class="text-[11px] text-zinc-500">{{ badge.label }}</text>
      </view>
    </view>
  </view>
</template>
