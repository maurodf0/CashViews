<script setup lang="ts">
/**
 * Soft blurred accent blob, used behind a translucent glass panel to fake the
 * "light glowing through frosted glass" look. Lynx's preset has no
 * backdrop-filter (nothing behind a panel can be blurred), so real
 * glassmorphism isn't possible — this fakes it with a foreground `filter:
 * blur()` blob (which IS supported) sitting behind semi-transparent content.
 */
import { computed } from 'vue'

import { accentGradient } from '../lib/colors'
import { useThemeStore } from '../stores/theme'

const props = defineProps<{ class?: string; color?: string }>()

const theme = useThemeStore()
const gradient = computed(() => accentGradient(props.color ?? theme.accentColor))
</script>

<template>
  <view
    class="pointer-events-none absolute rounded-full blur-3xl"
    :class="$props.class"
    :style="{ background: gradient }"
  />
</template>
