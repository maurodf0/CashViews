import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

import type { Category, RecurringExpense, SavingsGoal, Transaction } from '../types'
import { createId } from '../lib/id'
import { loadJSON, saveJSON } from '../lib/storage'
import { CATEGORIES, getCategory } from '../lib/categories'
import { seedRecurringExpenses, seedSavingsGoals, seedTransactions } from '../lib/seed'
import { monthlyMortgagePayment, remainingMortgageBalance } from '../lib/mortgage'

const STORAGE_KEY = 'cashviews:v3'

interface PersistedState {
  transactions: Transaction[]
  recurringExpenses: RecurringExpense[]
  savingsGoals: SavingsGoal[]
  customCategories: Category[]
}

export const useFinanceStore = defineStore('finance', () => {
  const persisted = loadJSON<PersistedState | null>(STORAGE_KEY, null)

  const transactions = ref<Transaction[]>(persisted?.transactions ?? seedTransactions())
  const recurringExpenses = ref<RecurringExpense[]>(
    persisted?.recurringExpenses ?? seedRecurringExpenses(),
  )
  const savingsGoals = ref<SavingsGoal[]>(persisted?.savingsGoals ?? seedSavingsGoals())
  const customCategories = ref<Category[]>(persisted?.customCategories ?? [])

  watch(
    [transactions, recurringExpenses, savingsGoals, customCategories],
    () => {
      saveJSON<PersistedState>(STORAGE_KEY, {
        transactions: transactions.value,
        recurringExpenses: recurringExpenses.value,
        savingsGoals: savingsGoals.value,
        customCategories: customCategories.value,
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

  const totalSavings = computed(() => savingsGoals.value.reduce((s, g) => s + g.current, 0))

  function savingsProgressOf(goal: SavingsGoal): number {
    return goal.target > 0 ? Math.min(1, goal.current / goal.target) : 0
  }

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

  function addSavingsGoal(input: Omit<SavingsGoal, 'id' | 'current'> & { current?: number }) {
    savingsGoals.value.push({ ...input, current: input.current ?? 0, id: createId() })
  }

  function removeSavingsGoal(id: string) {
    savingsGoals.value = savingsGoals.value.filter((g) => g.id !== id)
  }

  function depositToSavings(goalId: string, amount: number) {
    const goal = savingsGoals.value.find((g) => g.id === goalId)
    if (goal) goal.current += amount
  }

  function withdrawFromSavings(goalId: string, amount: number) {
    const goal = savingsGoals.value.find((g) => g.id === goalId)
    if (goal) goal.current = Math.max(0, goal.current - amount)
  }

  function setSavingsTarget(goalId: string, target: number) {
    const goal = savingsGoals.value.find((g) => g.id === goalId)
    if (goal) goal.target = target
  }

  const categories = computed<Category[]>(() => [...CATEGORIES, ...customCategories.value])

  function categoryOf(categoryId: string): Category {
    return categories.value.find((c) => c.id === categoryId) ?? getCategory(categoryId)
  }

  function addCustomCategory(input: Omit<Category, 'id'>) {
    customCategories.value.push({ ...input, id: createId() })
  }

  /** No-op if `id` belongs to a built-in category — those aren't in `customCategories`. */
  function removeCustomCategory(id: string) {
    customCategories.value = customCategories.value.filter((c) => c.id !== id)
  }

  return {
    transactions,
    sortedTransactions,
    recurringExpenses,
    sortedRecurringExpenses,
    savingsGoals,
    totalSavings,
    totalEntrate,
    totalUscite,
    balance,
    monthlyRecurringTotal,
    monthlyAmountOf,
    savingsProgressOf,
    addTransaction,
    removeTransaction,
    addRecurringExpense,
    removeRecurringExpense,
    mortgageRemainingBalance,
    addSavingsGoal,
    removeSavingsGoal,
    depositToSavings,
    withdrawFromSavings,
    setSavingsTarget,
    categories,
    customCategories,
    categoryOf,
    addCustomCategory,
    removeCustomCategory,
  }
})
