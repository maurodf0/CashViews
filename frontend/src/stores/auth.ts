import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { API_BASE_URL, getAuthToken, setAuthToken } from '../lib/api'
import { loadJSON, saveJSON } from '../lib/storage'

const USER_KEY = 'cashviews:auth-user'

export interface AuthUser {
  id: string
  email: string
  name: string
  emailVerified: boolean
  accentColor: string | null
}

type OtpType = 'sign-in' | 'email-verification' | 'forget-password'

function userFromResponse(u: {
  id: string
  email: string
  name: string
  emailVerified: boolean
  accentColor?: string | null
}): AuthUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    emailVerified: u.emailVerified,
    accentColor: u.accentColor ?? null,
  }
}

async function authRequest<T>(path: string, body?: unknown, init: RequestInit = {}): Promise<T> {
  const res = await globalThis.fetch(`${API_BASE_URL}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', ...init.headers },
    body: body === undefined ? undefined : JSON.stringify(body),
    ...init,
  })
  const responseBody = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(responseBody?.message ?? 'Si è verificato un errore')
  }
  return { body: responseBody, headers: res.headers } as T
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(loadJSON<AuthUser | null>(USER_KEY, null))
  const token = ref<string | null>(getAuthToken())
  const loading = ref(false)
  const sessionChecked = ref(false)

  const isAuthenticated = computed(() => token.value !== null && user.value?.emailVerified === true)

  function persistUser(value: AuthUser | null) {
    user.value = value
    saveJSON(USER_KEY, value)
  }

  function persistToken(value: string | null) {
    token.value = value
    setAuthToken(value)
  }

  async function signUp(email: string, password: string, name: string) {
    const { body } = await authRequest<{ body: { user: Parameters<typeof userFromResponse>[0] } }>(
      '/api/auth/sign-up/email',
      { email, password, name },
    )
    persistUser(userFromResponse(body.user))
  }

  async function verifyOtp(email: string, otp: string) {
    const { body } = await authRequest<{ body: { user: Parameters<typeof userFromResponse>[0] } }>(
      '/api/auth/email-otp/verify-email',
      { email, otp },
    )
    persistUser(userFromResponse(body.user))
  }

  async function resendOtp(email: string, type: OtpType = 'email-verification') {
    await authRequest('/api/auth/email-otp/send-verification-otp', { email, type })
  }

  async function signIn(email: string, password: string) {
    const { body, headers } = await authRequest<{
      body: { user: Parameters<typeof userFromResponse>[0] }
      headers: Headers
    }>('/api/auth/sign-in/email', { email, password })
    const authToken = headers.get('set-auth-token')
    if (authToken) persistToken(authToken)
    persistUser(userFromResponse(body.user))
  }

  function signOut() {
    persistToken(null)
    persistUser(null)
  }

  /** Validates the persisted token against the server on app boot; clears it if stale. */
  async function fetchSession() {
    if (!token.value) {
      sessionChecked.value = true
      return
    }
    loading.value = true
    try {
      const res = await globalThis.fetch(`${API_BASE_URL}/api/auth/get-session`, {
        headers: { Authorization: `Bearer ${token.value}` },
      })
      const body = res.ok ? await res.json().catch(() => null) : null
      if (body?.user) {
        persistUser(userFromResponse(body.user))
      } else {
        signOut()
      }
    } catch {
      // network error on boot — keep the cached user/token, the app will
      // surface 401s from apiFetch if the token turns out to be invalid
    } finally {
      loading.value = false
      sessionChecked.value = true
    }
  }

  function updateAccentColor(accentColor: string) {
    if (user.value) persistUser({ ...user.value, accentColor })
  }

  return {
    user,
    token,
    loading,
    sessionChecked,
    isAuthenticated,
    signUp,
    verifyOtp,
    resendOtp,
    signIn,
    signOut,
    fetchSession,
    updateAccentColor,
  }
})
