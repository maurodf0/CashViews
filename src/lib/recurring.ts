import type { RecurringExpenseType } from '../types'

export const RECURRING_TYPE_META: Record<
  RecurringExpenseType,
  { label: string; icon: string; color: string }
> = {
  abbonamento: { label: 'Abbonamento', icon: 'repeat', color: '#818cf8' },
  bolletta: { label: 'Bolletta', icon: 'zap', color: '#fbbf24' },
  mutuo: { label: 'Mutuo', icon: 'landmark', color: '#38bdf8' },
  altro: { label: 'Altro', icon: 'circle-dot', color: '#94a3b8' },
}

export const RECURRING_TYPES: RecurringExpenseType[] = ['abbonamento', 'bolletta', 'mutuo', 'altro']
