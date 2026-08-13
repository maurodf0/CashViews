import { sql } from 'drizzle-orm'
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

import { user } from './auth-schema'

/**
 * App tables, all scoped by `userId`. better-auth's own tables (user, session,
 * account, verification) live in ./auth-schema.ts, generated via
 * `npm run auth:generate` from the `betterAuth()` config in ../auth.ts — don't
 * hand-edit that file, regenerate it whenever auth.ts's plugins change.
 */

export const transactions = sqliteTable(
  'transactions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: ['entrata', 'uscita'] }).notNull(),
    amount: real('amount').notNull(),
    categoryId: text('category_id').notNull(),
    note: text('note').notNull().default(''),
    date: text('date').notNull(), // ISO date
    createdAt: text('created_at')
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (t) => [index('transactions_user_id_idx').on(t.userId), index('transactions_user_date_idx').on(t.userId, t.date)],
)

export const recurringExpenses = sqliteTable(
  'recurring_expenses',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: text('type', { enum: ['abbonamento', 'bolletta', 'mutuo', 'altro'] }).notNull(),
    name: text('name').notNull(),
    amount: real('amount').notNull(),
    cycle: text('cycle', { enum: ['mensile', 'annuale'] }).notNull(),
    nextBillingDate: text('next_billing_date').notNull(),
    icon: text('icon').notNull(),
    color: text('color').notNull(),
    // Only set when type === 'mutuo'.
    mortgagePrincipal: real('mortgage_principal'),
    mortgageInterestRate: real('mortgage_interest_rate'),
    mortgageTermMonths: integer('mortgage_term_months'),
    mortgageStartDate: text('mortgage_start_date'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (t) => [index('recurring_expenses_user_id_idx').on(t.userId)],
)

/** `userId = NULL` marks a built-in/global category; non-null is a user's custom one. */
export const categories = sqliteTable(
  'categories',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    kind: text('kind', { enum: ['entrata', 'uscita'] }).notNull(),
    icon: text('icon').notNull(),
    color: text('color').notNull(),
  },
  (t) => [index('categories_user_id_idx').on(t.userId)],
)

export const savingsGoals = sqliteTable(
  'savings_goals',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    target: real('target').notNull(),
    current: real('current').notNull().default(0),
    createdAt: text('created_at')
      .notNull()
      .default(sql`(current_timestamp)`),
  },
  (t) => [index('savings_goals_user_id_idx').on(t.userId)],
)

export * from './auth-schema'
