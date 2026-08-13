import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { bearer, emailOTP } from 'better-auth/plugins'
import { Resend } from 'resend'

import { db } from './db'

const resend = new Resend(process.env.RESEND_API_KEY)

const OTP_SUBJECT: Record<'sign-in' | 'email-verification' | 'forget-password' | 'change-email', string> = {
  'sign-in': 'Il tuo codice di accesso',
  'email-verification': 'Verifica la tua email',
  'forget-password': 'Reimposta la password',
  'change-email': 'Conferma il cambio email',
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: (process.env.TRUSTED_ORIGINS ?? '').split(',').filter(Boolean),

  database: drizzleAdapter(db, { provider: 'sqlite' }),

  user: {
    additionalFields: {
      accentColor: {
        type: 'string',
        required: false,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
  },

  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 300,
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL ?? 'CashViews <onboarding@resend.dev>',
          to: email,
          subject: OTP_SUBJECT[type],
          html: `<p>Il tuo codice è: <strong>${otp}</strong> (valido 5 minuti)</p>`,
        })
      },
    }),
    bearer(),
  ],
})
