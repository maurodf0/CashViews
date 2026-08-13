import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { Category, RecurringExpense, SavingsGoal, Transaction } from '../types'
import { apiFetch } from '../lib/api'
import { getCategory } from '../lib/categories'
import { monthlyMortgagePayment, remainingMortgageBalance } from '../lib/mortgage'

interface CategoryRow extends Category {
  userId: string | null
}

export const useFinanceStore = defineStore('finance', () => {
  const transactions = ref<Transaction[]>([])
  const recurringExpenses = ref<RecurringExpense[]>([])
  const savingsGoals = ref<SavingsGoal[]>([])
  const categoryRows = ref<CategoryRow[]>([])
  const loaded = ref(false)

  async function fetchAll() {
    const [t, r, g, c] = await Promise.all([
      apiFetch<Transaction[]>('/api/transactions'),
      apiFetch<RecurringExpense[]>('/api/recurring-expenses'),
      apiFetch<SavingsGoal[]>('/api/savings-goals'),
      apiFetch<CategoryRow[]>('/api/categories'),
    ])
    transactions.value = t
    recurringExpenses.value = r
    savingsGoals.value = g
    categoryRows.value = c
    loaded.value = true
  }

  function reset() {
    transactions.value = []
    recurringExpenses.value = []
    savingsGoals.value = []
    categoryRows.value = []
    loaded.value = false
  }

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

  async function addTransaction(input: Omit<Transaction, 'id'>) {
    const created = await apiFetch<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    transactions.value.push(created)
  }

  async function removeTransaction(id: string) {
    await apiFetch(`/api/transactions/${id}`, { method: 'DELETE' })
    transactions.value = transactions.value.filter((t) => t.id !== id)
  }

  async function addRecurringExpense(input: Omit<RecurringExpense, 'id' | 'amount'> & { amount?: number }) {
    const amount =
      input.type === 'mutuo' && input.mortgage
        ? monthlyMortgagePayment(
            input.mortgage.principal,
            input.mortgage.interestRate,
            input.mortgage.termMonths,
          )
        : (input.amount ?? 0)
    const created = await apiFetch<RecurringExpense>('/api/recurring-expenses', {
      method: 'POST',
      body: JSON.stringify({ ...input, amount }),
    })
    recurringExpenses.value.push(created)
  }

  async function removeRecurringExpense(id: string) {
    await apiFetch(`/api/recurring-expenses/${id}`, { method: 'DELETE' })
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

  async function addSavingsGoal(input: Omit<SavingsGoal, 'id' | 'current'> & { current?: number }) {
    const created = await apiFetch<SavingsGoal>('/api/savings-goals', {
      method: 'POST',
      body: JSON.stringify({ ...input, current: input.current ?? 0 }),
    })
    savingsGoals.value.push(created)
  }

  async function removeSavingsGoal(id: string) {
    await apiFetch(`/api/savings-goals/${id}`, { method: 'DELETE' })
    savingsGoals.value = savingsGoals.value.filter((g) => g.id !== id)
  }

  function replaceGoal(updated: SavingsGoal) {
    const index = savingsGoals.value.findIndex((g) => g.id === updated.id)
    if (index !== -1) savingsGoals.value[index] = updated
  }

  async function depositToSavings(goalId: string, amount: number) {
    const updated = await apiFetch<SavingsGoal>(`/api/savings-goals/${goalId}/deposit`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
    replaceGoal(updated)
  }

  async function withdrawFromSavings(goalId: string, amount: number) {
    const updated = await apiFetch<SavingsGoal>(`/api/savings-goals/${goalId}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
    replaceGoal(updated)
  }

  async function setSavingsTarget(goalId: string, target: number) {
    const updated = await apiFetch<SavingsGoal>(`/api/savings-goals/${goalId}`, {
      method: 'PATCH',
      body: JSON.stringify({ target }),
    })
    replaceGoal(updated)
  }

  const categories = computed<Category[]>(() => categoryRows.value)
  const builtInCategories = computed(() => categoryRows.value.filter((c) => c.userId === null))
  const customCategories = computed(() => categoryRows.value.filter((c) => c.userId !== null))

  function categoryOf(categoryId: string): Category {
    return categoryRows.value.find((c) => c.id === categoryId) ?? getCategory(categoryId)
  }

  async function addCustomCategory(input: Omit<Category, 'id'>) {
    const created = await apiFetch<CategoryRow>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    categoryRows.value.push(created)
  }

  /** No-op if `id` belongs to a built-in category — the API rejects that with a 404. */
  async function removeCustomCategory(id: string) {
    await apiFetch(`/api/categories/${id}`, { method: 'DELETE' })
    categoryRows.value = categoryRows.value.filter((c) => c.id !== id)
  }

  return {
    loaded,
    fetchAll,
    reset,
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
    builtInCategories,
    customCategories,
    categoryOf,
    addCustomCategory,
    removeCustomCategory,
  }
})
