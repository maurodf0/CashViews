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

/**
 * Thin fetch wrapper for the app's own `/api/*` REST endpoints (not
 * better-auth's `/api/auth/*`, which has its own response shape — see
 * stores/auth.ts).
 *
 * Always call Web APIs via `globalThis.*` (`globalThis.fetch`,
 * `globalThis.Headers`, `globalThis.navigator`, …) in this codebase, never
 * as bare identifiers: Lynx's background-thread JS realm (where component/
 * store code runs) has no `window`, and — confirmed by testing — bare
 * `fetch` resolves to `undefined` there even though `globalThis.fetch` is a
 * real function. The realm's global object isn't wired into the identifier
 * scope chain the way a normal browser `window`/`globalThis` is.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new globalThis.Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await globalThis.fetch(`${API_BASE_URL}${path}`, { ...options, headers })

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
