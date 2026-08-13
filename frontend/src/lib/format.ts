// Formatters are created lazily (not at module scope) because Lynx's native
// runtime has no built-in `Intl` — `installIntlPolyfill()` patches it in at
// app startup (src/index.ts), which runs *after* this module is evaluated.
// A top-level `new Intl.NumberFormat(...)` would run before the polyfill exists.

function currencyFormatter() {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatCurrency(amount: number): string {
  return currencyFormatter().format(amount)
}

export function formatSignedCurrency(amount: number, kind: 'entrata' | 'uscita'): string {
  const sign = kind === 'entrata' ? '+' : '-'
  return `${sign}${formatCurrency(Math.abs(amount))}`
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' }).format(new Date(iso))
}

export function formatDateFull(iso: string): string {
  return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(iso),
  )
}

export function daysUntil(iso: string): number {
  const target = new Date(iso)
  const now = new Date()
  target.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - now.getTime()) / 86_400_000)
}
