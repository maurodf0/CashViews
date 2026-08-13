import type { Transaction } from '../types'
import { getCategory } from './categories'

export interface DayBucket {
  date: string
  label: string
  entrata: number
  uscita: number
}

/** Last `days` calendar days (oldest to newest, today included), zero-filled. */
export function dailyBuckets(transactions: Transaction[], days = 7): DayBucket[] {
  const buckets = new Map<string, DayBucket>()
  const dayLabel = new Intl.DateTimeFormat('it-IT', { weekday: 'short' })

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    buckets.set(iso, { date: iso, label: dayLabel.format(d), entrata: 0, uscita: 0 })
  }

  for (const t of transactions) {
    const bucket = buckets.get(t.date)
    if (!bucket) continue
    if (t.kind === 'entrata') bucket.entrata += t.amount
    else bucket.uscita += t.amount
  }

  return [...buckets.values()]
}

export interface CategoryTotal {
  categoryId: string
  label: string
  color: string
  icon: string
  amount: number
  percent: number
}

/** Spend-by-category breakdown (uscita only), sorted descending. */
export function categoryBreakdown(transactions: Transaction[]): CategoryTotal[] {
  const totals = new Map<string, number>()
  for (const t of transactions) {
    if (t.kind !== 'uscita') continue
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount)
  }

  const grandTotal = [...totals.values()].reduce((s, v) => s + v, 0)

  return [...totals.entries()]
    .map(([categoryId, amount]) => {
      const category = getCategory(categoryId)
      return {
        categoryId,
        label: category.label,
        color: category.color,
        icon: category.icon,
        amount,
        percent: grandTotal > 0 ? (amount / grandTotal) * 100 : 0,
      }
    })
    .sort((a, b) => b.amount - a.amount)
}
