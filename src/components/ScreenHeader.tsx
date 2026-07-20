import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft, Menu } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { AppText } from './Text';
import { radii } from '../theme/platform';
import { space, layout, touch } from '../theme/spacing';

const BOX = 38;

interface Props {
  title: string;
  /** Secondary line under the title. */
  sub?: string;
  /** Back chevron. Omit on a screen that is the root of its stack. */
  onBack?: () => void;
  /** Drawer menu, for tab roots that have nowhere to go back to. Mutually
   *  exclusive with `onBack` — a screen offers one or the other, never both. */
  onMenu?: () => void;
  /** Trailing action, e.g. "Mark all read" or a filter button. */
  right?: React.ReactNode;
  /** Screen titles are `display` size; a pushed detail header is `callout`. */
  size?: 'display' | 'callout';
}

/** The one screen header. Was adopted by 8/19 screens — every one of them in
 *  overlays/ — while all of app/ and onboarding/ hand-rolled their own, which
 *  is how the app ended up with four different back-button geometries (38, 32,
 *  32 and 30, with chevrons at 17, 22, 19 and 15).
 *
 *  The trailing `right` slot is why they couldn't adopt it: Notifications and
 *  Files both need an action beside the title, and the old two-prop API had
 *  nowhere to put one. */
export function ScreenHeader({ title, sub, onBack, onMenu, right, size = 'callout' }: Props) {
  const { colors } = useTheme();
  const nav = onBack ?? onMenu;
  const NavIcon = onBack ? ChevronLeft : Menu;

  return (
    <View style={styles.row}>
      {nav ? (
        <Pressable
          onPress={nav}
          accessibilityRole="button"
          accessibilityLabel={onBack ? 'Go back' : 'Open menu'}
          hitSlop={touch.slopFor(BOX)}
          style={({ pressed }) => [
            styles.nav,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              transform: [{ scale: pressed ? 0.92 : 1 }],
            },
          ]}
        >
          <NavIcon size={18} color={colors.text2} strokeWidth={2.4} />
        </Pressable>
      ) : null}

      <View style={styles.titleCol}>
        <AppText variant="displaySemibold" size={size} numberOfLines={1} accessibilityRole="header">
          {title}
        </AppText>
        {sub ? (
          <AppText variant="body" size="caption" color={colors.muted} numberOfLines={2}>
            {sub}
          </AppText>
        ) : null}
      </View>

      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingBottom: layout.blockGap,
    minHeight: touch.min,
  },
  titleCol: { flex: 1, gap: 2 },
  nav: {
    width: BOX,
    height: BOX,
    borderRadius: radii.tile,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
