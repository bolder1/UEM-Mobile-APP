import React from 'react';
import { Modal, View, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxHeightPct?: number;
}

export function BottomSheet({ visible, onClose, children, maxHeightPct }: Props) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: colors.surface, maxHeight: maxHeightPct ? `${maxHeightPct}%` : undefined },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handleWrap}>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 2 },
  handle: { width: 38, height: 4, borderRadius: 99 },
});
