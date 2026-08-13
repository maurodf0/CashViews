<script setup lang="ts">
import { ref } from 'vue'

import SignIn from './SignIn.vue'
import SignUp from './SignUp.vue'
import VerifyOtp from './VerifyOtp.vue'

type Step = 'signin' | 'signup' | 'verify'

const step = ref<Step>('signin')
const pendingEmail = ref('')

function onRegistered(email: string) {
  pendingEmail.value = email
  step.value = 'verify'
}

function onVerified() {
  step.value = 'signin'
}
</script>

<template>
  <view class="h-full bg-zinc-950">
    <SignIn v-if="step === 'signin'" :prefill-email="pendingEmail" @switch-to-sign-up="step = 'signup'" />
    <SignUp v-else-if="step === 'signup'" @registered="onRegistered" @switch-to-sign-in="step = 'signin'" />
    <VerifyOtp v-else :email="pendingEmail" @verified="onVerified" />
  </view>
</template>
