import { and, desc, eq } from 'drizzle-orm'
import { Hono } from 'hono'

import { db } from '../db'
import { transactions } from '../db/schema'
import { createId } from '../lib/id'
import { transactionInput } from '../lib/validation'

export const transactionsRoute = new Hono()

transactionsRoute.get('/', async (c) => {
  const userId = c.get('userId')
  const rows = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date))
  return c.json(rows)
})

transactionsRoute.post('/', async (c) => {
  const userId = c.get('userId')
  const parsed = transactionInput.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const row = { id: createId(), userId, ...parsed.data }
  await db.insert(transactions).values(row)
  return c.json(row, 201)
})

transactionsRoute.patch('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')
  const parsed = transactionInput.partial().safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const [updated] = await db
    .update(transactions)
    .set(parsed.data)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning()
  if (!updated) return c.json({ error: 'Not found' }, 404)
  return c.json(updated)
})

transactionsRoute.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')
  const [deleted] = await db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning()
  if (!deleted) return c.json({ error: 'Not found' }, 404)
  return c.body(null, 204)
})
