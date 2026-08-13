<script setup lang="ts">
import { computed, ref } from 'vue'
import { VyButton } from '@vyui/kit/button'
import { VyInput } from '@vyui/kit/input'

import { useAuthStore } from '../../stores/auth'
import { useThemeStore } from '../../stores/theme'
import GlowOrb from '../../components/GlowOrb.vue'
import GlassCard from '../../components/GlassCard.vue'
import AuthHeader from './AuthHeader.vue'

const props = defineProps<{ email: string }>()
const emit = defineEmits<{ verified: [] }>()

const auth = useAuthStore()
const theme = useThemeStore()

const otp = ref('')
const error = ref('')
const info = ref('')
const submitting = ref(false)
const resending = ref(false)

const canSubmit = computed(() => otp.value.trim().length === 6)

async function submit() {
  if (!canSubmit.value || submitting.value) return
  submitting.value = true
  error.value = ''
  try {
    await auth.verifyOtp(props.email, otp.value.trim())
    emit('verified')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Codice non valido'
  } finally {
    submitting.value = false
  }
}

async function resend() {
  if (resending.value) return
  resending.value = true
  error.value = ''
  info.value = ''
  try {
    await auth.resendOtp(props.email, 'email-verification')
    info.value = 'Nuovo codice inviato'
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Invio fallito'
  } finally {
    resending.value = false
  }
}
</script>

<template>
  <view class="auth-scope relative flex h-full flex-col justify-center gap-6 overflow-hidden px-6 py-10">
    <GlowOrb class="-right-20 -top-24 size-72 opacity-40" />
    <GlowOrb class="-bottom-24 -left-20 size-64 opacity-25" />

    <AuthHeader />

    <GlassCard class="flex flex-col gap-5 p-5" :glow="false">
      <view class="flex flex-col gap-1">
        <text class="text-lg font-semibold text-white">Verifica la tua email</text>
        <text class="text-sm text-zinc-400">Abbiamo inviato un codice a {{ email }}</text>
      </view>

      <VyInput
        v-model="otp"
        type="number"
        placeholder="000000"
        size="lg"
        :ui="{ base: 'text-center text-2xl tracking-[0.5em]' }"
      />

      <text v-if="error" class="text-sm text-rose-400">{{ error }}</text>
      <text v-if="info" class="text-sm" :style="{ color: theme.accentColor }">{{ info }}</text>

      <VyButton
        block
        size="lg"
        label="Verifica"
        :disabled="!canSubmit || submitting"
        class="transition-transform active:scale-[0.98]"
        @tap="submit"
      />

      <view class="flex flex-row items-center justify-center gap-1" @tap="resend">
        <text class="text-sm text-zinc-400">Non hai ricevuto il codice?</text>
        <text class="text-sm font-medium" :style="{ color: theme.accentColor }">Invia di nuovo</text>
      </view>
    </GlassCard>
  </view>
</template>
