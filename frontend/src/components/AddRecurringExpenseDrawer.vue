<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { VyDrawer } from '@vyui/kit/drawer'
import { VyButton } from '@vyui/kit/button'
import { VyInput } from '@vyui/kit/input'
import { VyIcon } from '@vyui/kit/icon'

import type { BillingCycle, RecurringExpenseType } from '../types'
import { useFinanceStore } from '../stores/finance'
import { RECURRING_TYPE_META, RECURRING_TYPES } from '../lib/recurring'
import { monthlyMortgagePayment } from '../lib/mortgage'
import { formatCurrency } from '../lib/format'

const open = defineModel<boolean>('open', { default: false })
const store = useFinanceStore()

const ICONS = ['tv', 'music', 'cloud', 'dumbbell', 'package', 'gamepad-2', 'newspaper', 'zap', 'wifi', 'landmark', 'repeat']
const COLORS = ['#ef4444', '#22c55e', '#60a5fa', '#fb923c', '#a78bfa', '#f472b6', '#facc15', '#38bdf8']

const type = ref<RecurringExpenseType>('abbonamento')
const name = ref('')
const amount = ref('')
const cycle = ref<BillingCycle>('mensile')
const daysUntilBilling = ref('30')
const icon = ref(ICONS[0])
const color = ref(COLORS[0])

// Mortgage-only fields.
const principal = ref('')
const interestRate = ref('')
const termMonths = ref('300')
const monthsAlreadyPaid = ref('0')

function resetForm() {
  type.value = 'abbonamento'
  name.value = ''
  amount.value = ''
  cycle.value = 'mensile'
  daysUntilBilling.value = '30'
  icon.value = ICONS[0]
  color.value = COLORS[0]
  principal.value = ''
  interestRate.value = ''
  termMonths.value = '300'
  monthsAlreadyPaid.value = '0'
}

watch(open, (isOpen) => {
  if (isOpen) resetForm()
})

watch(type, (newType) => {
  icon.value = RECURRING_TYPE_META[newType].icon
  color.value = RECURRING_TYPE_META[newType].color
  if (newType === 'mutuo') name.value = name.value || 'Mutuo Casa'
})

const previewMonthlyPayment = computed(() => {
  const p = Number.parseFloat(principal.value.replace(',', '.'))
  const r = Number.parseFloat(interestRate.value.replace(',', '.'))
  const n = Number.parseInt(termMonths.value, 10)
  if (!Number.isFinite(p) || !Number.isFinite(r) || !Number.isFinite(n) || p <= 0 || n <= 0) return null
  return monthlyMortgagePayment(p, r, n)
})

const canSave = computed(() => {
  if (!name.value.trim()) return false
  if (type.value === 'mutuo') return previewMonthlyPayment.value !== null
  const value = Number.parseFloat(amount.value.replace(',', '.'))
  return Number.isFinite(value) && value > 0
})

const saving = ref(false)
const error = ref('')

