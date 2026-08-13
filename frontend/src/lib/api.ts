import { loadJSON, saveJSON } from './storage'

const TOKEN_KEY = 'cashviews:auth-token'

/** Bearer token, not a cookie — see auth.ts's bearer() plugin: Lynx's native
 * runtime has no reliable Set-Cookie/credentialed-fetch support, mirroring
 * why storage.ts exists at all. The client owns the token explicitly. */
export const API_BASE_URL: string = import.meta.env.PUBLIC_API_BASE_URL ?? 'http://localhost:8787'

let token: string | null = loadJSON<string | null>(TOKEN_KEY, null)

export function getAuthToken(): string | null {
  return token
}

export function setAuthToken(value: string | null): void {
  token = value
  saveJSON(TOKEN_KEY, value)
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

/** Thin fetch wrapper for the app's own `/api/*` REST endpoints (not better-auth's `/api/auth/*`, which has its own response shape — see stores/auth.ts). */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    setAuthToken(null)
    throw new ApiError(401, 'Sessione scaduta')
  }
  if (!res.ok) {
    let message = res.statusText
    try {
      const body = await res.json()
      message = typeof body?.error === 'string' ? body.error : JSON.stringify(body?.error ?? body)
    } catch {
      // response body wasn't JSON — keep statusText
    }
    throw new ApiError(res.status, message)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
