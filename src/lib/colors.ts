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
  teal: '#0d9488',
} as const

// Signature accent: steel-blue (sky-600) fading into teal-600 — the same
// "glow" gradient pairing used on maurodefalco.it. Kept as a plain literal
// gradient (not Tailwind's bg-gradient-to-*/from-*/to-* utilities) because
// those chain through two levels of CSS var() indirection
// (--tw-gradient-stops referencing --tw-gradient-from/to), and Lynx native
// only resolves one level of var() — the utility classes silently produce a
// flat, un-gradiented fill on-device even though they work in the web preview.
export const ACCENT_GRADIENT = 'linear-gradient(135deg, #0284c7 0%, #0d9488 100%)'
