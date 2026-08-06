import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

import type { SavingsGoal, Subscription, Transaction } from '../types'
import { createId } from '../lib/id'
import { loadJSON, saveJSON } from '../lib/storage'
import { seedSavingsGoal, seedSubscriptions, seedTransactions } from '../lib/seed'

const STORAGE_KEY = 'cashviews:v1'

interface PersistedState {
  transactions: Transaction[]
  subscriptions: Subscription[]
  savingsGoal: SavingsGoal
}

export const useFinanceStore = defineStore('finance', () => {
  const persisted = loadJSON<PersistedState | null>(STORAGE_KEY, null)

  const transactions = ref<Transaction[]>(persisted?.transactions ?? seedTransactions())
  const subscriptions = ref<Subscription[]>(persisted?.subscriptions ?? seedSubscriptions())
  const savingsGoal = ref<SavingsGoal>(persisted?.savingsGoal ?? seedSavingsGoal())

  watch(
    [transactions, subscriptions, savingsGoal],
    () => {
      saveJSON<PersistedState>(STORAGE_KEY, {
        transactions: transactions.value,
        subscriptions: subscriptions.value,
        savingsGoal: savingsGoal.value,
      })
    },
    { deep: true },
  )

  const sortedTransactions = computed(() =>
    [...transactions.value].sort((a, b) => (a.date < b.date ? 1 : -1)),
  )

  const totalEntrate = computed(() =>
    transactions.value.filter((t) => t.kind === 'entrata').reduce((s, t) => s + t.amount, 0),
  )

  const totalUscite = computed(() =>
    transactions.value.filter((t) => t.kind === 'uscita').reduce((s, t) => s + t.amount, 0),
  )

  const balance = computed(() => totalEntrate.value - totalUscite.value)

  const monthlySubscriptionsTotal = computed(() =>
    subscriptions.value.reduce(
      (s, sub) => s + (sub.cycle === 'annuale' ? sub.amount / 12 : sub.amount),
      0,
    ),
  )

  const sortedSubscriptions = computed(() =>
    [...subscriptions.value].sort((a, b) => (a.nextBillingDate > b.nextBillingDate ? 1 : -1)),
  )

  const savingsProgress = computed(() =>
    savingsGoal.value.target > 0
      ? Math.min(1, savingsGoal.value.current / savingsGoal.value.target)
      : 0,
  )

  function addTransaction(input: Omit<Transaction, 'id'>) {
    transactions.value.push({ ...input, id: createId() })
  }

  function removeTransaction(id: string) {
    transactions.value = transactions.value.filter((t) => t.id !== id)
  }

  function addSubscription(input: Omit<Subscription, 'id'>) {
    subscriptions.value.push({ ...input, id: createId() })
  }

  function removeSubscription(id: string) {
    subscriptions.value = subscriptions.value.filter((s) => s.id !== id)
  }

  function depositToSavings(amount: number) {
    savingsGoal.value.current += amount
  }

  function withdrawFromSavings(amount: number) {
    savingsGoal.value.current = Math.max(0, savingsGoal.value.current - amount)
  }

  function setSavingsTarget(target: number) {
    savingsGoal.value.target = target
  }

  return {
    transactions,
    sortedTransactions,
    subscriptions,
    sortedSubscriptions,
    savingsGoal,
    totalEntrate,
    totalUscite,
    balance,
    monthlySubscriptionsTotal,
    savingsProgress,
    addTransaction,
    removeTransaction,
    addSubscription,
    removeSubscription,
    depositToSavings,
    withdrawFromSavings,
    setSavingsTarget,
  }
})
