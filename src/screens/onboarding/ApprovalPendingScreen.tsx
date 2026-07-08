import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Check } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { PulseRings, PulseDot } from '../../components/Animations';
import { useAppStore, ORG_NAME } from '../../state/store';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Pending'>;

export function ApprovalPendingScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const approved = useAppStore((s) => s.approved);
  const form = useAppStore((s) => s.form);
  const setApproved = useAppStore((s) => s.setApproved);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={styles.center}>
        {!approved ? (
          <>
            <View style={styles.badgeWrap}>
              <PulseRings size={150} color={colors.primary} />
              <View style={[styles.badgeCircle, { backgroundColor: colors.primaryTint }]}>
                <Clock size={42} color={colors.primary} strokeWidth={2} />
              </View>
            </View>
            <View style={styles.textBlock}>
              <AppText variant="display" style={styles.h1}>
                Waiting for approval
              </AppText>
              <AppText variant="body" color={colors.text3} style={styles.p}>
                Your request was sent to {ORG_NAME} IT. This usually takes a few minutes.
              </AppText>
            </View>
          </>
        ) : (
          <>
            <View style={styles.badgeWrap}>
              <View style={[styles.badgeCircle, { backgroundColor: colors.success }]}>
                <Check size={46} color="#FFFFFF" strokeWidth={2.4} />
              </View>
            </View>
            <View style={styles.textBlock}>
              <AppText variant="display" style={styles.h1}>
                You&rsquo;re approved
              </AppText>
              <AppText variant="body" color={colors.text3} style={styles.p}>
                {ORG_NAME} approved this device. A few permissions are needed next.
              </AppText>
            </View>
          </>
        )}

        <Card style={styles.stepsCard} padded={false}>
          <StepRow
            done
            title="Request submitted"
            sub={`${form.name || 'Priya Sharma'} · ${form.empId || 'ACM-1042'}`}
            bordered
          />
          <StepRow
            done={approved}
            active={!approved}
            title="Admin review"
            sub={approved ? 'Approved by admin' : 'In the admin queue…'}
            bordered
          />
          <StepRow
            done={approved}
            title="Device enrolled"
            sub={approved ? 'Work profile ready' : 'Starts after approval'}
            dim={!approved}
          />
        </Card>
      </View>

      <View style={styles.footer}>
        {approved ? (
          <Button label="Continue" onPress={() => navigation.replace('Permissions')} />
        ) : (
          <>
            <Button label="Check status" variant="secondary" onPress={() => {}} />
            <Button label="Already approved? Continue" variant="ghost" onPress={() => setApproved(true)} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function StepRow({
  done,
  active,
  title,
  sub,
  bordered,
  dim,
}: {
  done: boolean;
  active?: boolean;
  title: string;
  sub: string;
  bordered?: boolean;
  dim?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.stepRow, bordered && { borderBottomWidth: 1, borderBottomColor: colors.surfaceSunken }]}>
      {done ? (
        <View style={[styles.stepDot, { backgroundColor: colors.success }]}>
          <Check size={12} color="#FFFFFF" strokeWidth={3} />
        </View>
      ) : active ? (
        <View style={[styles.stepDotOutline, { borderColor: colors.primary }]}>
          <PulseDot color={colors.primary} size={8} />
        </View>
      ) : (
        <View style={[styles.stepDotEmpty, { borderColor: colors.borderStrong }]} />
      )}
      <View style={{ flex: 1 }}>
        <AppText variant="bodySemibold" style={{ fontSize: 13 }}>
          {title}
        </AppText>
        <AppText variant="body" color={dim ? colors.muted2 : colors.muted2} style={{ fontSize: 11.5 }}>
          {sub}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24, width: '100%', maxWidth: 480, alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 26 },
  badgeWrap: { width: 150, height: 150, alignItems: 'center', justifyContent: 'center' },
  badgeCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1D9E5F',
    shadowOpacity: 0.35,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  textBlock: { alignItems: 'center' },
  h1: { fontSize: 22, marginBottom: 8, textAlign: 'center' },
  p: { fontSize: 13.5, lineHeight: 20, textAlign: 'center', maxWidth: 280 },
  stepsCard: { width: '100%', paddingHorizontal: 16, paddingVertical: 8 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  stepDot: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  stepDotOutline: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stepDotEmpty: { width: 22, height: 22, borderRadius: 11, borderWidth: 2 },
  footer: { gap: 10, paddingBottom: 20 },
});
