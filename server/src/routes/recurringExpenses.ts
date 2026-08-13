import { and, desc, eq } from 'drizzle-orm'
import { Hono } from 'hono'

import { db } from '../db'
import { recurringExpenses } from '../db/schema'
import { createId } from '../lib/id'
import { recurringExpenseInput } from '../lib/validation'

export const recurringExpensesRoute = new Hono()

function toRow(input: ReturnType<typeof recurringExpenseInput.parse>) {
  const { mortgage, ...rest } = input
  return {
    ...rest,
    mortgagePrincipal: mortgage?.principal ?? null,
    mortgageInterestRate: mortgage?.interestRate ?? null,
    mortgageTermMonths: mortgage?.termMonths ?? null,
    mortgageStartDate: mortgage?.startDate ?? null,
  }
}

function fromRow(row: typeof recurringExpenses.$inferSelect) {
  const { mortgagePrincipal, mortgageInterestRate, mortgageTermMonths, mortgageStartDate, ...rest } = row
  return {
    ...rest,
    mortgage:
      row.type === 'mutuo' && mortgagePrincipal != null
        ? {
            principal: mortgagePrincipal,
            interestRate: mortgageInterestRate!,
            termMonths: mortgageTermMonths!,
            startDate: mortgageStartDate!,
          }
        : undefined,
  }
}

recurringExpensesRoute.get('/', async (c) => {
  const userId = c.get('userId')
  const rows = await db
    .select()
    .from(recurringExpenses)
    .where(eq(recurringExpenses.userId, userId))
    .orderBy(desc(recurringExpenses.nextBillingDate))
  return c.json(rows.map(fromRow))
})

recurringExpensesRoute.post('/', async (c) => {
  const userId = c.get('userId')
  const parsed = recurringExpenseInput.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const row = { id: createId(), userId, ...toRow(parsed.data) }
  const [inserted] = await db.insert(recurringExpenses).values(row).returning()
  return c.json(fromRow(inserted), 201)
})

recurringExpensesRoute.patch('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')
  const parsed = recurringExpenseInput.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const [updated] = await db
    .update(recurringExpenses)
    .set(toRow(parsed.data))
    .where(and(eq(recurringExpenses.id, id), eq(recurringExpenses.userId, userId)))
    .returning()
  if (!updated) return c.json({ error: 'Not found' }, 404)
  return c.json(fromRow(updated))
})

recurringExpensesRoute.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')
  const [deleted] = await db
    .delete(recurringExpenses)
    .where(and(eq(recurringExpenses.id, id), eq(recurringExpenses.userId, userId)))
    .returning()
  if (!deleted) return c.json({ error: 'Not found' }, 404)
  return c.body(null, 204)
})
