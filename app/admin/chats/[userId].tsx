<<<<<<< HEAD
import React, { useState, useEffect, useRef, useCallback } from 'react';
=======

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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
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
<<<<<<< HEAD
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

  const loadChatMessages = useCallback(async () => {
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
  }, [userId]);

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
  }, [userId, userData, loadChatMessages]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
<<<<<<< HEAD
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
=======
    if (!newMessage.trim() || !userId || typeof userId !== 'string' || !userData?.uid) {
      return;
    }

    setSending(true);
    try {
      const chatId = createChatId(userId, userData.uid);
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      
      await sendChatMessage(
        chatId,
        userData.uid,
<<<<<<< HEAD
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
=======
        newMessage.trim(),
        'admin',
        userData.displayName || 'Admin'
      );
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
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
<<<<<<< HEAD
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  if (!userData?.isAdmin) {
    return (
      <View style={[commonStyles.container, commonStyles.centered]}>
        <Text style={commonStyles.text}>Access denied</Text>
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
<<<<<<< HEAD
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Chat with {userName || 'User'}
        </Text>
=======
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Chat with User</Text>
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
        <Button
          text="Back"
          onPress={() => router.back()}
          variant="outline"
<<<<<<< HEAD
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
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
<<<<<<< HEAD
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
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      </View>
    </KeyboardAvoidingView>
  );
}
<<<<<<< HEAD

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
=======
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
