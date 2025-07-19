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
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { ensureChatExists, sendChatMessage, createChatId } from '../utils/chatUtils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
  senderName?: string;
  chatId: string;
  userId: string;
  read: boolean;
}

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ChatModal({ visible, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const textInputRef = useRef<TextInput>(null);
  const { userData } = useAuth();

  useEffect(() => {
    if (visible && userData?.uid) {
      console.log('ChatModal: Initializing chat for user:', userData.uid);
      setRetryCount(0);
      setError('');
      setLoading(true);
      const unsubscribe = loadChatMessages();
      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    } else if (!visible) {
      // Reset state when modal is closed
      setMessages([]);
      setError('');
      setLoading(true);
      setRetryCount(0);
      setNewMessage('');
      setInputFocused(false);
    }
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
      console.log('ChatModal: Loading chat messages... (attempt:', retryCount + 1, ')');
      setLoading(true);
      setError('');
      
      if (!userData?.uid) {
        throw new Error('User not authenticated');
      }

      // Create chat ID and ensure chat exists
      const currentChatId = createChatId(userData.uid);
      setChatId(currentChatId);
      console.log('ChatModal: Chat ID:', currentChatId);
      
      await ensureChatExists(userData.uid);
      console.log('ChatModal: Chat ensured');

      // Listen for messages in real-time
      const messagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', currentChatId),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        console.log('ChatModal: Received message snapshot, size:', snapshot.size);
        const loadedMessages: Message[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          loadedMessages.push({
            id: doc.id,
            text: data.text,
            sender: data.sender,
            senderName: data.senderName,
            timestamp: data.timestamp?.toDate() || new Date(),
            chatId: data.chatId,
            userId: data.userId,
            read: data.read || false
          });
        });

        console.log('ChatModal: Loaded messages:', loadedMessages.length);
        setMessages(loadedMessages);
        setLoading(false);
        setError('');
      }, (error) => {
        console.error('ChatModal: Error in message listener:', error);
        let errorMessage = 'Failed to load messages';
        
        // Generic error messages for security
        if (error.code === 'permission-denied') {
          errorMessage = 'Please check your credentials';
        } else if (error.code === 'unavailable') {
          errorMessage = 'Please check internet connectivity';
        } else {
          errorMessage = 'Connection error occurred';
        }
        
        setError(errorMessage);
        setLoading(false);
        
        // Auto-retry on permission errors
        if (error.code === 'permission-denied' && retryCount < 3) {
          console.log('ChatModal: Permission denied, retrying in 2 seconds...');
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            loadChatMessages();
          }, 2000);
        }
      });

      return unsubscribe;
    } catch (error: any) {
      console.error('ChatModal: Error loading chat messages:', error);
      let errorMessage = 'Failed to initialize chat';
      
      // Generic error messages for security
      if (error.message.includes('network')) {
        errorMessage = 'Please check internet connectivity';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Please check your credentials';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    const messageText = newMessage.trim();
    
    if (!messageText || !chatId || !userData?.uid) {
      console.log('ChatModal: Cannot send message - missing data', {
        hasText: !!messageText,
        hasChatId: !!chatId,
        hasUserId: !!userData?.uid
      });
      Alert.alert('Error', 'Unable to send message. Please check your connection and try again.');
      return;
    }

    console.log('ChatModal: Attempting to send message:', messageText.substring(0, 50));
    setSending(true);
    setNewMessage(''); // Clear input immediately for better UX

    try {
      await sendChatMessage(
        chatId,
        userData.uid,
        messageText,
        userData.isAdmin ? 'admin' : 'user',
        userData.isAdmin ? 'Admin' : (userData.displayName || userData.email || 'You')
      );

      console.log('ChatModal: Message sent successfully');
      
      // Focus back on input for better UX
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
      
    } catch (error: any) {
      console.error('ChatModal: Error sending message:', error);
      
      // Generic error messages for security
      let errorMessage = 'Failed to send message';
      if (error.message.includes('network')) {
        errorMessage = 'Please check internet connectivity';
      } else if (error.message.includes('permission')) {
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
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading messages...</Text>
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
                text="Retry" 
                onPress={() => {
                  setRetryCount(0);
                  loadChatMessages();
                }} 
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
                  message.sender === 'user' ? styles.userMessage : styles.adminMessage
                ]}
              >
                <View style={styles.messageHeader}>
                  <Text style={styles.senderName}>{message.senderName}</Text>
                  <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
                </View>
                <Text style={[
                  styles.messageText,
                  message.sender === 'user' ? styles.userMessageText : styles.adminMessageText
                ]}>
                  {message.text}
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
                (!sending && !loading && !error) ? {} : styles.textInputDisabled
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
                "Type your message..."
              }
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={500}
              editable={!sending && !loading && !error}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={handleSendPress}
              textAlignVertical="top"
              autoFocus={false}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!newMessage.trim() || sending || loading || !!error) && styles.sendButtonDisabled
              ]}
              onPress={handleSendPress}
              disabled={!newMessage.trim() || sending || loading || !!error}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.sendButtonText,
                (!newMessage.trim() || sending || loading || !!error) && styles.sendButtonTextDisabled
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
          {error && (
            <Text style={styles.footerError}>
              Connection issue detected - messages may be delayed
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