import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './Text';
import { BottomSheet } from './BottomSheet';
import { haptics } from '../utils/haptics';

interface Props {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
  title?: string;
}

/** On-brand select — a tappable field that opens a themed bottom sheet of
 *  options, replacing the platform Picker (which renders inconsistently on web). */
export function Dropdown({ value, options, onChange, placeholder = 'Select', title = 'Select' }: Props) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        onPress={() => {
          haptics.tap();
          setOpen(true);
        }}
        style={({ pressed }) => [
          styles.field,
          { borderColor: colors.borderStrong, backgroundColor: colors.surface },
          pressed && { backgroundColor: colors.surfaceActive },
        ]}
      >
        <AppText variant="body" color={value ? colors.text : colors.muted2} style={{ fontSize: 14.5, flex: 1 }} numberOfLines={1}>
          {value || placeholder}
        </AppText>
        <ChevronDown size={17} color={colors.text3} strokeWidth={2.2} />
      </Pressable>

      <BottomSheet visible={open} onClose={() => setOpen(false)} maxHeightPct={62}>
        <View style={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 10 }}>
          <AppText variant="displaySemibold" style={{ fontSize: 16 }}>
            {title}
          </AppText>
        </View>
        <View style={{ borderTopWidth: 1, borderTopColor: colors.hairline }}>
          {options.map((o) => {
            const active = o === value;
            return (
              <Pressable
                key={o}
                onPress={() => {
                  haptics.select();
                  onChange(o);
                  setOpen(false);
                }}
                style={({ pressed }) => [
                  styles.opt,
                  { borderBottomColor: colors.hairline2 },
                  pressed && { backgroundColor: colors.surfaceActive },
                ]}
              >
                <AppText variant="bodyMedium" color={active ? colors.primary : colors.text} style={{ fontSize: 14, flex: 1 }}>
                  {o}
                </AppText>
                {active ? <Check size={17} color={colors.primary} strokeWidth={2.4} /> : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  field: { height: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  opt: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1 },
});