async function save() {
  if (!canSave.value || saving.value) return
  saving.value = true
  error.value = ''
  const days = Number.parseInt(daysUntilBilling.value, 10) || 0
  const next = new Date()
  next.setDate(next.getDate() + days)
  const nextBillingDate = next.toISOString().slice(0, 10)

  try {
    if (type.value === 'mutuo') {
      const p = Number.parseFloat(principal.value.replace(',', '.'))
      const r = Number.parseFloat(interestRate.value.replace(',', '.'))
      const n = Number.parseInt(termMonths.value, 10)
      const paidMonths = Number.parseInt(monthsAlreadyPaid.value, 10) || 0
      const start = new Date()
      start.setMonth(start.getMonth() - paidMonths)
      await store.addRecurringExpense({
        type: 'mutuo',
        name: name.value.trim(),
        cycle: 'mensile',
        nextBillingDate,
        icon: icon.value,
        color: color.value,
        mortgage: { principal: p, interestRate: r, termMonths: n, startDate: start.toISOString().slice(0, 10) },
      })
    } else {
      const value = Number.parseFloat(amount.value.replace(',', '.'))
      await store.addRecurringExpense({
        type: type.value,
        name: name.value.trim(),
        amount: value,
        cycle: cycle.value,
        nextBillingDate,
        icon: icon.value,
        color: color.value,
      })
    }
    open.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Salvataggio fallito'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <VyDrawer v-model:open="open" side="bottom" title="Nuova spesa ricorrente" :snap-points="[0.9]">
    <template #body>
      <view class="flex flex-col gap-5 px-1 pb-2">
        <view class="flex flex-col gap-2">
          <text class="text-xs text-zinc-500">Tipo</text>
          <view class="flex flex-row flex-wrap gap-2">
            <view
              v-for="t in RECURRING_TYPES"
              :key="t"
              class="flex flex-row items-center gap-1.5 rounded-full border px-3 py-1.5 transition-all duration-150 active:scale-95"
              :style="
                type === t
                  ? { backgroundColor: `${RECURRING_TYPE_META[t].color}26`, borderColor: RECURRING_TYPE_META[t].color }
                  : { borderColor: 'rgba(255,255,255,0.12)' }
              "
              @tap="type = t"
            >
              <VyIcon :name="`i-lucide-${RECURRING_TYPE_META[t].icon}`" :color="RECURRING_TYPE_META[t].color" class="size-4" />
              <text class="text-xs text-white">{{ RECURRING_TYPE_META[t].label }}</text>
            </view>
          </view>
        </view>

        <view class="flex flex-col gap-2">
          <text class="text-xs text-zinc-500">Nome</text>
          <VyInput v-model="name" placeholder="Es. Netflix" />
        </view>

        <template v-if="type !== 'mutuo'">
          <view class="flex flex-col gap-2">
            <text class="text-xs text-zinc-500">Importo</text>
            <VyInput v-model="amount" type="number" placeholder="0,00" />
          </view>

          <view class="flex flex-col gap-2">
            <text class="text-xs text-zinc-500">Ricorrenza</text>
            <view class="flex flex-row gap-2 rounded-xl bg-white/5 p-1">
              <view
                class="flex-1 rounded-lg py-2 text-center transition-colors duration-200"
                :class="cycle === 'mensile' ? 'bg-white/10' : ''"
                @tap="cycle = 'mensile'"
              >
                <text class="text-sm font-medium" :class="cycle === 'mensile' ? 'text-white' : 'text-zinc-500'">
                  Mensile
                </text>
              </view>
              <view
                class="flex-1 rounded-lg py-2 text-center transition-colors duration-200"
                :class="cycle === 'annuale' ? 'bg-white/10' : ''"
                @tap="cycle = 'annuale'"
              >
                <text class="text-sm font-medium" :class="cycle === 'annuale' ? 'text-white' : 'text-zinc-500'">
                  Annuale
                </text>
              </view>
            </view>
          </view>
        </template>

        <template v-else>
          <view class="flex flex-col gap-2">
            <text class="text-xs text-zinc-500">Capitale iniziale</text>
            <VyInput v-model="principal" type="number" placeholder="Es. 180000" />
          </view>
          <view class="flex flex-row gap-3">
            <view class="flex flex-1 flex-col gap-2">
              <text class="text-xs text-zinc-500">Tasso annuo (%)</text>
              <VyInput v-model="interestRate" type="number" placeholder="Es. 3,2" />
            </view>
            <view class="flex flex-1 flex-col gap-2">
              <text class="text-xs text-zinc-500">Durata (mesi)</text>
              <VyInput v-model="termMonths" type="number" placeholder="300" />
            </view>
          </view>
          <view class="flex flex-col gap-2">
            <text class="text-xs text-zinc-500">Mesi già pagati</text>
            <VyInput v-model="monthsAlreadyPaid" type="number" placeholder="0" />
          </view>
          <view v-if="previewMonthlyPayment !== null" class="flex flex-col gap-1 rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
            <text class="text-xs text-zinc-500">Rata mensile stimata</text>
            <text class="text-lg font-semibold text-white">{{ formatCurrency(previewMonthlyPayment) }}</text>
          </view>
        </template>

        <view class="flex flex-col gap-2">
          <text class="text-xs text-zinc-500">Prossimo addebito tra (giorni)</text>
          <VyInput v-model="daysUntilBilling" type="number" placeholder="30" />
        </view>

        <view class="flex flex-col gap-2">
          <text class="text-xs text-zinc-500">Colore</text>
          <view class="flex flex-row flex-wrap gap-2">
            <view
              v-for="c in COLORS"
              :key="c"
              class="size-8 rounded-full border-2 transition-transform duration-150 active:scale-90"
              :class="color === c ? 'scale-110' : ''"
              :style="{ backgroundColor: c, borderColor: color === c ? '#fff' : 'transparent' }"
              @tap="color = c"
            />
          </view>
        </view>

        <text v-if="error" class="text-sm text-rose-400">{{ error }}</text>
      </view>
    </template>
    <template #footer>
      <VyButton
        block
        size="lg"
        label="Salva"
        :disabled="!canSave || saving"
        class="transition-transform active:scale-[0.98]"
        @tap="save"
      />
    </template>
  </VyDrawer>
</template>
