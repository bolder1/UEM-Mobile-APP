import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './Text';
import { BottomSheet } from './BottomSheet';
import { ListRow } from './ListRow';
import { haptics } from '../utils/haptics';
import { radii } from '../theme/platform';
import { space, layout, control } from '../theme/spacing';

interface Props {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
  title?: string;
  /** What this select chooses, e.g. "Department". Names the trigger for a screen
   *  reader — without it the control announces only its current value, which
   *  tells you what it says but not what it's for.
   *
   *  Defaulted rather than required so the one existing call site (the
   *  enrollment form's Department field) keeps compiling; new call sites should
   *  always pass it. */
  label?: string;
}

/** On-brand select — a tappable field that opens a themed bottom sheet of
 *  options, replacing the platform Picker (which renders inconsistently on web). */
export function Dropdown({
  value,
  options,
  onChange,
  placeholder = 'Select',
  title = 'Select',
  label = 'Select',
}: Props) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        onPress={() => {
          haptics.tap();
          setOpen(true);
        }}
        // The trigger is a button that owns a value and a sheet: name it, say
        // what it currently reads, and say whether the sheet is up. Previously
        // it announced none of the three.
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: value || placeholder }}
        // aria-* as well: react-native-web ignores accessibilityState outright.
        accessibilityState={{ expanded: open }}
        aria-expanded={open}
        style={({ pressed }) => [
          styles.field,
          { borderColor: colors.borderStrong, backgroundColor: colors.surface },
          pressed && { backgroundColor: colors.surfaceActive },
        ]}
      >
        <AppText variant="body" size="body" color={value ? colors.text : colors.muted2} style={styles.fieldText} numberOfLines={1}>
          {value || placeholder}
        </AppText>
        <ChevronDown size={control.icon.md} color={colors.text3} strokeWidth={2.2} />
      </Pressable>

      <BottomSheet visible={open} onClose={() => setOpen(false)} maxHeightPct={62} accessibilityLabel={title}>
        <View style={styles.header}>
          <AppText variant="displaySemibold" size="callout">
            {title}
          </AppText>
        </View>
        <View style={{ borderTopWidth: 1, borderTopColor: colors.hairline }}>
          {options.map((o) => {
            const active = o === value;
            return (
              <ListRow
                key={o}
                label={o}
                labelColor={active ? colors.primary : colors.text}
                bordered
                showChevron={false}
                onPress={() => {
                  haptics.select();
                  onChange(o);
                  setOpen(false);
                }}
                // The Check glyph and a colour swap were the only "this one is
                // picked" cues — neither reaches a screen reader.
                accessibilityState={{ selected: active }}
                right={active ? <Check size={control.icon.md} color={colors.primary} strokeWidth={2.4} /> : null}
              />
            );
          })}
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  // Matches SearchField, the app's other bare form control: 44 tall, gutter 12.
  field: {
    height: control.height.md,
    borderWidth: 1,
    borderRadius: radii.button,
    paddingHorizontal: space[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  fieldText: { flex: 1 },
  header: { paddingHorizontal: layout.sheetPad, paddingTop: space[2], paddingBottom: layout.labelGap },
});
