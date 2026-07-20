import React from 'react';
import { View, TextInput, StyleSheet, Pressable, Platform } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { haptics } from '../utils/haptics';
import { space, touch, control } from '../theme/spacing';
import { type as typeScale } from '../theme/typography';
import { radii } from '../theme/platform';

const CLEAR = 24;

interface Props {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  /** What's being searched, e.g. "apps". Builds the field's a11y label — a bare
   *  "Search" tells a screen reader nothing about which list it filters. */
  label: string;
}

/** A real search input — case-insensitive, with an inline clear button.
 *  Replaces the decorative "search" boxes that couldn't actually search. */
export function SearchField({ value, onChangeText, placeholder = 'Search', autoFocus, label }: Props) {
  const { colors, fonts } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Search size={control.icon.md} color={colors.muted2} strokeWidth={2.2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted2}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel={`Search ${label}`}
        style={[
          styles.input,
          { color: colors.text, fontFamily: fonts.body },
          Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
        ]}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => {
            haptics.tap();
            onChangeText('');
          }}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          // 24 + 2*10 = 44. The old 20px box with slop 10 landed at 40.
          hitSlop={touch.slopFor(CLEAR)}
          style={[styles.clear, { backgroundColor: colors.surfaceSunken }]}
        >
          <X size={13} color={colors.text3} strokeWidth={2.6} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    borderWidth: 1,
    borderRadius: radii.button,
    paddingHorizontal: space[3],
    height: touch.min,
  },
  input: { flex: 1, ...typeScale.body, padding: 0, margin: 0 },
  clear: {
    width: CLEAR,
    height: CLEAR,
    borderRadius: CLEAR / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
