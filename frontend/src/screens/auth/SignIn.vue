<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { VyButton } from '@vyui/kit/button'
import { VyInput } from '@vyui/kit/input'

import { useAuthStore } from '../../stores/auth'
import { useThemeStore } from '../../stores/theme'
import GlowOrb from '../../components/GlowOrb.vue'

const props = defineProps<{ prefillEmail?: string }>()
const emit = defineEmits<{ switchToSignUp: [] }>()

const auth = useAuthStore()
const theme = useThemeStore()

const email = ref(props.prefillEmail ?? '')
const password = ref('')
const error = ref('')
const submitting = ref(false)

watch(
  () => props.prefillEmail,
  (value) => {
    if (value) email.value = value
  },
)

const canSubmit = computed(() => /\S+@\S+\.\S+/.test(email.value) && password.value.length > 0)

async function submit() {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true
  error.value = ''
  try {
    await auth.signIn(email.value.trim(), password.value)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Accesso fallito'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="relative flex h-full flex-col justify-center gap-6 overflow-hidden px-6 py-10">
    <GlowOrb class="-right-16 -top-24 size-64 opacity-40" />
    <GlowOrb class="-bottom-24 -left-16 size-56 opacity-25" />

    <view class="flex flex-col gap-1">
      <text class="text-2xl font-semibold text-white">Bentornato</text>
      <text class="text-sm text-zinc-400">Accedi al tuo account</text>
    </view>

    <view class="flex flex-col gap-3">
      <VyInput v-model="email" type="email" placeholder="Email" />
      <VyInput v-model="password" type="password" placeholder="Password" />
    </view>

    <text v-if="error" class="text-sm text-rose-400">{{ error }}</text>

    <VyButton
      block
      size="lg"
      label="Accedi"
      :disabled="!canSubmit || submitting"
      class="transition-transform active:scale-[0.98]"
      @tap="submit"
    />

    <view class="flex flex-row items-center justify-center gap-1" @tap="emit('switchToSignUp')">
      <text class="text-sm text-zinc-400">Non hai un account?</text>
      <text class="text-sm font-medium" :style="{ color: theme.accentColor }">Registrati</text>
    </view>
  </view>
</template>
