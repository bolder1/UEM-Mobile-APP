import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AuditLine } from '../../components/AuditLine';
import { EmptyState } from '../../components/EmptyState';
import { Button } from '../../components/Button';
import { useAppStore, findAudit } from '../../state/store';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { space, layout } from '../../theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Left'>;

export function UnenrolledScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const resetAll = useAppStore((s) => s.resetAll);
  const activity = useAppStore((s) => s.activity);

  // Removal is the Critical-tier action in this app and it used to land here in
  // total silence — no toast, no line, no way to check it was recorded. This is
  // the state that outlives the action, so the receipt belongs on it.
  const removeAudit = findAudit(activity, 'enroll', ['Device removed from management']);

  const setupAgain = () => {
    resetAll();
    navigation.reset({ index: 0, routes: [{ name: 'Onboarding' }] });
  };

  // Icon circle + title + body + one action *is* an EmptyState — it was hand-rolled
  // here with its own 96px circle, 21pt title and a 32px gutter, none of which the
  // rest of the app shares.
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={styles.center}>
        <EmptyState
          icon={<LogOut size={22} color={colors.muted} strokeWidth={2} />}
          title="Device removed from management"
          body="Work apps, files and the secure tunnel were removed. Your personal data was not touched."
          action={
            <View style={styles.actions}>
              {removeAudit ? (
                <AuditLine
                  time={removeAudit.time}
                  actor={removeAudit.actor}
                  onPress={() => navigation.navigate('Activity')}
                />
              ) : null}
              <Button label="Set up again" onPress={setupAgain} style={styles.cta} />
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: layout.gutter },
  center: { flex: 1, justifyContent: 'center' },
  // The audit line reads as a note above the action, not a second button.
  actions: { alignItems: 'center', gap: layout.blockGap },
  // EmptyState centers its action, so the Button sizes to its label — give it
  // the horizontal padding a standalone button would otherwise get from a
  // full-width footer.
  cta: { paddingHorizontal: space[8] },
});
