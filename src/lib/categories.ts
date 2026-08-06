import type { Category } from '../types'

export const CATEGORIES: Category[] = [
  { id: 'stipendio', label: 'Stipendio', kind: 'entrata', icon: 'wallet', color: '#34d399' },
  { id: 'freelance', label: 'Freelance', kind: 'entrata', icon: 'laptop', color: '#22d3ee' },
  { id: 'regali', label: 'Regali', kind: 'entrata', icon: 'gift', color: '#a78bfa' },
  { id: 'altro-entrata', label: 'Altro', kind: 'entrata', icon: 'plus-circle', color: '#94a3b8' },

  { id: 'casa', label: 'Casa', kind: 'uscita', icon: 'home', color: '#f472b6' },
  { id: 'spesa', label: 'Spesa', kind: 'uscita', icon: 'shopping-cart', color: '#fb923c' },
  { id: 'trasporti', label: 'Trasporti', kind: 'uscita', icon: 'car', color: '#60a5fa' },
  { id: 'svago', label: 'Svago', kind: 'uscita', icon: 'popcorn', color: '#c084fc' },
  { id: 'salute', label: 'Salute', kind: 'uscita', icon: 'heart-pulse', color: '#f87171' },
  { id: 'shopping', label: 'Shopping', kind: 'uscita', icon: 'shopping-bag', color: '#fbbf24' },
  { id: 'abbonamenti', label: 'Abbonamenti', kind: 'uscita', icon: 'repeat', color: '#818cf8' },
  { id: 'altro-uscita', label: 'Altro', kind: 'uscita', icon: 'ellipsis', color: '#94a3b8' },
]

export function getCategory(id: string): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1]
}
