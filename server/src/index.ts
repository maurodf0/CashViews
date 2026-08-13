import { serve } from '@hono/node-server'
import { Hono } from 'hono'

import { auth } from './auth'
import { corsMiddleware } from './middleware/cors'
import { requireAuth } from './middleware/requireAuth'
import { categoriesRoute } from './routes/categories'
import { dataRoute } from './routes/data'
import { preferencesRoute } from './routes/preferences'
import { recurringExpensesRoute } from './routes/recurringExpenses'
import { savingsGoalsRoute } from './routes/savingsGoals'
import { transactionsRoute } from './routes/transactions'

const app = new Hono()

app.use('*', corsMiddleware)

app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))

app.use('/api/*', requireAuth)
app.route('/api/transactions', transactionsRoute)
app.route('/api/recurring-expenses', recurringExpensesRoute)
app.route('/api/categories', categoriesRoute)
app.route('/api/savings-goals', savingsGoalsRoute)
app.route('/api/preferences', preferencesRoute)
app.route('/api', dataRoute)

app.get('/health', (c) => c.json({ ok: true }))

const port = Number(process.env.PORT ?? 8787)
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`CashViews server listening on http://localhost:${info.port}`)
})
