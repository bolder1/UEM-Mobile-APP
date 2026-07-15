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
import { TypingDots } from '../../components/Animations';
import { Entrance, PressableScale } from '../../components/Motion';
import { useAppStore } from '../../state/store';
import { haptics } from '../../utils/haptics';
import { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatThread'>;

export function ChatThreadScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const { chatId } = route.params;
  const chats = useAppStore((s) => s.chats);
  const messages = useAppStore((s) => s.messages[chatId] || []);
  const typing = useAppStore((s) => s.typing);
  const draft = useAppStore((s) => s.draft);
  const setDraft = useAppStore((s) => s.setDraft);
  const sendMsg = useAppStore((s) => s.sendMsg);
  const listRef = useRef<FlatList>(null);

  const chat = chats.find((c) => c.id === chatId) ?? chats[0];

  useEffect(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: false }));
  }, [messages.length, typing]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <Entrance>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <PressableScale onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8} accessibilityLabel="Go back">
            <ChevronLeft size={19} color={colors.text2} strokeWidth={2.4} />
          </PressableScale>
          <Avatar initials={chat.init} color={chat.color} size={38} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <AppText variant="bodySemibold" style={{ fontSize: 14.5 }}>
              {chat.name}
            </AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
              <AppText variant="body" color={colors.success} style={{ fontSize: 11 }}>
                {chat.sub}
              </AppText>
            </View>
          </View>
          <Lock size={18} color={colors.muted2} strokeWidth={2} />
        </View>
      </Entrance>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        {messages.length === 0 && !typing ? (
          <View style={styles.emptyWrap}>
            <Avatar initials={chat.init} color={chat.color} size={56} />
            <AppText variant="bodySemibold" color={colors.text2} style={{ fontSize: 13.5, marginTop: 9 }}>
              {chat.name}
            </AppText>
            <AppText variant="body" color={colors.muted2} style={{ fontSize: 12, marginTop: 4 }}>
              No messages yet — start the conversation.
            </AppText>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(_, i) => String(i)}
            contentContainerStyle={{ paddingVertical: 16 }}
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
                  <AppText variant="body" color={item.mine ? '#FFFFFF' : colors.text} style={{ fontSize: 13.5, lineHeight: 19 }}>
                    {item.text}
                  </AppText>
                  <AppText
                    variant="body"
                    color={item.mine ? 'rgba(255,255,255,0.7)' : colors.muted2}
                    style={{ fontSize: 10, marginTop: 4, textAlign: 'right' }}
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
              style={[styles.input, { borderColor: colors.borderStrong, backgroundColor: colors.surface, color: colors.text }]}
              onSubmitEditing={sendMsg}
              returnKeyType="send"
            />
            <PressableScale
              haptic={false}
              onPress={() => {
                if (draft.trim()) haptics.tap();
                sendMsg();
              }}
              accessibilityLabel="Send message"
              style={[styles.sendBtn, { backgroundColor: draft.trim() ? colors.primary : colors.disabled }]}
            >
              <Send size={19} color="#FFFFFF" strokeWidth={2.2} />
            </PressableScale>
          </View>
        </Entrance>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1 },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  onlineDot: { width: 6, height: 6, borderRadius: 3 },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, paddingHorizontal: 16 },
  bubbleRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8 },
  bubble: { maxWidth: '76%', paddingHorizontal: 13, paddingVertical: 9 },
  typingBubble: { borderWidth: 1, borderRadius: 16, borderBottomLeftRadius: 5, paddingHorizontal: 14, paddingVertical: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 10 },
  input: { flex: 1, height: 44, borderWidth: 1, borderRadius: 22, paddingHorizontal: 16, fontSize: 14, fontFamily: 'Inter_400Regular' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
