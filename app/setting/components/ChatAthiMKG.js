import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, KeyboardAvoidingView, Platform, RefreshControl, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Center, HStack, Text, VStack } from 'native-base';
import { ArrowLeft, Copy, CopySuccess, Send2, Whatsapp } from 'iconsax-react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Clipboard from 'expo-clipboard';

import { COLORS } from '../../../src/constants/colors';
import { getChatAthiHistory, sendChatAthiMessage } from '../../../src/services/api/aiGateway';

const MAX_MESSAGE_LENGTH = 2000;
const DRAFT_KEY_PREFIX = '@chat_athi_mkg_draft:';

const formatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

const TypingDots = ({ color = '#6b7280' }) => {
  const animations = useRef([0, 1, 2].map(() => new Animated.Value(0.35))).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.stagger(
        160,
        animations.map((animation) => Animated.sequence([
          Animated.timing(animation, { toValue: 1, duration: 220, useNativeDriver: true }),
          Animated.timing(animation, { toValue: 0.35, duration: 220, useNativeDriver: true })
        ]))
      )
    );

    loop.start();
    return () => loop.stop();
  }, [animations]);

  return (
    <HStack alignItems="center" space={1} py={1} accessibilityLabel="Athi sedang mengetik">
      {animations.map((animation, index) => (
        <Animated.View
          key={`typing-dot-${index}`}
          style={{
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: color,
            opacity: animation,
            transform: [{
              translateY: animation.interpolate({ inputRange: [0.35, 1], outputRange: [0, -3] })
            }]
          }}
        />
      ))}
    </HStack>
  );
};

