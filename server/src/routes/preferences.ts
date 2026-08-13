import { eq } from 'drizzle-orm'
import { Hono } from 'hono'

import { db } from '../db'
import { user } from '../db/schema'
import { preferencesInput } from '../lib/validation'

export const preferencesRoute = new Hono()

preferencesRoute.patch('/', async (c) => {
  const userId = c.get('userId')
  const parsed = preferencesInput.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error.flatten() }, 400)

  const [updated] = await db.update(user).set(parsed.data).where(eq(user.id, userId)).returning()
  return c.json({ accentColor: updated.accentColor })
})
