import type { Context, Next } from 'hono'

import { auth } from '../auth'

declare module 'hono' {
  interface ContextVariableMap {
    userId: string
  }
}

export async function requireAuth(c: Context, next: Next) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  c.set('userId', session.user.id)
  await next()
}
