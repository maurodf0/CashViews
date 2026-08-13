import { z } from 'zod'

export const transactionInput = z.object({
  kind: z.enum(['entrata', 'uscita']),
  amount: z.number().positive(),
  categoryId: z.string().min(1),
  note: z.string().default(''),
  date: z.string().min(1),
})

export const recurringExpenseInput = z.object({
  type: z.enum(['abbonamento', 'bolletta', 'mutuo', 'altro']),
  name: z.string().min(1),
  amount: z.number().nonnegative(),
  cycle: z.enum(['mensile', 'annuale']),
  nextBillingDate: z.string().min(1),
  icon: z.string().min(1),
  color: z.string().min(1),
  mortgage: z
    .object({
      principal: z.number().positive(),
      interestRate: z.number().nonnegative(),
      termMonths: z.number().int().positive(),
      startDate: z.string().min(1),
    })
    .optional(),
})

export const categoryInput = z.object({
  label: z.string().min(1),
  kind: z.enum(['entrata', 'uscita']),
  icon: z.string().min(1),
  color: z.string().min(1),
})

export const savingsGoalInput = z.object({
  name: z.string().min(1),
  target: z.number().nonnegative(),
  current: z.number().nonnegative().default(0),
})

export const savingsGoalAdjustInput = z.object({
  amount: z.number().positive(),
})

export const importInput = z.object({
  transactions: z.array(transactionInput.extend({ id: z.string() })).default([]),
  recurringExpenses: z.array(recurringExpenseInput.extend({ id: z.string() })).default([]),
  savingsGoals: z.array(savingsGoalInput.extend({ id: z.string() })).default([]),
  categories: z.array(categoryInput.extend({ id: z.string() })).default([]),
})

export const preferencesInput = z.object({
  accentColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
})
