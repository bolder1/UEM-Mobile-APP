import React, { useRef } from 'react';
import { View, StyleSheet, TextInput, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { StatusDot } from '../../components/StatusDot';
import { Dropdown } from '../../components/Dropdown';
import { useAppStore, ORG_NAME } from '../../state/store';
import { EMP_ID_PREFIX, ORG_EMAIL_DOMAIN } from '../../data/mockData';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { space, layout, control } from '../../theme/spacing';
import { type as typeScale } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Enroll'>;

const DEPARTMENTS = ['Engineering', 'Sales', 'Human Resources', 'Finance', 'Operations'];

export function EnrollmentFormScreen({ navigation }: Props) {
  const { colors, fonts } = useTheme();
  const form = useAppStore((s) => s.form);
  const formErr = useAppStore((s) => s.formErr);
  const updateForm = useAppStore((s) => s.updateForm);
  const submitForm = useAppStore((s) => s.submitForm);

  // There was no way to get from one field to the next without reaching up and
  // tapping it: no returnKeyType, no onSubmitEditing, no refs. Chain is
  // name -> email -> employee ID -> submit.
  const emailRef = useRef<TextInput>(null);
  const empIdRef = useRef<TextInput>(null);

  const onSubmit = () => {
    if (submitForm()) navigation.replace('Pending');
  };

  const inputStyle = [
    styles.input,
    { borderColor: colors.borderStrong, backgroundColor: colors.surface, color: colors.text, fontFamily: fonts.body },
  ];

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={styles.headerBlock}>
        <View style={styles.topRow}>
          <AppText variant="display" size="display" accessibilityRole="header" style={styles.title}>
            Join your organization
          </AppText>
          <Chip label="View intro" onPress={() => navigation.navigate('Onboarding')} />
        </View>
        <AppText variant="body" size="footnote" color={colors.text3}>
          Your admin reviews this request before the device is enrolled. Nothing is installed yet.
        </AppText>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
      <ScrollView style={styles.form} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
        <Field label="Full name">
          {/* `Field` renders its label as a plain sibling, so without an explicit
              accessibilityLabel every input here announced as an unlabelled text field. */}
          <TextInput
            value={form.name}
            onChangeText={(v) => updateForm({ name: v })}
            placeholder="e.g. Priya Sharma"
            placeholderTextColor={colors.muted2}
            accessibilityLabel="Full name"
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => emailRef.current?.focus()}
            style={inputStyle}
          />
        </Field>
        <Field label="Work email">
          <TextInput
            ref={emailRef}
            value={form.email}
            onChangeText={(v) => updateForm({ email: v })}
            placeholder={`you@${ORG_EMAIL_DOMAIN}`}
            placeholderTextColor={colors.muted2}
            accessibilityLabel="Work email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => empIdRef.current?.focus()}
            style={inputStyle}
          />
        </Field>
        <View style={styles.fieldRow}>
          <View style={{ flex: 1 }}>
            <Field label="Employee ID">
              <TextInput
                ref={empIdRef}
                value={form.empId}
                onChangeText={(v) => updateForm({ empId: v })}
                placeholder={`${EMP_ID_PREFIX}-0000`}
                placeholderTextColor={colors.muted2}
                accessibilityLabel="Employee ID"
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={onSubmit}
                style={inputStyle}
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
                // The visible "Department" label is a sibling, so without this
                // the trigger announces as a button called "Select".
                label="Department"
              />
            </Field>
          </View>
        </View>

        <Field label="Device ownership">
          {/* The two cards are one choice, so they announce as one group. */}
          <View style={styles.ownRow} accessibilityRole="radiogroup" accessibilityLabel="Device ownership">
            <OwnershipCard
              title="Personal"
              body="BYOD — work profile only. IT sees less."
              active={form.own === 'personal'}
              onPress={() => updateForm({ own: 'personal' })}
            />
            <OwnershipCard
              title="Company-owned"
              body="IT manages the whole device, not just work."
              active={form.own === 'company'}
              onPress={() => updateForm({ own: 'company' })}
            />
          </View>
        </Field>

        {formErr && (
          // The error used to appear in total silence to a screen reader.
          <View
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={[styles.errBox, { backgroundColor: colors.dangerTint, borderColor: colors.dangerBorder }]}
          >
            <StatusDot color={colors.danger} label="Error" labelHidden />
            <AppText variant="bodyMedium" size="caption" color={colors.dangerText} style={{ flex: 1 }}>
              Enter your full name and work email to continue.
            </AppText>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Request access" onPress={onSubmit} />
        <AppText variant="body" size="caption" color={colors.muted2} style={styles.footNote}>
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
    <View style={styles.field}>
      <AppText variant="bodySemibold" size="caption" color={colors.text3} style={{ letterSpacing: 0.2 }}>
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
    <Card
      onPress={onPress}
      // Selection was carried by borderColor alone: invisible to a screen
      // reader, and to anyone who can't separate the accent from the border.
      // Now there's a check as well as the tint, and the state is announced.
      //
      // `radio` + `checked`, not `button` + `selected`: aria-selected isn't
      // valid on a button, so it is dropped outright and the card announces
      // with no state at all. Verified in the DOM, not assumed.
      accessibilityRole="radio"
      style={{ flex: 1, borderWidth: 1.5, borderColor: active ? colors.primary : colors.borderStrong }}
      accessibilityLabel={`${title}. ${body}`}
      accessibilityState={{ checked: active }}
    >
      <View style={styles.ownHead}>
        <AppText variant="bodySemibold" size="footnote" style={{ flex: 1 }}>
          {title}
        </AppText>
        {active ? (
          <Check size={control.icon.sm} color={colors.primary} strokeWidth={2.6} />
        ) : (
          // Holds the check's place so picking one doesn't reflow the title.
          <View style={styles.checkSlot} />
        )}
      </View>
      <AppText variant="body" size="caption" color={colors.muted} style={styles.ownBody}>
        {body}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerBlock: { paddingHorizontal: layout.gutter, paddingTop: layout.screenTop },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: layout.cardGap },
  title: { marginBottom: layout.captionGap, flex: 1 },
  form: { flex: 1, paddingHorizontal: layout.gutter, paddingTop: layout.blockGap },
  formContent: { gap: layout.fieldGap, paddingBottom: space[2] },
  field: { gap: layout.labelGap },
  fieldRow: { flexDirection: 'row', gap: layout.fieldGap },
  input: {
    height: control.height.md,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: space[3],
    fontSize: typeScale.body.fontSize,
  },
  ownRow: { flexDirection: 'row', gap: layout.cardGap },
  ownHead: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  ownBody: { marginTop: layout.captionGap },
  checkSlot: { width: control.icon.sm, height: control.icon.sm },
  errBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    borderWidth: 1,
    borderRadius: 12,
    padding: layout.cardPad,
  },
  footer: { paddingHorizontal: layout.gutter, paddingTop: space[3], paddingBottom: layout.screenBottom },
  footNote: { textAlign: 'center', marginTop: layout.labelGap },
});
