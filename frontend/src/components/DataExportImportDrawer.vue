<script setup lang="ts">
import { ref } from 'vue'
import { VyDrawer } from '@vyui/kit/drawer'
import { VyButton } from '@vyui/kit/button'
import { VyTextarea } from '@vyui/kit/textarea'

import { apiFetch } from '../lib/api'
import { useFinanceStore } from '../stores/finance'

const open = defineModel<boolean>('open', { default: false })
const store = useFinanceStore()

const mode = ref<'menu' | 'export' | 'import'>('menu')
const exportText = ref('')
const importText = ref('')
const error = ref('')
const info = ref('')
const busy = ref(false)

/** Clipboard access is unconfirmed on Lynx native — feature-detected, with the
 * textarea itself as the fallback (select-and-copy manually). */
const clipboardAvailable = typeof navigator !== 'undefined' && !!navigator.clipboard

function openMenu() {
  mode.value = 'menu'
  error.value = ''
  info.value = ''
}

async function startExport() {
  busy.value = true
  error.value = ''
  try {
    const data = await apiFetch('/api/export')
    exportText.value = JSON.stringify(data, null, 2)
    mode.value = 'export'
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Esportazione fallita'
  } finally {
    busy.value = false
  }
}

async function copyExport() {
  if (!clipboardAvailable) return
  try {
    await navigator.clipboard.writeText(exportText.value)
    info.value = 'Copiato negli appunti'
  } catch {
    error.value = 'Copia non riuscita — seleziona e copia manualmente il testo'
  }
}

function startImport() {
  importText.value = ''
  error.value = ''
  info.value = ''
  mode.value = 'import'
}

async function submitImport() {
  busy.value = true
  error.value = ''
  info.value = ''
  try {
    const parsed = JSON.parse(importText.value)
    await apiFetch('/api/import', { method: 'POST', body: JSON.stringify(parsed) })
    await store.fetchAll()
    info.value = 'Importazione completata'
    mode.value = 'menu'
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'JSON non valido'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <VyDrawer v-model:open="open" side="bottom" title="Esporta / Importa dati" :snap-points="[0.8]" @update:open="openMenu">
    <template #body>
      <view class="flex flex-col gap-4 px-1 pb-2">
        <view v-if="mode === 'menu'" class="flex flex-col gap-3">
          <view
            class="flex flex-row items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] py-3.5 transition-transform active:scale-[0.98]"
            @tap="startExport"
          >
            <text class="text-sm font-medium text-white">Esporta dati</text>
          </view>
          <view
            class="flex flex-row items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] py-3.5 transition-transform active:scale-[0.98]"
            @tap="startImport"
          >
            <text class="text-sm font-medium text-white">Importa dati</text>
          </view>
        </view>

        <view v-else-if="mode === 'export'" class="flex flex-col gap-3">
          <text class="text-xs text-zinc-500">
            {{ clipboardAvailable ? 'Copia questo JSON per salvarlo altrove.' : 'Seleziona e copia questo JSON manualmente.' }}
          </text>
          <VyTextarea :model-value="exportText" readonly rows="12" :ui="{ base: 'text-xs font-mono' }" />
          <VyButton v-if="clipboardAvailable" block label="Copia negli appunti" @tap="copyExport" />
        </view>

        <view v-else class="flex flex-col gap-3">
          <text class="text-xs text-zinc-500">Incolla qui il JSON esportato in precedenza.</text>
          <VyTextarea v-model="importText" rows="12" placeholder="{ &quot;transactions&quot;: [...], ... }" :ui="{ base: 'text-xs font-mono' }" />
        </view>

        <text v-if="error" class="text-sm text-rose-400">{{ error }}</text>
        <text v-if="info" class="text-sm text-emerald-400">{{ info }}</text>
      </view>
    </template>
    <template #footer v-if="mode === 'import'">
      <VyButton
        block
        size="lg"
        label="Importa"
        :disabled="busy || importText.trim().length === 0"
        class="transition-transform active:scale-[0.98]"
        @tap="submitImport"
      />
    </template>
  </VyDrawer>
</template>
