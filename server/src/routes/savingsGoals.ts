import { and, eq } from 'drizzle-orm'
import { Hono, type Context } from 'hono'

import { db } from '../db'
import { savingsGoals } from '../db/schema'
import { createId } from '../lib/id'
import { savingsGoalAdjustInput, savingsGoalInput } from '../lib/validation'

export const savingsGoalsRoute = new Hono()

savingsGoalsRoute.get('/', async (c) => {
  const userId = c.get('userId')
  const rows = await db.select().from(savingsGoals).where(eq(savingsGoals.userId, userId))
  return c.json(rows)
})

savingsGoalsRoute.post('/', async (c) => {
  const userId = c.get('userId')
  const parsed = savingsGoalInput.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const row = { id: createId(), userId, ...parsed.data }
  await db.insert(savingsGoals).values(row)
  return c.json(row, 201)
})

savingsGoalsRoute.patch('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')
  const parsed = savingsGoalInput.partial().safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const [updated] = await db
    .update(savingsGoals)
    .set(parsed.data)
    .where(and(eq(savingsGoals.id, id), eq(savingsGoals.userId, userId)))
    .returning()
  if (!updated) return c.json({ error: 'Not found' }, 404)
  return c.json(updated)
})

async function adjust(c: Context, sign: 1 | -1) {
  const userId = c.get('userId')
  const id = c.req.param('id') ?? ''
  const parsed = savingsGoalAdjustInput.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const [existing] = await db
    .select()
    .from(savingsGoals)
    .where(and(eq(savingsGoals.id, id), eq(savingsGoals.userId, userId)))
  if (!existing) return c.json({ error: 'Not found' }, 404)

  const current = Math.max(0, existing.current + sign * parsed.data.amount)
  const [updated] = await db
    .update(savingsGoals)
    .set({ current })
    .where(and(eq(savingsGoals.id, id), eq(savingsGoals.userId, userId)))
    .returning()
  return c.json(updated)
}

savingsGoalsRoute.post('/:id/deposit', (c) => adjust(c, 1))
savingsGoalsRoute.post('/:id/withdraw', (c) => adjust(c, -1))

savingsGoalsRoute.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')
  const [deleted] = await db
    .delete(savingsGoals)
    .where(and(eq(savingsGoals.id, id), eq(savingsGoals.userId, userId)))
    .returning()
  if (!deleted) return c.json({ error: 'Not found' }, 404)
  return c.body(null, 204)
})
