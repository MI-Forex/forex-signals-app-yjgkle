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
  const scrollViewRef = useRef<ScrollView>(null);
  const { userData } = useAuth();

  useEffect(() => {
    if (visible && userData?.uid) {
      console.log('ChatModal: Initializing chat for user:', userData.uid);
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
      console.log('ChatModal: Loading chat messages...');
      setLoading(true);
      setError('');
      
      if (!userData?.uid) {
        setError('User not authenticated');
        setLoading(false);
        return;
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
      }, (error) => {
        console.error('ChatModal: Error in message listener:', error);
        setError('Failed to load messages: ' + error.message);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error: any) {
      console.error('ChatModal: Error loading chat messages:', error);
      setError('Failed to initialize chat: ' + error.message);
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId || !userData?.uid) {
      console.log('ChatModal: Cannot send message - missing data');
      return;
    }

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      console.log('ChatModal: Sending message:', messageText.substring(0, 50));
      
      await sendChatMessage(
        chatId,
        userData.uid,
        messageText,
        userData.isAdmin ? 'admin' : 'user',
        userData.isAdmin ? 'Admin' : (userData.displayName || 'You')
      );

      console.log('ChatModal: Message sent successfully');
    } catch (error: any) {
      console.error('ChatModal: Error sending message:', error);
      Alert.alert('Error', 'Failed to send message: ' + error.message);
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
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading messages...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {error}</Text>
              <Button 
                text="Retry" 
                onPress={loadChatMessages} 
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
                <Text style={styles.messageText}>{message.text}</Text>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            onSubmitEditing={sendMessage}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={500}
            editable={!sending}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <Button
            text="Send"
            onPress={sendMessage}
            loading={sending}
            disabled={!newMessage.trim() || sending || !!error}
            style={styles.sendButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {userData?.isAdmin 
              ? 'Responding as Admin' 
              : 'Chat with our admin for VIP membership assistance'
            }
          </Text>
          <Text style={styles.footerSubtext}>
            Messages are delivered in real-time via Firebase
          </Text>
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
    color: colors.text,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
  },
  sendButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
  footerSubtext: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
});