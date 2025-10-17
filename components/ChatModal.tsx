import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Alert 
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { commonStyles, colors, spacing, borderRadius } from '../styles/commonStyles';
import Button from './Button';
import { 
  ensureChatExists, 
  sendChatMessage, 
  createChatId, 
  subscribeToMessages,
  getChatMessages,
  testSupabaseConnection,
  ChatMessage
} from '../utils/supabaseChatUtils';

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ChatModal({ visible, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const { userData } = useAuth();

  useEffect(() => {
    if (visible && userData?.uid) {
      console.log('ChatModal: Initializing Supabase chat for user:', userData.uid);
      setRetryCount(0);
      setError('');
      setLoading(true);
      setConnectionStatus('connecting');
      loadChatMessages();
    } else if (!visible) {
      // Reset state when modal is closed
      setMessages([]);
      setError('');
      setLoading(true);
      setRetryCount(0);
      setNewMessage('');
      setInputFocused(false);
      setConnectionStatus('connecting');
      
      // Unsubscribe from real-time updates
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [visible, userData?.uid]);

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
      console.log('ChatModal: Loading Supabase chat messages... (attempt:', retryCount + 1, ')');
      setLoading(true);
      setError('');
      setConnectionStatus('connecting');
      
      if (!userData?.uid) {
        throw new Error('User not authenticated');
      }

      // Test Supabase connection first
      console.log('ChatModal: Testing Supabase connection...');
      const connectionOk = await testSupabaseConnection();
      if (!connectionOk) {
        throw new Error('Unable to connect to chat service');
      }

      console.log('ChatModal: Supabase connection successful');
      setConnectionStatus('connected');

      // Create chat ID and ensure chat exists
      const currentChatId = createChatId(userData.uid);
      setChatId(currentChatId);
      console.log('ChatModal: Chat ID:', currentChatId);
      
      await ensureChatExists(
        userData.uid, 
        userData.email || '', 
        userData.displayName || userData.email || 'User'
      );
      console.log('ChatModal: Supabase chat ensured');

      // Load initial messages
      const initialMessages = await getChatMessages(currentChatId);
      setMessages(initialMessages);
      console.log('ChatModal: Loaded initial messages:', initialMessages.length);

      // Subscribe to real-time updates
      const unsubscribe = subscribeToMessages(
        currentChatId,
        (updatedMessages) => {
          console.log('ChatModal: Received real-time message update:', updatedMessages.length);
          setMessages(updatedMessages);
        },
        (error) => {
          console.error('ChatModal: Real-time subscription error:', error);
          setError('Connection error occurred');
          setConnectionStatus('error');
        }
      );

      unsubscribeRef.current = unsubscribe;
      setLoading(false);
      setError('');
      setConnectionStatus('connected');
    } catch (error: any) {
      console.error('ChatModal: Error loading Supabase chat messages:', error);
      setConnectionStatus('error');
      
      let errorMessage = 'Failed to initialize chat';
      
      // Generic error messages for security
      if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Please check internet connectivity';
      } else if (error.message.includes('permission') || error.message.includes('auth')) {
        errorMessage = 'Please check your credentials';
      } else if (error.message.includes('relation') || error.message.includes('does not exist')) {
        errorMessage = 'Chat service is being set up. Please try again in a moment.';
      }
      
      setError(errorMessage);
      setLoading(false);
      
      // Auto-retry on errors (max 3 attempts)
      if (retryCount < 2) {
        console.log('ChatModal: Error occurred, retrying in 3 seconds...');
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadChatMessages();
        }, 3000);
      }
    }
  };

  const sendMessage = async () => {
    const messageText = newMessage.trim();
    
    if (!messageText || !chatId || !userData?.uid) {
      console.log('ChatModal: Cannot send message - missing data', {
        hasText: !!messageText,
        hasChatId: !!chatId,
        hasUserId: !!userData?.uid,
        chatId,
        userId: userData?.uid
      });
      Alert.alert('Error', 'Unable to send message. Please check your connection and try again.');
      return;
    }

    console.log('ChatModal: Attempting to send Supabase message:', {
      messageText: messageText.substring(0, 50),
      chatId,
      userId: userData.uid,
      sender: userData.isAdmin ? 'admin' : 'user',
      senderName: userData.isAdmin ? 'Admin' : (userData.displayName || userData.email || 'You')
    });
    
    setSending(true);
    setNewMessage(''); // Clear input immediately for better UX

    try {
      const senderName = userData.isAdmin ? 'Admin' : (userData.displayName || userData.email || 'You');
      
      // Create optimistic message for immediate UI update
      const optimisticMessage: ChatMessage = {
        id: `temp_${Date.now()}`,
        chatId,
        userId: userData.uid,
        message: messageText,
        senderType: userData.isAdmin ? 'admin' : 'user',
        senderName,
        createdAt: new Date(),
        read: false
      };

      // Add optimistic message to UI immediately
      setMessages(prev => [...prev, optimisticMessage]);
      
      await sendChatMessage(
        chatId,
        userData.uid,
        messageText,
        userData.isAdmin ? 'admin' : 'user',
        senderName
      );

      console.log('ChatModal: Supabase message sent successfully');
      
      // Refresh messages to get the real message with proper ID
      setTimeout(async () => {
        try {
          const updatedMessages = await getChatMessages(chatId);
          setMessages(updatedMessages);
        } catch (error) {
          console.error('ChatModal: Error refreshing messages after send:', error);
        }
      }, 500);
      
      // Focus back on input for better UX
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
      
    } catch (error: any) {
      console.error('ChatModal: Error sending Supabase message:', error);
      console.error('ChatModal: Error details:', {
        message: error.message,
        stack: error.stack,
        chatId,
        userId: userData.uid
      });
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp_')));
      
      // Generic error messages for security
      let errorMessage = 'Failed to send message';
      if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Please check internet connectivity';
      } else if (error.message.includes('permission') || error.message.includes('auth')) {
        errorMessage = 'Please check your credentials';
      }
      
      Alert.alert(
        'Error Sending Message', 
        `${errorMessage}. Please try again.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => {
            setNewMessage(messageText);
            setTimeout(() => sendMessage(), 500);
          }}
        ]
      );
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleSendPress = () => {
    console.log('ChatModal: Send button pressed');
    sendMessage();
  };

  const handleTextChange = (text: string) => {
    console.log('ChatModal: Text changed, length:', text.length);
    setNewMessage(text);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const retryConnection = () => {
    setRetryCount(0);
    loadChatMessages();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {userData?.isAdmin ? 'User Support Chat' : 'Chat with Admin'}
          </Text>
          <View style={styles.headerRight}>
            <View style={[styles.statusIndicator, { 
              backgroundColor: connectionStatus === 'connected' ? colors.success : 
                             connectionStatus === 'error' ? colors.error : colors.warning 
            }]} />
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>
                {connectionStatus === 'connecting' ? 'Connecting to chat...' : 'Loading messages...'}
              </Text>
              {retryCount > 0 && (
                <Text style={styles.retryText}>Retry attempt {retryCount}/3</Text>
              )}
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {error}</Text>
              <Text style={styles.errorSubtext}>
                This might be a temporary connection issue. Please try again.
              </Text>
              <Button 
                text="Retry Connection" 
                onPress={retryConnection} 
                style={styles.retryButton}
              />
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Start a conversation with the admin!</Text>
              <Text style={styles.emptySubtext}>Ask about VIP membership or any questions you have.</Text>
            </View>
          ) : (
            messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageContainer,
                  message.senderType === 'user' ? styles.userMessage : styles.adminMessage
                ]}
              >
                <View style={styles.messageHeader}>
                  <Text style={styles.senderName}>{message.senderName}</Text>
                  <Text style={styles.timestamp}>{formatTime(message.createdAt)}</Text>
                </View>
                <Text style={[
                  styles.messageText,
                  message.senderType === 'user' ? styles.userMessageText : styles.adminMessageText
                ]}>
                  {message.message}
                </Text>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={textInputRef}
              style={[
                styles.textInput,
                inputFocused && styles.textInputFocused,
                (!sending && !loading && !error && connectionStatus === 'connected') ? {} : styles.textInputDisabled
              ]}
              value={newMessage}
              onChangeText={handleTextChange}
              onFocus={() => {
                console.log('ChatModal: Input focused');
                setInputFocused(true);
              }}
              onBlur={() => {
                console.log('ChatModal: Input blurred');
                setInputFocused(false);
              }}
              placeholder={
                loading ? "Loading chat..." :
                error ? "Chat unavailable" :
                connectionStatus !== 'connected' ? "Connecting..." :
                "Type your message..."
              }
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={500}
              editable={!sending && !loading && !error && connectionStatus === 'connected'}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={handleSendPress}
              textAlignVertical="top"
              autoFocus={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!newMessage.trim() || sending || loading || !!error || connectionStatus !== 'connected') && styles.sendButtonDisabled
              ]}
              onPress={handleSendPress}
              disabled={!newMessage.trim() || sending || loading || !!error || connectionStatus !== 'connected'}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.sendButtonText,
                (!newMessage.trim() || sending || loading || !!error || connectionStatus !== 'connected') && styles.sendButtonTextDisabled
              ]}>
                {sending ? "..." : "Send"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {userData?.isAdmin 
              ? 'Responding as Admin' 
              : 'Chat with our admin for VIP membership assistance'
            }
          </Text>
          {connectionStatus !== 'connected' && (
            <Text style={styles.footerError}>
              {connectionStatus === 'connecting' ? 'Connecting...' : 'Connection issue detected'}
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  closeButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
    padding: spacing.md,
  },
  messagesContent: {
    paddingBottom: spacing.lg,
  },
  messageContainer: {
    marginBottom: spacing.md,
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  adminMessage: {
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
  userMessageText: {
    color: colors.white,
  },
  adminMessageText: {
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
  textInputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  textInputDisabled: {
    backgroundColor: colors.background,
    opacity: 0.6,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.5,
  },
  sendButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  sendButtonTextDisabled: {
    color: colors.background,
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
  retryText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
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
    marginBottom: spacing.sm,
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 20,
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
  footer: {
    padding: spacing.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  footerError: {
    fontSize: 10,
    color: colors.error,
    textAlign: 'center',
    marginTop: 4,
  },
});