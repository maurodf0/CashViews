import type { SavingsGoal, Subscription, Transaction } from '../types'
import { createId } from './id'

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function daysFromNow(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function seedTransactions(): Transaction[] {
  return [
    { id: createId(), kind: 'entrata', amount: 2100, categoryId: 'stipendio', note: 'Stipendio Agosto', date: daysAgo(4) },
    { id: createId(), kind: 'uscita', amount: 780, categoryId: 'casa', note: 'Affitto', date: daysAgo(4) },
    { id: createId(), kind: 'uscita', amount: 64.5, categoryId: 'spesa', note: 'Supermercato', date: daysAgo(1) },
    { id: createId(), kind: 'uscita', amount: 32, categoryId: 'trasporti', note: 'Benzina', date: daysAgo(2) },
    { id: createId(), kind: 'entrata', amount: 350, categoryId: 'freelance', note: 'Progetto UI', date: daysAgo(6) },
    { id: createId(), kind: 'uscita', amount: 18.9, categoryId: 'svago', note: 'Cinema', date: daysAgo(3) },
    { id: createId(), kind: 'uscita', amount: 45, categoryId: 'shopping', note: 'Scarpe', date: daysAgo(8) },
    { id: createId(), kind: 'uscita', amount: 9.99, categoryId: 'abbonamenti', note: 'Spotify', date: daysAgo(5) },
  ]
}

export function seedSubscriptions(): Subscription[] {
  return [
    { id: createId(), name: 'Netflix', amount: 13.99, cycle: 'mensile', nextBillingDate: daysFromNow(9), icon: 'tv', color: '#ef4444' },
    { id: createId(), name: 'Spotify', amount: 9.99, cycle: 'mensile', nextBillingDate: daysFromNow(20), icon: 'music', color: '#22c55e' },
    { id: createId(), name: 'iCloud+', amount: 2.99, cycle: 'mensile', nextBillingDate: daysFromNow(14), icon: 'cloud', color: '#60a5fa' },
    { id: createId(), name: 'Palestra', amount: 29.9, cycle: 'mensile', nextBillingDate: daysFromNow(3), icon: 'dumbbell', color: '#fb923c' },
    { id: createId(), name: 'Amazon Prime', amount: 49.9, cycle: 'annuale', nextBillingDate: daysFromNow(120), icon: 'package', color: '#38bdf8' },
  ]
}

export function seedSavingsGoal(): SavingsGoal {
  return { name: 'Fondo Monetario', target: 10000, current: 3450 }
}
