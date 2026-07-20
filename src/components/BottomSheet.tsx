import React from 'react';
import { Modal, View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { radii } from '../theme/platform';
import { space, layout } from '../theme/spacing';

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeightPct?: number;
  /** Announced when the sheet opens, and used as the backdrop's dismiss label. */
  accessibilityLabel: string;
}

/** The one sheet. Owns three things every caller used to redo by hand:
 *
 *  1. The bottom safe-area inset. The sheet is bottom-anchored, so it sits
 *     directly over the home indicator; all 11 callers were each hardcoding
 *     their own trailing pad (20, 28 or 32) and the ones that guessed 20 put
 *     their primary button under the indicator.
 *  2. Modal isolation. Without `accessibilityViewIsModal`, VoiceOver walks
 *     straight past the sheet into the screen behind it — which for a consent
 *     or confirm sheet means the user can act on a screen they can't see.
 *  3. Sliding up. It used to cross-fade, which reads as a dialog, not a sheet,
 *     and made the grab handle a lie. */
export function BottomSheet({ visible, onClose, children, maxHeightPct, accessibilityLabel }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={`Close ${accessibilityLabel}`}
      >
        <Pressable
          accessibilityViewIsModal
          accessibilityLabel={accessibilityLabel}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              maxHeight: maxHeightPct ? `${maxHeightPct}%` : undefined,
              paddingBottom: insets.bottom + layout.screenBottom,
            },
          ]}
          // Taps inside the sheet must not reach the dismissing backdrop.
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handleWrap} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
          </View>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(16,24,40,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    overflow: 'hidden',
  },
  handleWrap: { alignItems: 'center', paddingTop: space[3], paddingBottom: space[1] },
  handle: { width: space[10], height: space[1], borderRadius: 99 },
});
