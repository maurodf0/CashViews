<script setup lang="ts">
import { VyIcon } from '@vyui/kit/icon'

import { ICON_COLOR } from '../../lib/colors'

const providers = [
  { id: 'google', icon: 'chrome', label: 'Google' },
  { id: 'apple', icon: 'apple', label: 'Apple' },
]
</script>

<template>
  <view class="flex flex-col gap-3">
    <view class="flex flex-row gap-3">
      <view
        v-for="p in providers"
        :key="p.id"
        class="flex flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-3 opacity-50"
      >
        <VyIcon :name="`i-lucide-${p.icon}`" :color="ICON_COLOR.zinc300" class="size-4" />
        <text class="text-sm font-medium text-zinc-300">{{ p.label }}</text>
      </view>
    </view>
    <text class="text-center text-[11px] text-zinc-600">Accesso social presto disponibile</text>

    <view class="flex flex-row items-center gap-3">
      <view class="h-px flex-1 bg-white/10" />
      <text class="text-[11px] uppercase tracking-wide text-zinc-600">oppure con l'email</text>
      <view class="h-px flex-1 bg-white/10" />
    </view>
  </view>
</template>
