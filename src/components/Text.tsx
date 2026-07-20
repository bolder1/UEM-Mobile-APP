import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { type as typeScale, TypeSize } from '../theme/typography';

interface Props extends TextProps {
  /** Weight + family. */
  variant?: 'display' | 'displaySemibold' | 'body' | 'bodyMedium' | 'bodySemibold' | 'bodyBold';
  /** Step on the type ramp — see `type` in theme/typography. Prefer this over a
   *  raw fontSize in `style`: it carries the matching lineHeight with it, which
   *  a bare fontSize never did.
   *
   *  Omitting it falls back to the legacy bare 14pt with no lineHeight. That
   *  fallback exists only so un-migrated call sites keep their exact metrics —
   *  applying a lineHeight to every AppText at once would silently retune the
   *  vertical rhythm of every screen. New code always passes `size`. */
  size?: TypeSize;
  color?: string;
}

export function AppText({ variant = 'body', size, color, style, ...rest }: Props) {
  const { colors, fonts } = useTheme();
  const fontFamily = fonts[variant];
  return (
    <RNText
      {...rest}
      style={[size ? typeScale[size] : styles.legacy, { fontFamily, color: color ?? colors.text }, style]}
    />
  );
}

const styles = StyleSheet.create({
  legacy: { fontSize: 14 },
});
