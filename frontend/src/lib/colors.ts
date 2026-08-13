// Lynx's <svg> rasterizes icon XML ahead of time, so `currentColor` can't
// inherit from a surrounding Tailwind `text-*` class the way it does in the
// DOM — every VyIcon needs an explicit `color` prop with a literal value.
// See @vyui/core's Icon.vue.d.ts.
export const ICON_COLOR = {
  white: '#ffffff',
  zinc300: '#d4d4d8',
  zinc400: '#a1a1aa',
  zinc500: '#71717a',
  emerald400: '#34d399',
  rose400: '#fb7185',
} as const

/** Default accent (sky-600) — same value used before the color became user-configurable. */
export const DEFAULT_ACCENT = '#0284c7'

/** Curated swatches for the accent color picker. */
export const ACCENT_PRESETS = [
  '#0284c7', // sky (default)
  '#0d9488', // teal
  '#7c3aed', // violet
  '#db2777', // pink
  '#ea580c', // orange
  '#65a30d', // lime
  '#e11d48', // rose
  '#0891b2', // cyan
] as const

function hexToHsl(hex: string): [number, number, number] {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l * 100]

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0)
      break
    case g:
      h = (b - r) / d + 2
      break
    default:
      h = (r - g) / d + 4
  }
  return [h * 60, s * 100, l * 100]
}

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100
  const lNorm = l / 100
  const k = (n: number) => (n + h / 30) % 12
  const a = sNorm * Math.min(lNorm, 1 - lNorm)
  const f = (n: number) => lNorm - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  const toHex = (n: number) =>
    Math.round(f(n) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${toHex(0)}${toHex(8)}${toHex(4)}`
}

/**
 * Derives a second gradient stop from a user-chosen base hex by rotating hue
 * ~35° and nudging lightness, mirroring the original hand-picked sky→teal
 * pairing (roughly a 35° hue shift) so any accent choice keeps that same
 * "glow" feel instead of looking like an arbitrary two-color clash.
 */
export function gradientTo(baseHex: string): string {
  const [h, s, l] = hexToHsl(baseHex)
  return hslToHex((h + 35) % 360, Math.min(100, s), Math.max(0, l - 8))
}

/**
 * Plain literal `linear-gradient(...)` string — not Tailwind's
 * `bg-gradient-to-*`/`from-*`/`to-*` utilities, which chain through two
 * levels of CSS var() indirection (`--tw-gradient-stops` referencing
 * `--tw-gradient-from`/`--tw-gradient-to`), and Lynx native only resolves one
 * level of var() — those utilities silently produce a flat, un-gradiented
 * fill on-device even though they work in the web preview.
 */
export function accentGradient(baseHex: string): string {
  return `linear-gradient(135deg, ${baseHex} 0%, ${gradientTo(baseHex)} 100%)`
}

/** Default accent gradient, for use before the theme store has loaded/hydrated. */
export const ACCENT_GRADIENT = accentGradient(DEFAULT_ACCENT)
