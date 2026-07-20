import React from 'react';
import { View, Pressable, StyleSheet, AccessibilityState } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './Text';
import { ripple } from '../theme/platform';
import { layout, touch, control } from '../theme/spacing';

interface Props {
  /** Leading slot — an IconTile, Avatar, or bare icon. */
  icon?: React.ReactNode;
  label: string;
  /** Secondary line under the label. */
  sub?: string;
  labelColor?: string;
  /** Trailing slot, before the chevron — a value, badge, toggle or IconButton. */
  right?: React.ReactNode;
  /** Set when `right` holds its own control (a ToggleSwitch, an IconButton).
   *
   *  iOS collapses the children of an accessible Pressable into ONE focusable
   *  node, so an action nested inside a tappable row is unreachable by
   *  VoiceOver — the row swallows it. When this is set, the press area shrinks
   *  to the icon + text and `right` sits outside it as its own a11y node, which
   *  is what a row with two distinct actions actually is.
   *
   *  Rows like this never take a chevron: the trailing control is the affordance. */
  rightInteractive?: boolean;
  onPress?: () => void;
  showChevron?: boolean;
  bordered?: boolean;
  disabled?: boolean;
  /** Defaults to "label, sub". Override only when the visible text isn't the
   *  whole story — e.g. a row whose trailing slot carries the real meaning. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityState?: AccessibilityState;
}

/** The one list row. Before this, 15 screens hand-rolled their own across 6
 *  vertical and 5 horizontal paddings, so no two lists in the app agreed on row
 *  height — and none of them announced anything to a screen reader.
 *
 *  Geometry is fixed here on purpose (`layout.rowPad*` + a `touch.min` floor).
 *  Callers choose the slots, never the spacing. */
export function ListRow({
  icon,
  label,
  sub,
  labelColor,
  right,
  rightInteractive,
  onPress,
  showChevron = true,
  bordered,
  disabled,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
}: Props) {
  const { colors } = useTheme();
  const chevron = showChevron && !!onPress && !rightInteractive;
  const border = bordered ? { borderBottomWidth: 1, borderBottomColor: colors.hairline } : null;

  const text = (
    <>
      {icon}
      <View style={styles.textCol}>
        <AppText variant="bodyMedium" size="body" color={labelColor ?? colors.text} numberOfLines={2}>
          {label}
        </AppText>
        {sub ? (
          <AppText variant="body" size="caption" color={colors.muted} numberOfLines={2}>
            {sub}
          </AppText>
        ) : null}
      </View>
    </>
  );

  const state = { disabled: !!disabled, ...accessibilityState };
  const a11y = {
    accessibilityRole: 'button' as const,
    accessibilityLabel: accessibilityLabel ?? (sub ? `${label}, ${sub}` : label),
    accessibilityHint,
    // Both, deliberately — see ToggleSwitch. react-native-web ignores
    // `accessibilityState`, so state has to be mirrored onto the aria props.
    accessibilityState: state,
    'aria-checked': state.checked,
    'aria-selected': state.selected,
    'aria-disabled': state.disabled,
    'aria-expanded': state.expanded,
  };

  // Inert row: children stay individually focusable for free.
  if (!onPress) {
    return (
      <View style={[styles.row, border]}>
        {text}
        {right}
      </View>
    );
  }

  // Tappable row + its own trailing control: two nodes, side by side.
  if (rightInteractive) {
    return (
      <View style={[styles.row, border]}>
        <Pressable
          onPress={onPress}
          disabled={disabled}
          {...a11y}
          android_ripple={ripple(colors.surfaceActive) ?? undefined}
          style={({ pressed }) => [
            styles.pressArea,
            pressed ? { backgroundColor: colors.surfaceHover } : null,
          ]}
        >
          {text}
        </Pressable>
        {right}
      </View>
    );
  }

  // Tappable row, inert trailing content: one node, whole row.
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      {...a11y}
      android_ripple={ripple(colors.surfaceActive) ?? undefined}
      style={({ pressed }) => [styles.row, border, pressed ? { backgroundColor: colors.surfaceHover } : null]}
    >
      {text}
      {right}
      {chevron ? <ChevronRight size={control.icon.sm} color={colors.faint} strokeWidth={2.2} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.rowGap,
    paddingVertical: layout.rowPadV,
    paddingHorizontal: layout.rowPadH,
    minHeight: touch.min,
  },
  // The row's own padding lives on the parent in this mode, so the press area
  // only needs to claim the leftover width.
  pressArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.rowGap,
  },
  // 2 is the one deliberate off-grid value in the app: a label and its own
  // caption are one object, and 4 already reads as a separation between them.
  textCol: { flex: 1, gap: 2 },
});
