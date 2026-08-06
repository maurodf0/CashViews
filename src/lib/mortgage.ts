/** Standard French amortization (fixed monthly payment). */
export function monthlyMortgagePayment(
  principal: number,
  annualRatePercent: number,
  termMonths: number,
): number {
  if (termMonths <= 0) return 0
  const r = annualRatePercent / 100 / 12
  if (r === 0) return principal / termMonths
  const factor = (1 + r) ** termMonths
  return (principal * r * factor) / (factor - 1)
}

function monthsElapsed(startISO: string): number {
  const start = new Date(startISO)
  const now = new Date()
  return Math.max(
    0,
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()),
  )
}

/** Outstanding principal today, given payments made since `startISO`. */
export function remainingMortgageBalance(
  principal: number,
  annualRatePercent: number,
  termMonths: number,
  startISO: string,
): number {
  const elapsed = Math.min(monthsElapsed(startISO), termMonths)
  const r = annualRatePercent / 100 / 12
  if (r === 0) {
    const payment = monthlyMortgagePayment(principal, annualRatePercent, termMonths)
    return Math.max(0, principal - payment * elapsed)
  }
  const balance =
    principal * (1 + r) ** elapsed -
    monthlyMortgagePayment(principal, annualRatePercent, termMonths) * (((1 + r) ** elapsed - 1) / r)
  return Math.max(0, balance)
}
