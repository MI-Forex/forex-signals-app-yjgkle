
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Button from './Button';
import { useAuth } from '../contexts/AuthContext';
import { commonStyles, colors, spacing, borderRadius } from '../styles/commonStyles';
import { 
  ensureChatExists, 
  sendChatMessage, 
  createChatId, 
  subscribeToMessages,
  getChatMessages,
  testSupabaseConnection,
  ChatMessage
} from '../utils/supabaseChatUtils';
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

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
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
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
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
  errorState: {
    backgroundColor: colors.error,
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
  },
  errorText: {
    color: colors.white,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default function ChatModal({ visible, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { userData } = useAuth();

  const loadChatMessages = useCallback(async () => {
    if (!userData?.uid) {
      console.log('No user data available');
      setLoading(false);
      return;
    }

    try {
      console.log('Testing Supabase connection...');
      const isConnected = await testSupabaseConnection();
      
      if (!isConnected) {
        console.log('Supabase connection failed');
        setConnectionError(true);
        setLoading(false);
        return;
      }

      console.log('Loading chat messages...');
      const adminId = 'admin'; // Default admin ID
      const chatId = createChatId(userData.uid, adminId);
      
      // Ensure chat exists
      await ensureChatExists(
        userData.uid,
        userData.email || '',
        userData.displayName || 'User'
      );
      
      // Get initial messages
      const initialMessages = await getChatMessages(chatId);
      setMessages(initialMessages);
      setConnectionError(false);
      
      // Subscribe to new messages
      const unsubscribe = subscribeToMessages(chatId, (newMessages) => {
        setMessages(newMessages);
      });
      
      setLoading(false);
      
      return unsubscribe;
    } catch (error) {
      console.error('Error loading chat messages:', error);
      setConnectionError(true);
      setLoading(false);
    }
  }, [userData?.uid, userData?.email, userData?.displayName]);

  useEffect(() => {
    if (visible && userData?.uid) {
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
    }
  }, [visible, userData?.uid, loadChatMessages]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !userData?.uid) {
      return;
    }

    setSending(true);
    try {
      const adminId = 'admin';
      const chatId = createChatId(userData.uid, adminId);
      
      await sendChatMessage(
        chatId,
        userData.uid,
        newMessage.trim(),
        'user',
        userData.displayName || 'User'
      );
      
      setNewMessage('');
      setConnectionError(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setConnectionError(true);
      Alert.alert('Error', 'Failed to send message. Please check your connection.');
    } finally {
      setSending(false);
    }
  };

  const handleSendPress = () => {
    sendMessage();
  };

  const handleTextChange = (text: string) => {
    setNewMessage(text);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const retryConnection = () => {
    setLoading(true);
    setConnectionError(false);
    loadChatMessages();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity 
          style={{ flex: 1 }} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Chat with Admin</Text>
            <Button
              text="Close"
              onPress={onClose}
              variant="outline"
              size="small"
            />
          </View>

          {connectionError && (
            <View style={styles.errorState}>
              <Text style={styles.errorText}>
                Connection error. Please check your internet connection.
              </Text>
              <Button
                text="Retry"
                onPress={retryConnection}
                variant="outline"
                size="small"
                style={{ marginTop: spacing.sm }}
                textStyle={{ color: colors.white }}
              />
            </View>
          )}

          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Loading messages...</Text>
            </View>
          ) : (
            <>
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
                  messages.map((message) => {
                    const isUser = message.sender_type === 'user';
                    return (
                      <View 
                        key={message.id}
                        style={[
                          styles.messageWrapper,
                          isUser ? styles.userMessageWrapper : styles.adminMessageWrapper
                        ]}
                      >
                        <View style={[
                          styles.messageBubble,
                          isUser ? styles.userMessage : styles.adminMessage
                        ]}>
                          <Text style={[
                            styles.messageText,
                            isUser && styles.userMessageText
                          ]}>
                            {message.message}
                          </Text>
                        </View>
                        <Text style={styles.messageTime}>
                          {formatTime(new Date(message.created_at))}
                        </Text>
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
                  onChangeText={handleTextChange}
                  multiline
                  maxLength={1000}
                />
                <Button
                  text="Send"
                  onPress={handleSendPress}
                  disabled={!newMessage.trim() || sending || connectionError}
                  loading={sending}
                  size="small"
                />
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
