import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

import type { RecurringExpense, SavingsGoal, Transaction } from '../types'
import { createId } from '../lib/id'
import { loadJSON, saveJSON } from '../lib/storage'
import { seedRecurringExpenses, seedSavingsGoal, seedTransactions } from '../lib/seed'
import { monthlyMortgagePayment, remainingMortgageBalance } from '../lib/mortgage'

const STORAGE_KEY = 'cashviews:v2'

interface PersistedState {
  transactions: Transaction[]
  recurringExpenses: RecurringExpense[]
  savingsGoal: SavingsGoal
}

export const useFinanceStore = defineStore('finance', () => {
  const persisted = loadJSON<PersistedState | null>(STORAGE_KEY, null)

  const transactions = ref<Transaction[]>(persisted?.transactions ?? seedTransactions())
  const recurringExpenses = ref<RecurringExpense[]>(
    persisted?.recurringExpenses ?? seedRecurringExpenses(),
  )
  const savingsGoal = ref<SavingsGoal>(persisted?.savingsGoal ?? seedSavingsGoal())

  watch(
    [transactions, recurringExpenses, savingsGoal],
    () => {
      saveJSON<PersistedState>(STORAGE_KEY, {
        transactions: transactions.value,
        recurringExpenses: recurringExpenses.value,
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

  /** For a `mutuo`, the monthly payment is always derived from principal/rate/term. */
  function monthlyAmountOf(expense: RecurringExpense): number {
    if (expense.type === 'mutuo' && expense.mortgage) {
      return monthlyMortgagePayment(
        expense.mortgage.principal,
        expense.mortgage.interestRate,
        expense.mortgage.termMonths,
      )
    }
    return expense.cycle === 'annuale' ? expense.amount / 12 : expense.amount
  }

  const monthlyRecurringTotal = computed(() =>
    recurringExpenses.value.reduce((s, e) => s + monthlyAmountOf(e), 0),
  )

  const sortedRecurringExpenses = computed(() =>
    [...recurringExpenses.value].sort((a, b) => (a.nextBillingDate > b.nextBillingDate ? 1 : -1)),
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

  function addRecurringExpense(input: Omit<RecurringExpense, 'id' | 'amount'> & { amount?: number }) {
    const amount =
      input.type === 'mutuo' && input.mortgage
        ? monthlyMortgagePayment(
            input.mortgage.principal,
            input.mortgage.interestRate,
            input.mortgage.termMonths,
          )
        : (input.amount ?? 0)
    recurringExpenses.value.push({ ...input, amount, id: createId() })
  }

  function removeRecurringExpense(id: string) {
    recurringExpenses.value = recurringExpenses.value.filter((e) => e.id !== id)
  }

  function mortgageRemainingBalance(expense: RecurringExpense): number {
    if (expense.type !== 'mutuo' || !expense.mortgage) return 0
    return remainingMortgageBalance(
      expense.mortgage.principal,
      expense.mortgage.interestRate,
      expense.mortgage.termMonths,
      expense.mortgage.startDate,
    )
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
    recurringExpenses,
    sortedRecurringExpenses,
    savingsGoal,
    totalEntrate,
    totalUscite,
    balance,
    monthlyRecurringTotal,
    monthlyAmountOf,
    savingsProgress,
    addTransaction,
    removeTransaction,
    addRecurringExpense,
    removeRecurringExpense,
    mortgageRemainingBalance,
    depositToSavings,
    withdrawFromSavings,
    setSavingsTarget,
  }
})
