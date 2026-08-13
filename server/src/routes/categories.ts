import { and, eq, isNull, or } from 'drizzle-orm'
import { Hono } from 'hono'

import { db } from '../db'
import { categories } from '../db/schema'
import { createId } from '../lib/id'
import { categoryInput } from '../lib/validation'

export const categoriesRoute = new Hono()

categoriesRoute.get('/', async (c) => {
  const userId = c.get('userId')
  const rows = await db
    .select()
    .from(categories)
    .where(or(eq(categories.userId, userId), isNull(categories.userId)))
  return c.json(rows)
})

categoriesRoute.post('/', async (c) => {
  const userId = c.get('userId')
  const parsed = categoryInput.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const row = { id: createId(), userId, ...parsed.data }
  await db.insert(categories).values(row)
  return c.json(row, 201)
})

categoriesRoute.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')
  // userId equality (not OR-null) means built-in rows can never match, so
  // attempting to delete one 404s rather than silently no-op-ing.
  const [deleted] = await db
    .delete(categories)
    .where(and(eq(categories.id, id), eq(categories.userId, userId)))
    .returning()
  if (!deleted) return c.json({ error: 'Not found' }, 404)
  return c.body(null, 204)
})
