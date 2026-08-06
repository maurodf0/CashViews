/**
 * Cross-runtime persistence. `localStorage` is used whenever it's present (the Web
 * Preview target runs in a real browser). On native Lynx there is no `localStorage`,
 * so we fall back to `lynx.setSessionStorageItem`/`getSessionStorageItem` — but that
 * binding can exist as a function while still throwing at call time if the native
 * host hasn't implemented it (observed on the web-preview JS runtime), so every call
 * is wrapped in try/catch with an in-memory map as the last resort.
 */

declare const lynx:
  | {
      setSessionStorageItem?: (key: string, value: string) => void
      getSessionStorageItem?: (key: string) => string | null | undefined
    }
  | undefined

const memoryStore = new Map<string, string>()

function hasLocalStorage(): boolean {
  try {
    return typeof localStorage !== 'undefined'
  } catch {
    return false
  }
}

function readRaw(key: string): string | null {
  if (hasLocalStorage()) {
    try {
      return localStorage.getItem(key)
    } catch {
      // fall through
    }
  }
  if (typeof lynx !== 'undefined' && typeof lynx.getSessionStorageItem === 'function') {
    try {
      return lynx.getSessionStorageItem(key) ?? null
    } catch {
      // native host doesn't actually implement it — fall through
    }
  }
  return memoryStore.get(key) ?? null
}

function writeRaw(key: string, value: string): void {
  if (hasLocalStorage()) {
    try {
      localStorage.setItem(key, value)
      return
    } catch {
      // fall through
    }
  }
  if (typeof lynx !== 'undefined' && typeof lynx.setSessionStorageItem === 'function') {
    try {
      lynx.setSessionStorageItem(key, value)
      return
    } catch {
      // native host doesn't actually implement it — fall through
    }
  }
  memoryStore.set(key, value)
}

export function loadJSON<T>(key: string, fallback: T): T {
  const raw = readRaw(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveJSON<T>(key: string, value: T): void {
  writeRaw(key, JSON.stringify(value))
}
