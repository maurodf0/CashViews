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

export interface Subscription {
  id: string
  name: string
  amount: number
  cycle: BillingCycle
  nextBillingDate: string // ISO date
  icon: string
  color: string
}

export interface SavingsGoal {
  target: number
  current: number
  name: string
}
