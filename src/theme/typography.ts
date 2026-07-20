import { Platform } from 'react-native';

// Sora = display/headings, Inter = body/UI (matches the .dc.html font-family usage)

export const fonts = {
  display: 'Sora_700Bold',
  displaySemibold: 'Sora_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemibold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

// The type ramp. Seven steps, each a real jump — before this the app used 28
// distinct sizes and the single most common was the fractional 12.5, so
// "caption" rendered at 11.5, 12 or 12.5 depending on which file you opened.
// Half-point sizes are gone: they never survived rounding on Android anyway.
//
// Nothing legible sits below 11. Sizes are unscaled points — RN applies the
// user's font-scale on top, so these are floors, not ceilings.
export const type = {
  micro: { fontSize: 11, lineHeight: 16 }, // uppercase labels, badge counts
  caption: { fontSize: 12, lineHeight: 16 }, // secondary row text, meta
  footnote: { fontSize: 13, lineHeight: 18 }, // supporting copy
  body: { fontSize: 14, lineHeight: 20 }, // default
  callout: { fontSize: 16, lineHeight: 22 }, // buttons, screen headers
  title: { fontSize: 20, lineHeight: 26 }, // section titles
  display: { fontSize: 24, lineHeight: 30 }, // screen titles, hero
} as const;

export type TypeSize = keyof typeof type;

// Monospace for "receipt lines" — session IDs, serials, timers. System mono
// everywhere (no extra font download); tabular by nature so digits don't jitter.
export const MONO = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
}) as string;
