export type TransactionKind = 'entrata' | 'uscita'

export type CategoryId =
  | 'stipendio'
  | 'freelance'
  | 'regali'
  | 'altro-entrata'
  | 'casa'
  | 'spesa'
  | 'trasporti'
  | 'svago'
  | 'salute'
  | 'shopping'
  | 'abbonamenti'
  | 'altro-uscita'

export interface Category {
  id: CategoryId
  label: string
  kind: TransactionKind
  icon: string
  color: string
}

export interface Transaction {
  id: string
  kind: TransactionKind
  amount: number
  categoryId: CategoryId
  note: string
  date: string // ISO date
}

export type BillingCycle = 'mensile' | 'annuale'

export type RecurringExpenseType = 'abbonamento' | 'bolletta' | 'mutuo' | 'altro'

export interface RecurringExpense {
  id: string
  type: RecurringExpenseType
  name: string
  /** For `mutuo`, this is the computed monthly payment — see lib/mortgage.ts. */
  amount: number
  cycle: BillingCycle
  nextBillingDate: string // ISO date
  icon: string
  color: string
  /** Only set when `type === 'mutuo'`. */
  mortgage?: {
    principal: number
    /** Annual interest rate, percent (e.g. 3.5 for 3.5%). */
    interestRate: number
    termMonths: number
    startDate: string // ISO date
  }
}

export interface SavingsGoal {
  id: string
  target: number
  current: number
  name: string
}
