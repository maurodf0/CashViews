<script setup lang="ts">
import { VyModal } from '@vyui/kit/modal'
import { VyButton } from '@vyui/kit/button'

const open = defineModel<boolean>('open', { default: false })

defineProps<{
  title: string
  description?: string
  confirmLabel?: string
  confirmColor?: 'error' | 'primary'
}>()

const emit = defineEmits<{ confirm: [] }>()
</script>

<template>
  <VyModal
    v-model:open="open"
    :title="title"
    :description="description"
    :ui="{
      header: 'pr-11',
      close: 'absolute top-3 right-3 left-auto',
    }"
  >
    <template #footer="{ close }">
      <view class="flex flex-1 flex-row gap-3">
        <VyButton class="flex-1" color="neutral" variant="soft" label="Annulla" @tap="close" />
        <VyButton
          class="flex-1"
          :color="confirmColor ?? 'error'"
          :label="confirmLabel ?? 'Conferma'"
          @tap="
            () => {
              emit('confirm')
              close()
            }
          "
        />
      </view>
    </template>
  </VyModal>
</template>
