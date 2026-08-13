import { onUnmounted, ref, watch, type Ref } from 'vue'

/**
 * Animates a displayed number toward `target` whenever it changes. Uses
 * `setInterval`, not `requestAnimationFrame` — rAF is a browser/DOM API and
 * isn't guaranteed on Lynx's native JS engine, while `setInterval` is a
 * plain host timer that's safe on both targets (same reasoning as avoiding
 * Vue's DOM-dependent <Transition>, see App.vue).
 */
export function useCountUp(target: Ref<number>, durationMs = 600) {
  const displayed = ref(target.value)
  let timer: ReturnType<typeof setInterval> | null = null

  watch(target, (next) => {
    if (timer) clearInterval(timer)
    const start = displayed.value
    const delta = next - start
    if (delta === 0) return
    const steps = Math.max(1, Math.round(durationMs / 16))
    let step = 0
    timer = setInterval(() => {
      step += 1
      const progress = Math.min(1, step / steps)
      const eased = 1 - (1 - progress) * (1 - progress)
      displayed.value = start + delta * eased
      if (progress >= 1) {
        displayed.value = next
        if (timer) clearInterval(timer)
        timer = null
      }
    }, 16)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return displayed
}
