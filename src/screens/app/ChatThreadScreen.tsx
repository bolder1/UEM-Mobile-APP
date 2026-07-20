import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Lock, Send } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { AppText } from '../../components/Text';
import { Avatar } from '../../components/Avatar';
import { StatusDot } from '../../components/StatusDot';
import { TypingDots } from '../../components/Animations';
import { Entrance, PressableScale } from '../../components/Motion';
import { useAppStore } from '../../state/store';
import { haptics } from '../../utils/haptics';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { space, layout, touch, control } from '../../theme/spacing';
import { type as typeScale } from '../../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatThread'>;

const BACK_BTN = space[8]; // 32 — carried to the 44 target by hitSlop.

// The timestamp inside an outgoing bubble sits on `colors.primary`, a brand
// colour rather than a theme surface, so none of the text tokens apply: it has
// to be white held back off the bubble fill. This belongs in theme/colors as an
// `onPrimaryMuted` token, but that file is outside this migration's scope.
const ON_PRIMARY_MUTED = 'rgba(255,255,255,0.7)';

export function ChatThreadScreen({ route, navigation }: Props) {
  const { colors, fonts } = useTheme();
  const { chatId } = route.params;
  const chats = useAppStore((s) => s.chats);
  const messages = useAppStore((s) => s.messages[chatId] || []);
  const typing = useAppStore((s) => s.typing);
  const draft = useAppStore((s) => s.draft);
  const setDraft = useAppStore((s) => s.setDraft);
  const sendMsg = useAppStore((s) => s.sendMsg);
  const listRef = useRef<FlatList>(null);

  const chat = chats.find((c) => c.id === chatId) ?? chats[0];

  // The one condition behind the send button: it greys out, it stops responding,
  // and it announces itself as disabled off this — previously only the colour
  // changed, so the button looked dead but still took taps and told a screen
  // reader nothing.
  const canSend = draft.trim().length > 0;

  useEffect(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: false }));
  }, [messages.length, typing]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <Entrance>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <PressableScale
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={touch.slopFor(BACK_BTN)}
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={19} color={colors.text2} strokeWidth={2.4} />
          </PressableScale>
          <Avatar initials={chat.init} color={chat.color} size={control.avatar} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <AppText variant="bodySemibold" size="body">
              {chat.name}
            </AppText>
            <StatusDot color={colors.success} label={chat.sub} labelColor={colors.success} />
          </View>
          <Lock size={18} color={colors.muted2} strokeWidth={2} />
        </View>
      </Entrance>

      {/* keyboardVerticalOffset stays 0 — it is not a tuning knob here.
          KeyboardAvoidingView pads by `frame.y + frame.height - keyboardScreenY`,
          where `frame` is its own onLayout box measured against its PARENT. That
          parent is this SafeAreaView, which sits at window y=0 (the stack runs
          headerShown:false) and whose paddingTop/paddingBottom already carry both
          insets. So frame.y already includes the top inset AND the header row,
          and frame.y + frame.height already lands on the safe-area bottom edge —
          the sum is the true overlap with the keyboard. The old hardcoded 90 was
          pure surplus, lifting the composer 90pt clear of the keyboard, and
          feeding it a measured header height would double-count the header. */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {messages.length === 0 && !typing ? (
          <View style={styles.emptyWrap}>
            <Avatar initials={chat.init} color={chat.color} size={space[14]} />
            <AppText variant="bodySemibold" size="footnote" color={colors.text2} style={{ marginTop: layout.labelGap }}>
              {chat.name}
            </AppText>
            <AppText variant="body" size="caption" color={colors.muted2} style={{ marginTop: layout.captionGap }}>
              No messages yet.
            </AppText>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(_, i) => String(i)}
            // Defaults to 'never', which swallowed the first tap on the thread
            // whenever the keyboard was up: the tap dismissed the keyboard
            // instead of reaching whatever was under it.
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingVertical: layout.blockGap }}
            renderItem={({ item }) => (
              <Entrance from={8} style={[styles.bubbleRow, { justifyContent: item.mine ? 'flex-end' : 'flex-start' }]}>
                <View
                  style={[
                    styles.bubble,
                    item.mine
                      ? { backgroundColor: colors.primary, borderRadius: 16, borderBottomRightRadius: 5 }
                      : {
                          backgroundColor: colors.surface,
                          borderWidth: 1,
                          borderColor: colors.border,
                          borderRadius: 16,
                          borderBottomLeftRadius: 5,
                        },
                  ]}
                >
                  <AppText variant="body" size="footnote" color={item.mine ? colors.white : colors.text}>
                    {item.text}
                  </AppText>
                  <AppText
                    variant="body"
                    size="micro"
                    color={item.mine ? ON_PRIMARY_MUTED : colors.muted2}
                    style={{ marginTop: layout.captionGap, textAlign: 'right' }}
                  >
                    {item.t}{item.mine ? ' ✓✓' : ''}
                  </AppText>
                </View>
              </Entrance>
            )}
            ListFooterComponent={
              typing ? (
                <View style={[styles.bubbleRow, { justifyContent: 'flex-start' }]}>
                  <View style={[styles.typingBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <TypingDots color={colors.muted2} />
                  </View>
                </View>
              ) : null
            }
          />
        )}

        <Entrance delay={80}>
          <View style={styles.inputRow}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Message"
              placeholderTextColor={colors.muted2}
              accessibilityLabel="Message"
              style={[
                styles.input,
                { borderColor: colors.borderStrong, backgroundColor: colors.surface, color: colors.text, fontFamily: fonts.body },
              ]}
              onSubmitEditing={sendMsg}
              returnKeyType="send"
            />
            <PressableScale
              haptic={false}
              disabled={!canSend}
              onPress={() => {
                haptics.tap();
                sendMsg();
              }}
              accessibilityLabel="Send message"
              accessibilityState={{ disabled: !canSend }}
              style={[styles.sendBtn, { backgroundColor: canSend ? colors.primary : colors.disabled }]}
            >
              <Send size={19} color={colors.white} strokeWidth={2.2} />
            </PressableScale>
          </View>
        </Entrance>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.rowGap,
    paddingHorizontal: layout.gutter,
    paddingVertical: space[2],
    borderBottomWidth: 1,
  },
  backBtn: { width: BACK_BTN, height: BACK_BTN, alignItems: 'center', justifyContent: 'center' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: layout.gutter },
  bubbleRow: { flexDirection: 'row', paddingHorizontal: layout.gutter, marginBottom: space[2] },
  bubble: { maxWidth: '76%', paddingHorizontal: space[3], paddingVertical: space[2] },
  typingBubble: {
    borderWidth: 1,
    borderRadius: 16,
    borderBottomLeftRadius: 5,
    paddingHorizontal: space[3],
    paddingVertical: space[3],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.rowGap,
    paddingHorizontal: layout.gutter,
    paddingVertical: layout.rowPadV,
  },
  input: {
    flex: 1,
    height: touch.min,
    borderWidth: 1,
    borderRadius: touch.min / 2,
    paddingHorizontal: space[4],
    ...typeScale.body,
  },
  sendBtn: {
    width: touch.min,
    height: touch.min,
    borderRadius: touch.min / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
