<script setup lang="ts">
import { computed, ref } from 'vue'
import { VyButton } from '@vyui/kit/button'
import { VyInput } from '@vyui/kit/input'

import { useAuthStore } from '../../stores/auth'
import { useThemeStore } from '../../stores/theme'
import GlowOrb from '../../components/GlowOrb.vue'

const emit = defineEmits<{ registered: [email: string]; switchToSignIn: [] }>()

const auth = useAuthStore()
const theme = useThemeStore()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

const canSubmit = computed(
  () => name.value.trim().length > 0 && /\S+@\S+\.\S+/.test(email.value) && password.value.length >= 8,
)

async function submit() {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true
  error.value = ''
  try {
    await auth.signUp(email.value.trim(), password.value, name.value.trim())
    emit('registered', email.value.trim())
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Registrazione fallita'
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
      <text class="text-2xl font-semibold text-white">Crea un account</text>
      <text class="text-sm text-zinc-400">Traccia le tue finanze in modo semplice</text>
    </view>

    <view class="flex flex-col gap-3">
      <VyInput v-model="name" placeholder="Nome" />
      <VyInput v-model="email" type="email" placeholder="Email" />
      <VyInput v-model="password" type="password" placeholder="Password (min. 8 caratteri)" />
    </view>

    <text v-if="error" class="text-sm text-rose-400">{{ error }}</text>

    <VyButton
      block
      size="lg"
      label="Registrati"
      :disabled="!canSubmit || submitting"
      class="transition-transform active:scale-[0.98]"
      @tap="submit"
    />

    <view class="flex flex-row items-center justify-center gap-1" @tap="emit('switchToSignIn')">
      <text class="text-sm text-zinc-400">Hai già un account?</text>
      <text class="text-sm font-medium" :style="{ color: theme.accentColor }">Accedi</text>
    </view>
  </view>
</template>
