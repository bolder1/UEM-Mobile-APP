import React from 'react';
import { View, TextInput, StyleSheet, Pressable, Platform } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { haptics } from '../utils/haptics';

interface Props {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

/** A real search input — case-insensitive, with an inline clear button.
 *  Replaces the decorative "search" boxes that couldn't actually search. */
export function SearchField({ value, onChangeText, placeholder = 'Search', autoFocus }: Props) {
  const { colors, fonts } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Search size={16} color={colors.muted2} strokeWidth={2.2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted2}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
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
          hitSlop={10}
          style={[styles.clear, { backgroundColor: colors.surfaceSunken }]}
        >
          <X size={12} color={colors.text3} strokeWidth={2.6} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
  },
  input: { flex: 1, fontSize: 13.5, padding: 0, margin: 0 },
  clear: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
