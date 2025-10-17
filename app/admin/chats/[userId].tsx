import React, { useState, useEffect, useRef } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { commonStyles, colors, spacing, borderRadius } from '../../../styles/commonStyles';
import Button from '../../../components/Button';
import { 
  ensureChatExists, 
  sendChatMessage, 
  createChatId, 
  subscribeToMessages,
  getChatMessages,
  markMessagesAsRead,
  ChatMessage
} from '../../../utils/supabaseChatUtils';

export default function AdminChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const { userId, userName } = useLocalSearchParams();
  const { userData } = useAuth();

  useEffect(() => {
    if (userData?.isAdmin && userId) {
      loadChatMessages();
    } else {
      router.replace('/admin');
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [userId, userData]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadChatMessages = async () => {
    try {
      console.log('AdminChat: Loading messages for user:', userId);
      setLoading(true);
      setError('');
      
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID');
      }

      const chatId = createChatId(userId);
      console.log('AdminChat: Chat ID:', chatId);

      // Load initial messages
      const initialMessages = await getChatMessages(chatId);
      setMessages(initialMessages);
      console.log('AdminChat: Loaded messages:', initialMessages.length);

      // Mark user messages as read (admin is reading them)
      await markMessagesAsRead(chatId);
      console.log('AdminChat: Marked user messages as read');

      // Subscribe to real-time updates
      const unsubscribe = subscribeToMessages(
        chatId,
        (updatedMessages) => {
          console.log('AdminChat: Received real-time update:', updatedMessages.length);
          setMessages(updatedMessages);
        },
        (error) => {
          console.error('AdminChat: Real-time subscription error:', error);
          setError('Connection error occurred');
        }
      );

      unsubscribeRef.current = unsubscribe;
      setLoading(false);
    } catch (error: any) {
      console.error('AdminChat: Error loading messages:', error);
      setError('Failed to load messages');
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const messageText = newMessage.trim();
    
    if (!messageText || !userId || !userData?.uid) {
      Alert.alert('Error', 'Unable to send message. Please check your connection and try again.');
      return;
    }

    console.log('AdminChat: Sending message:', messageText.substring(0, 50));
    setSending(true);
    setNewMessage(''); // Clear input immediately

    try {
      const chatId = createChatId(userId as string);
      
      // Create optimistic message for immediate UI update
      const optimisticMessage: ChatMessage = {
        id: `temp_${Date.now()}`,
        chatId,
        userId: userData.uid,
        message: messageText,
        senderType: 'admin',
        senderName: 'Admin',
        createdAt: new Date(),
        read: false
      };

      // Add optimistic message to UI immediately
      setMessages(prev => [...prev, optimisticMessage]);
      
      await sendChatMessage(
        chatId,
        userData.uid,
        messageText,
        'admin',
        'Admin'
      );

      console.log('AdminChat: Message sent successfully');
      
      // Refresh messages to get the real message with proper ID
      setTimeout(async () => {
        try {
          const updatedMessages = await getChatMessages(chatId);
          setMessages(updatedMessages);
        } catch (error) {
          console.error('AdminChat: Error refreshing messages after send:', error);
        }
      }, 500);
      
    } catch (error: any) {
      console.error('AdminChat: Error sending message:', error);
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp_')));
      
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setNewMessage(messageText); // Restore message on error
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
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  if (!userData?.isAdmin) {
    return (
      <View style={[commonStyles.container, commonStyles.centered]}>
        <Text style={commonStyles.text}>Access denied</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Chat with {userName || 'User'}
        </Text>
        <Button
          text="Back"
          onPress={() => router.back()}
          variant="outline"
          style={styles.backButton}
        />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <Button text="Retry" onPress={loadChatMessages} style={styles.retryButton} />
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start the conversation with this user</Text>
          </View>
        ) : (
          messages.map((message, index) => {
            const showDate = index === 0 || 
              formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);
            
            return (
              <View key={message.id}>
                {showDate && (
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>{formatDate(message.createdAt)}</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.messageContainer,
                    message.senderType === 'admin' ? styles.adminMessage : styles.userMessage
                  ]}
                >
                  <View style={styles.messageHeader}>
                    <Text style={styles.senderName}>{message.senderName}</Text>
                    <Text style={styles.timestamp}>{formatTime(message.createdAt)}</Text>
                  </View>
                  <Text style={[
                    styles.messageText,
                    message.senderType === 'admin' ? styles.adminMessageText : styles.userMessageText
                  ]}>
                    {message.message}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type your response..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
            editable={!sending && !loading && !error}
            onKeyPress={handleKeyPress}
            textAlignVertical="top"
          />
          <Button
            text={sending ? "..." : "Send"}
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending || loading || !!error}
            style={styles.sendButton}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  backButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  messagesContainer: {
    flex: 1,
    padding: spacing.md,
  },
  messagesContent: {
    paddingBottom: spacing.lg,
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dateText: {
    fontSize: 12,
    color: colors.textMuted,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  messageContainer: {
    marginBottom: spacing.md,
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  adminMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  userMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  timestamp: {
    fontSize: 10,
    color: colors.textMuted,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  adminMessageText: {
    color: colors.white,
  },
  userMessageText: {
    color: colors.text,
  },
  inputContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 100,
    minHeight: 44,
  },
  sendButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});