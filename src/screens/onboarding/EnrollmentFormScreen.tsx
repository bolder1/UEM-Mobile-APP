import React from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Button } from '../../components/Button';
import { Dropdown } from '../../components/Dropdown';
import { useAppStore, ORG_NAME } from '../../state/store';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Enroll'>;

const DEPARTMENTS = ['Engineering', 'Sales', 'Human Resources', 'Finance', 'Operations'];

export function EnrollmentFormScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const form = useAppStore((s) => s.form);
  const formErr = useAppStore((s) => s.formErr);
  const updateForm = useAppStore((s) => s.updateForm);
  const submitForm = useAppStore((s) => s.submitForm);

  const onSubmit = () => {
    if (submitForm()) navigation.replace('Pending');
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={styles.headerBlock}>
        <View style={styles.topRow}>
          <AppText variant="display" style={styles.title}>
            Join your organization
          </AppText>
          <Pressable onPress={() => navigation.navigate('Onboarding')} hitSlop={8} style={[styles.introBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <AppText variant="bodySemibold" color={colors.text3} style={{ fontSize: 11.5 }}>
              View intro
            </AppText>
          </Pressable>
        </View>
        <AppText variant="body" color={colors.text3} style={styles.subtitle}>
          Your admin reviews this request before the device is enrolled. Nothing is installed yet.
        </AppText>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
      <ScrollView style={styles.form} contentContainerStyle={{ gap: 14, paddingBottom: 8 }} keyboardShouldPersistTaps="handled">
        <Field label="Full name">
          <TextInput
            value={form.name}
            onChangeText={(v) => updateForm({ name: v })}
            placeholder="e.g. Priya Sharma"
            placeholderTextColor={colors.muted2}
            style={[styles.input, { borderColor: colors.borderStrong, backgroundColor: colors.surface, color: colors.text }]}
          />
        </Field>
        <Field label="Work email">
          <TextInput
            value={form.email}
            onChangeText={(v) => updateForm({ email: v })}
            placeholder="you@company.com"
            placeholderTextColor={colors.muted2}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, { borderColor: colors.borderStrong, backgroundColor: colors.surface, color: colors.text }]}
          />
        </Field>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Field label="Employee ID">
              <TextInput
                value={form.empId}
                onChangeText={(v) => updateForm({ empId: v })}
                placeholder="ACM-0000"
                placeholderTextColor={colors.muted2}
                style={[styles.input, { borderColor: colors.borderStrong, backgroundColor: colors.surface, color: colors.text }]}
              />
            </Field>
          </View>
          <View style={{ flex: 1 }}>
            <Field label="Department">
              <Dropdown
                value={form.dept}
                options={DEPARTMENTS}
                onChange={(v) => updateForm({ dept: v })}
                title="Select department"
              />
            </Field>
          </View>
        </View>

        <Field label="Device ownership">
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <OwnershipCard
              title="Personal"
              body="BYOD — work profile only. IT sees less."
              active={form.own === 'personal'}
              onPress={() => updateForm({ own: 'personal' })}
            />
            <OwnershipCard
              title="Company-owned"
              body={`Fully managed by ${ORG_NAME}.`}
              active={form.own === 'company'}
              onPress={() => updateForm({ own: 'company' })}
            />
          </View>
        </Field>

        {formErr && (
          <View style={[styles.errBox, { backgroundColor: colors.dangerTint, borderColor: colors.dangerBorder }]}>
            <View style={[styles.errDot, { backgroundColor: colors.danger }]} />
            <AppText variant="bodyMedium" color={colors.dangerText} style={{ fontSize: 12.5, flex: 1 }}>
              Enter your full name and work email to continue.
            </AppText>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Request access" onPress={onSubmit} />
        <AppText variant="body" color={colors.muted2} style={styles.footNote}>
          Sent to {ORG_NAME} IT for approval. Nothing is installed yet.
        </AppText>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <AppText variant="bodySemibold" color={colors.text3} style={{ fontSize: 12, letterSpacing: 0.2 }}>
        {label}
      </AppText>
      {children}
    </View>
  );
}

function OwnershipCard({
  title,
  body,
  active,
  onPress,
}: {
  title: string;
  body: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.ownCard,
        { borderColor: active ? colors.primary : colors.borderStrong, backgroundColor: colors.surface },
      ]}
    >
      <AppText variant="bodySemibold" style={{ fontSize: 13.5, marginBottom: 2 }}>
        {title}
      </AppText>
      <AppText variant="body" color={colors.muted} style={{ fontSize: 11.5, lineHeight: 16 }}>
        {body}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerBlock: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 6 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  introBtn: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6, marginTop: 4 },
  title: { fontSize: 23, marginBottom: 6, flex: 1 },
  subtitle: { fontSize: 13.5, lineHeight: 19 },
  form: { flex: 1, paddingHorizontal: 24, paddingTop: 14 },
  input: { height: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, fontSize: 14.5, fontFamily: 'Inter_400Regular' },
  ownCard: { flex: 1, borderWidth: 1.5, borderRadius: 14, padding: 12 },
  errBox: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 12, padding: 12 },
  errDot: { width: 7, height: 7, borderRadius: 3.5 },
  footer: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 12 : 20 },
  footNote: { fontSize: 11.5, textAlign: 'center', marginTop: 12, lineHeight: 16 },
});
