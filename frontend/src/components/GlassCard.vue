<script setup lang="ts">
/**
 * Consolidates the "frosted glass" panel pattern used across the app: a
 * translucent surface with an inset top highlight (to catch light like a
 * glass edge) plus optional GlowOrb accents behind it. See GlowOrb.vue for
 * why this simulates glassmorphism instead of using backdrop-filter.
 */
import GlowOrb from './GlowOrb.vue'

withDefaults(defineProps<{ class?: string; glow?: boolean }>(), { glow: true })
</script>

<template>
  <view
    class="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
    :class="$props.class"
  >
    <template v-if="glow">
      <GlowOrb class="-right-10 -top-16 size-48 opacity-40" />
      <GlowOrb class="-bottom-16 -left-10 size-40 opacity-25" />
    </template>
    <slot />
  </view>
</template>