const ChatBubble = ({ item, mode, onRetry }) => {
  const [copied, setCopied] = useState(false);
  const isUser = item.role === 'user';
  const isFailed = item.status === 'failed';
  const isTyping = item.status === 'typing';
  const canCopy = !isUser && !isTyping;
  const messageText = item.content_text || item.contentText || item.text || '';
  const userBg = isFailed ? (mode === 'dark' ? '#7f1d1d' : '#fee2e2') : (mode === 'dark' ? '#065f46' : '#dcf8c6');
  const aiBg = mode === 'dark' ? '#1f2937' : '#ffffff';
  const textColor = mode === 'dark' ? '#f9fafb' : '#111827';
  const metaColor = isFailed ? '#dc2626' : (mode === 'dark' ? '#d1d5db' : '#6b7280');
  const copyIconColor = copied ? '#22c55e' : metaColor;

  const handleCopy = async () => {
    if (!messageText) return;

    try {
      await Clipboard.setStringAsync(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Error copying Chat Athi reply:', error);
      Alert.alert('Gagal', 'Balasan Athi belum bisa disalin.');
    }
  };

  return (
    <HStack justifyContent={isUser ? 'flex-end' : 'flex-start'} px={4} mb={2}>
      <VStack
        maxW="82%"
        bg={isUser ? userBg : aiBg}
        borderWidth={isUser ? 0 : 1}
        borderColor={mode === 'dark' ? '#374151' : '#e5e7eb'}
        px={3}
        py={2}
        rounded="2xl"
        roundedTopRight={isUser ? 4 : '2xl'}
        roundedTopLeft={isUser ? '2xl' : 4}
        space={1}
      >
        {isTyping ? (
          <TypingDots color={metaColor} />
        ) : (
          <Text fontFamily="Poppins-Regular" fontSize="sm" color={textColor} lineHeight={20}>
            {messageText}
          </Text>
        )}
        <HStack alignItems="center" justifyContent="flex-end" space={2}>
          {isFailed ? (
            <TouchableOpacity onPress={() => onRetry?.(item)}>
              <Text fontFamily="Quicksand-Bold" fontSize="2xs" color="#dc2626">
                Gagal terkirim • Coba lagi
              </Text>
            </TouchableOpacity>
          ) : null}
          {canCopy ? (
            <TouchableOpacity
              onPress={handleCopy}
              accessibilityRole="button"
              accessibilityLabel={copied ? 'Balasan Athi sudah disalin' : 'Salin balasan Athi'}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <HStack alignItems="center" space={1}>
                {copied ? <CopySuccess size={14} color={copyIconColor} variant="Bold" /> : <Copy size={14} color={copyIconColor} />}
                {copied ? (
                  <Text fontFamily="Quicksand-Bold" fontSize="2xs" color={copyIconColor}>
                    Disalin
                  </Text>
                ) : null}
              </HStack>
            </TouchableOpacity>
          ) : null}
          {!isTyping ? (
            <Text alignSelf="flex-end" fontFamily="Poppins-Regular" fontSize="2xs" color={metaColor}>
              {formatTime(item.created_at || item.createdAt)}
            </Text>
          ) : null}
        </HStack>
      </VStack>
    </HStack>
  );
};

export default function ChatAthiMKG({ account, onUnpair }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mode = useSelector((state) => state.themes)?.value || 'light';
  const scrollRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sessionUuid, setSessionUuid] = useState(null);
  const [conversationUuid, setConversationUuid] = useState(null);

  const backgroundColor = mode === 'dark' ? '#0b141a' : '#efeae2';
  const headerBg = mode === 'dark' ? '#111827' : '#075e54';
  const inputBg = mode === 'dark' ? '#1f2937' : '#ffffff';
  const textColor = mode === 'dark' ? COLORS.teks.dark[1] : COLORS.teks.light[1];
  const subtitleColor = mode === 'dark' ? '#d1d5db' : '#e5e7eb';
  const accentColor = '#25d366';
  const keyboardBehavior = Platform.OS === 'ios' ? 'padding' : 'height';
  const keyboardVerticalOffset = Platform.OS === 'ios' ? Math.max(insets.top - 4, 0) : 0;
  const inputBarPaddingBottom = Platform.OS === 'ios' ? Math.max(insets.bottom, 6) : 6;
  const draftKey = useMemo(() => `${DRAFT_KEY_PREFIX}${account?.channel_user_id || 'default'}`, [account?.channel_user_id]);
  const isOverLimit = input.length > MAX_MESSAGE_LENGTH;

  const scrollToBottom = (delay = 100) => {
    setTimeout(() => scrollRef.current?.scrollToEnd?.({ animated: true }), delay);
  };

  const loadHistory = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const data = await getChatAthiHistory({ conversation_uuid: conversationUuid || undefined, limit: 60 });
      setMessages(Array.isArray(data?.messages) ? data.messages : []);
      setSessionUuid(data?.session_uuid || null);
      setConversationUuid(data?.conversation_uuid || null);
    } catch (error) {
      console.error('Error loading Chat Athi MKG history:', error);
      Alert.alert('Gagal', error?.message || 'Tidak dapat mengambil histori Chat Athi MKG.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      scrollToBottom();
    }
  }, [conversationUuid]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(draftKey)
      .then((draft) => {
        if (active && draft) setInput(draft);
      })
      .catch((error) => console.error('Error loading Chat Athi draft:', error));

    return () => {
      active = false;
    };
  }, [draftKey]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      AsyncStorage.setItem(draftKey, input).catch((error) => console.error('Error saving Chat Athi draft:', error));
    }, 250);

    return () => clearTimeout(timeout);
  }, [draftKey, input]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadHistory({ silent: true });
  };

  const sendMessage = async (text, retryUuid = null) => {
    const cleanText = text.trim();
    if (!cleanText || sending) return;

    if (cleanText.length > MAX_MESSAGE_LENGTH) {
      Alert.alert('Pesan Terlalu Panjang', `Maksimal ${MAX_MESSAGE_LENGTH} karakter per pesan.`);
      return;
    }

    const userMessageUuid = retryUuid || `local-user-${Date.now()}`;
    const typingUuid = `typing-${Date.now()}`;
    const createdAt = new Date().toISOString();

    setSending(true);
    if (!retryUuid) {
      setInput('');
      AsyncStorage.removeItem(draftKey).catch(() => {});
    }

    setMessages((prev) => {
      const withoutTyping = prev.filter((item) => item.status !== 'typing');
      const nextMessages = retryUuid
        ? withoutTyping.map((item) => (item.uuid === retryUuid ? { ...item, status: 'sending', created_at: createdAt } : item))
        : [...withoutTyping, { uuid: userMessageUuid, role: 'user', content_text: cleanText, created_at: createdAt, status: 'sending' }];

      return [...nextMessages, { uuid: typingUuid, role: 'assistant', content_text: 'Athi sedang mengetik…', created_at: createdAt, status: 'typing' }];
    });
    scrollToBottom();

    try {
      const data = await sendChatAthiMessage({
        message: cleanText,
        session_uuid: sessionUuid || undefined,
        conversation_uuid: conversationUuid || undefined,
        device_id: account?.channel_user_id || undefined,
        client_metadata: {
          app: 'employeemkg',
          feature: 'chat_athi_mkg',
          platform: Platform.OS,
          app_version: Application.nativeApplicationVersion || Application.applicationId || null,
          native_build_version: Application.nativeBuildVersion || null
        }
      });

      setSessionUuid(data?.session_uuid || sessionUuid);
      setConversationUuid(data?.conversation_uuid || conversationUuid);
      const reply = data?.reply || 'Maaf, saya belum menerima balasan dari Athi MKG.';
      setMessages((prev) => [
        ...prev
          .filter((item) => item.uuid !== typingUuid && item.status !== 'typing')
          .map((item) => (item.uuid === userMessageUuid ? { ...item, status: 'sent' } : item)),
        {
          uuid: `local-ai-${Date.now()}`,
          role: 'assistant',
          content_text: reply,
          created_at: new Date().toISOString(),
          status: 'sent'
        }
      ]);
    } catch (error) {
      console.error('Error sending Chat Athi MKG message:', error);
      setMessages((prev) => prev
        .filter((item) => item.uuid !== typingUuid && item.status !== 'typing')
        .map((item) => (item.uuid === userMessageUuid
          ? { ...item, status: 'failed', error_message: error?.response?.data?.data?.message || error?.message || 'Pesan gagal dikirim.' }
          : item)));
    } finally {
      setSending(false);
      scrollToBottom();
    }
  };

  const handleSend = () => sendMessage(input);

  const handleRetry = (item) => {
    sendMessage(item.content_text || item.text || '', item.uuid);
  };

  const handleUnpair = () => {
    if (onUnpair) onUnpair(account?.channel_user_id);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor }}
      behavior={keyboardBehavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
      enabled
    >
      <VStack flex={1} bg={backgroundColor}>
        <HStack bg={headerBg} px={4} py={3} alignItems="center" space={3}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <Center w={10} h={10} rounded="full" bg="rgba(255,255,255,0.14)">
            <Whatsapp size={22} color="#ffffff" variant="Bulk" />
          </Center>
          <VStack flex={1}>
            <Text fontFamily="Quicksand-Bold" fontSize="md" color="#ffffff">
              Chat Athi MKG
            </Text>
            <Text fontFamily="Poppins-Regular" fontSize="2xs" color={subtitleColor} numberOfLines={1}>
              {sending ? 'Athi sedang mengetik…' : (account?.channel_user_id || 'WhatsApp terhubung')}
            </Text>
          </VStack>
          <TouchableOpacity onPress={handleUnpair}>
            <Center px={3} py={2} rounded="full" bg="rgba(255,255,255,0.14)">
              <Text fontFamily="Quicksand-Bold" fontSize="xs" color="#ffffff">
                Putus
              </Text>
            </Center>
          </TouchableOpacity>
        </HStack>

        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={accentColor} />}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd?.({ animated: true })}
        >
          {loading ? (
            <Center py={10}>
              <Text fontFamily="Poppins-Regular" fontSize="sm" color={textColor}>
                Memuat Chat Athi MKG...
              </Text>
            </Center>
          ) : messages.length === 0 ? (
            <Center px={8} py={16}>
              <VStack bg={inputBg} rounded="2xl" p={4} borderWidth={1} borderColor={mode === 'dark' ? '#374151' : '#e5e7eb'} space={2}>
                <Text textAlign="center" fontFamily="Quicksand-Bold" fontSize="md" color={textColor}>
                  Mulai percakapan dengan Athi MKG
                </Text>
                <Text textAlign="center" fontFamily="Poppins-Regular" fontSize="xs" color={mode === 'dark' ? '#9ca3af' : '#6b7280'}>
                  Ketik “help” untuk melihat bantuan. Athi tidak akan mengarang angka; jika butuh data operasional, Athi akan meminta parameter yang kurang.
                </Text>
              </VStack>
            </Center>
          ) : (
            messages.map((item) => <ChatBubble key={item.uuid || `${item.role}-${item.created_at}`} item={item} mode={mode} onRetry={handleRetry} />)
          )}
        </ScrollView>

        <VStack bg={backgroundColor} px={3} pt={2} pb={inputBarPaddingBottom} space={1}>
          {isOverLimit ? (
            <Text alignSelf="flex-end" fontFamily="Poppins-Regular" fontSize="2xs" color="#dc2626">
              {input.length}/{MAX_MESSAGE_LENGTH} karakter
            </Text>
          ) : null}
          <HStack alignItems="flex-end" space={2}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Tulis pesan..."
              placeholderTextColor={mode === 'dark' ? '#9ca3af' : '#6b7280'}
              multiline
              onFocus={() => scrollToBottom(250)}
              style={{
                flex: 1,
                maxHeight: 110,
                minHeight: 44,
                backgroundColor: inputBg,
                borderRadius: 22,
                paddingHorizontal: 16,
                paddingVertical: 10,
                color: textColor,
                fontFamily: 'Poppins-Regular',
                fontSize: 14,
                borderWidth: isOverLimit ? 1 : 0,
                borderColor: isOverLimit ? '#dc2626' : 'transparent'
              }}
            />
            <TouchableOpacity onPress={handleSend} disabled={!input.trim() || sending || isOverLimit}>
              <Center w={44} h={44} rounded="full" bg={!input.trim() || sending || isOverLimit ? '#94a3b8' : accentColor}>
                <Send2 size={20} color="#ffffff" variant="Bold" />
              </Center>
            </TouchableOpacity>
          </HStack>
        </VStack>
      </VStack>
    </KeyboardAvoidingView>
  );
}
