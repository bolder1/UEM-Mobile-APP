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

// Monospace for "receipt lines" — session IDs, serials, timers. System mono
// everywhere (no extra font download); tabular by nature so digits don't jitter.
export const MONO = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
}) as string;
