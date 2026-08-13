import { cors } from 'hono/cors'

const trustedOrigins = (process.env.TRUSTED_ORIGINS ?? '').split(',').filter(Boolean)

export const corsMiddleware = cors({
  origin: trustedOrigins,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
})
