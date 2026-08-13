import { eq } from 'drizzle-orm'
import { Hono } from 'hono'

import { db } from '../db'
import { categories, recurringExpenses, savingsGoals, transactions } from '../db/schema'
import { createId } from '../lib/id'
import { importInput } from '../lib/validation'

export const dataRoute = new Hono()

dataRoute.get('/export', async (c) => {
  const userId = c.get('userId')
  const [userTransactions, userRecurring, userGoals, userCategories] = await Promise.all([
    db.select().from(transactions).where(eq(transactions.userId, userId)),
    db.select().from(recurringExpenses).where(eq(recurringExpenses.userId, userId)),
    db.select().from(savingsGoals).where(eq(savingsGoals.userId, userId)),
    db.select().from(categories).where(eq(categories.userId, userId)),
  ])
  return c.json({
    transactions: userTransactions,
    recurringExpenses: userRecurring,
    savingsGoals: userGoals,
    categories: userCategories,
  })
})

/** Upsert by `id`, scoped to the authenticated user — safe to re-run on the same export. */
dataRoute.post('/import', async (c) => {
  const userId = c.get('userId')
  const parsed = importInput.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)
  const { transactions: txs, recurringExpenses: recs, savingsGoals: goals, categories: cats } = parsed.data

  await db.transaction(async (tx: Parameters<Parameters<typeof db.transaction>[0]>[0]) => {
    for (const t of txs) {
      const { id, ...rest } = t
      await tx
        .insert(transactions)
        .values({ id: id || createId(), userId, ...rest })
        .onConflictDoUpdate({ target: transactions.id, set: rest, where: eq(transactions.userId, userId) })
    }
    for (const r of recs) {
      const { id, mortgage, ...rest } = r
      const row = {
        ...rest,
        mortgagePrincipal: mortgage?.principal ?? null,
        mortgageInterestRate: mortgage?.interestRate ?? null,
        mortgageTermMonths: mortgage?.termMonths ?? null,
        mortgageStartDate: mortgage?.startDate ?? null,
      }
      await tx
        .insert(recurringExpenses)
        .values({ id: id || createId(), userId, ...row })
        .onConflictDoUpdate({ target: recurringExpenses.id, set: row, where: eq(recurringExpenses.userId, userId) })
    }
    for (const g of goals) {
      const { id, ...rest } = g
      await tx
        .insert(savingsGoals)
        .values({ id: id || createId(), userId, ...rest })
        .onConflictDoUpdate({ target: savingsGoals.id, set: rest, where: eq(savingsGoals.userId, userId) })
    }
    for (const cat of cats) {
      const { id, ...rest } = cat
      await tx
        .insert(categories)
        .values({ id: id || createId(), userId, ...rest })
        .onConflictDoUpdate({ target: categories.id, set: rest, where: eq(categories.userId, userId) })
    }
  })

  return c.body(null, 204)
})
