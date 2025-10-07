
import Button from '../../../components/Button';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  ensureChatExists, 
  sendChatMessage, 
  createChatId, 
  subscribeToMessages,
  getChatMessages,
  markMessagesAsRead,
  ChatMessage
} from '../../../utils/supabaseChatUtils';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  StyleSheet,
  Alert 
} from 'react-native';
import { commonStyles, colors, spacing, borderRadius } from '../../../styles/commonStyles';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  messagesContainer: {
    flex: 1,
    padding: spacing.md,
  },
  messageWrapper: {
    marginBottom: spacing.md,
    maxWidth: '80%',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
  },
  adminMessageWrapper: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  userMessage: {
    backgroundColor: colors.primary,
  },
  adminMessage: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: 16,
    color: colors.text,
  },
  userMessageText: {
    color: colors.white,
  },
  messageTime: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export default function AdminChatScreen() {
  const { userId } = useLocalSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { userData } = useAuth();

  const loadChatMessages = useCallback(async () => {
    if (!userId || typeof userId !== 'string' || !userData?.uid) {
      console.log('Missing userId or userData');
      setLoading(false);
      return;
    }

    try {
      console.log('Loading chat messages for user:', userId);
      const chatId = createChatId(userId, userData.uid);
      
      // Ensure chat exists
      await ensureChatExists(userId, userData.email || '', userData.displayName || 'Admin');
      
      // Get initial messages
      const initialMessages = await getChatMessages(chatId);
      setMessages(initialMessages);
      
      // Mark messages as read
      await markMessagesAsRead(chatId, userData.uid);
      
      // Subscribe to new messages
      const unsubscribe = subscribeToMessages(chatId, (newMessages) => {
        setMessages(newMessages);
        // Mark new messages as read
        markMessagesAsRead(chatId, userData.uid);
      });
      
      setLoading(false);
      
      return unsubscribe;
    } catch (error) {
      console.error('Error loading chat messages:', error);
      Alert.alert('Error', 'Failed to load chat messages');
      setLoading(false);
    }
  }, [userId, userData?.uid, userData?.email, userData?.displayName]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupChat = async () => {
      unsubscribe = await loadChatMessages();
    };

    setupChat();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [loadChatMessages]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || typeof userId !== 'string' || !userData?.uid) {
      return;
    }

    setSending(true);
    try {
      const chatId = createChatId(userId, userData.uid);
      
      await sendChatMessage(
        chatId,
        userData.uid,
        newMessage.trim(),
        'admin',
        userData.displayName || 'Admin'
      );
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (event: any) => {
    if (event.nativeEvent.key === 'Enter' && !event.nativeEvent.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Chat</Text>
          <Button
            text="Back"
            onPress={() => router.back()}
            variant="outline"
            size="small"
          />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Loading messages...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Chat with User</Text>
        <Button
          text="Back"
          onPress={() => router.back()}
          variant="outline"
          size="small"
        />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={{ paddingBottom: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No messages yet. Start the conversation!
            </Text>
          </View>
        ) : (
          messages.map((message, index) => {
            const isAdmin = message.sender_type === 'admin';
            const showDate = index === 0 || 
              formatDate(new Date(messages[index - 1].created_at)) !== formatDate(new Date(message.created_at));

            return (
              <View key={message.id}>
                {showDate && (
                  <Text style={[styles.messageTime, { textAlign: 'center', marginVertical: spacing.md }]}>
                    {formatDate(new Date(message.created_at))}
                  </Text>
                )}
                <View style={[
                  styles.messageWrapper,
                  isAdmin ? styles.adminMessageWrapper : styles.userMessageWrapper
                ]}>
                  <View style={[
                    styles.messageBubble,
                    isAdmin ? styles.adminMessage : styles.userMessage
                  ]}>
                    <Text style={[
                      styles.messageText,
                      !isAdmin && styles.userMessageText
                    ]}>
                      {message.message}
                    </Text>
                  </View>
                  <Text style={styles.messageTime}>
                    {formatTime(new Date(message.created_at))}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          value={newMessage}
          onChangeText={setNewMessage}
          onKeyPress={handleKeyPress}
          multiline
          maxLength={1000}
        />
        <Button
          text="Send"
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
          loading={sending}
          size="small"
        />
      </View>
    </KeyboardAvoidingView>
  );
}
