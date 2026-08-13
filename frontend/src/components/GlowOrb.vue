<script setup lang="ts">
/**
 * Soft blurred accent blob, used behind a translucent glass panel to fake the
 * "light glowing through frosted glass" look. Lynx's preset has no
 * backdrop-filter (nothing behind a panel can be blurred), so real
 * glassmorphism isn't possible — this fakes it with a foreground `filter:
 * blur()` blob (which IS supported) sitting behind semi-transparent content.
 */
defineProps<{ class?: string }>()
</script>

<template>
  <view
    class="pointer-events-none absolute rounded-full blur-3xl"
    :class="$props.class"
    style="background: linear-gradient(135deg, #0284c7 0%, #0d9488 100%)"
  />
</template>
