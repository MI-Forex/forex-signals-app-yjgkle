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
import { useAuth } from '../../../contexts/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';
import Button from '../../../components/Button';
import { commonStyles, colors, spacing, borderRadius } from '../../../styles/commonStyles';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  where
} from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { ensureChatExists, sendChatMessage, createChatId } from '../../../utils/chatUtils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  senderName: string;
  timestamp: Date;
  chatId: string;
  userId: string;
  read: boolean;
}

export default function AdminChatScreen() {
  const { userId, userName } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);
  const { userData } = useAuth();

  useEffect(() => {
    if (userId && userData?.uid) {
      const unsubscribe = loadChatMessages();
      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }
  }, [userId, userData?.uid]);

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
      console.log('AdminChatScreen: Loading chat messages for user:', userId);
      setLoading(true);
      setError('');
      
      if (!userId || !userData?.uid) {
        setError('Missing user or admin data');
        setLoading(false);
        return;
      }

      // Create chat ID and ensure chat exists
      const currentChatId = createChatId(userId as string);
      setChatId(currentChatId);
      
      await ensureChatExists(userId as string);

      // Listen for messages in real-time
      const messagesQuery = query(
        collection(db, 'messages'),
        where('chatId', '==', currentChatId),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        console.log('AdminChatScreen: Received message snapshot, size:', snapshot.size);
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

        console.log('AdminChatScreen: Loaded messages:', loadedMessages.length);
        setMessages(loadedMessages);
        setLoading(false);
      }, (error) => {
        console.error('AdminChatScreen: Error in message listener:', error);
        setError('Failed to load messages: ' + error.message);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error: any) {
      console.error('AdminChatScreen: Error loading chat messages:', error);
      setError('Failed to initialize chat: ' + error.message);
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId || !userData?.uid || !userId) {
      console.log('AdminChatScreen: Cannot send message - missing data');
      return;
    }

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      console.log('AdminChatScreen: Sending message:', messageText.substring(0, 50));
      
      await sendChatMessage(
        chatId,
        userId as string,
        messageText,
        'admin',
        userData.displayName || 'Admin'
      );

      console.log('AdminChatScreen: Admin message sent successfully');
    } catch (error: any) {
      console.error('AdminChatScreen: Error sending message:', error);
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

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!userData?.isAdmin) {
    return (
      <View style={commonStyles.centerContent}>
        <Text style={commonStyles.text}>Access denied. Admin privileges required.</Text>
        <Button text="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Button
            text="← Back"
            onPress={() => router.back()}
            variant="outline"
            style={styles.backButton}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{userName}</Text>
            <Text style={styles.headerSubtitle}>User Chat</Text>
          </View>
        </View>
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
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start the conversation with {userName}</Text>
          </View>
        ) : (
          messages.map((message, index) => {
            const showDateHeader = index === 0 || 
              formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

            return (
              <View key={message.id}>
                {showDateHeader && (
                  <View style={styles.dateHeader}>
                    <Text style={styles.dateHeaderText}>
                      {formatDate(message.timestamp)}
                    </Text>
                  </View>
                )}
                
                <View
                  style={[
                    styles.messageContainer,
                    message.sender === 'admin' ? styles.adminMessage : styles.userMessage
                  ]}
                >
                  <View style={styles.messageHeader}>
                    <Text style={styles.senderName}>{message.senderName}</Text>
                    <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
                  </View>
                  <Text style={styles.messageText}>{message.text}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          onSubmitEditing={sendMessage}
          onKeyPress={handleKeyPress}
          placeholder="Type your response..."
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
          Responding as Admin to {userName}
        </Text>
        <Text style={styles.footerSubtext}>
          Messages are delivered in real-time via Firebase
        </Text>
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
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
    padding: spacing.md,
  },
  messagesContent: {
    paddingBottom: spacing.lg,
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
  dateHeader: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dateHeaderText: {
    fontSize: 12,
    color: colors.textMuted,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  messageContainer: {
    marginBottom: spacing.md,
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  userMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  adminMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
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