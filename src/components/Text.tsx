import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface Props extends TextProps {
  variant?: 'display' | 'displaySemibold' | 'body' | 'bodyMedium' | 'bodySemibold' | 'bodyBold';
  color?: string;
}

export function AppText({ variant = 'body', color, style, ...rest }: Props) {
  const { colors, fonts } = useTheme();
  const fontFamily = fonts[variant];
  return (
    <RNText
      {...rest}
      style={[styles.base, { fontFamily, color: color ?? colors.text }, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: { fontSize: 14 },
});
