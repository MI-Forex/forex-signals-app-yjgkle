import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';
import Button from '../../../components/Button';
import { commonStyles, colors, spacing, borderRadius } from '../../../styles/commonStyles';
import { collection, query, orderBy, onSnapshot, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { markMessagesAsRead, getAllUserChats } from '../../../utils/chatUtils';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  senderName: string;
  senderEmail: string;
  timestamp: Date;
  read: boolean;
  userId: string;
}

interface ChatUser {
  id: string;
  email: string;
  displayName: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isVIP: boolean;
}

export default function AdminChatsScreen() {
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');
  const { userData } = useAuth();

  useEffect(() => {
    if (userData?.isAdmin) {
      const unsubscribe = loadChatUsers();
      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    } else {
      router.replace('/');
    }
  }, [userData]);

  const loadChatUsers = () => {
    try {
      console.log('AdminChats: Loading chat users...');
      setLoading(true);
      setError('');

      // Listen for real-time updates to chats
      const chatsQuery = query(
        collection(db, 'chats'),
        orderBy('lastMessageTime', 'desc')
      );

      const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
        console.log('AdminChats: Received chats snapshot, size:', snapshot.size);
        
        try {
          const users: ChatUser[] = [];
          
          for (const chatDoc of snapshot.docs) {
            const chatData = chatDoc.data();
            const userId = chatData.userId;
            
            if (!userId) continue;
            
            // Get user data
            const userQuery = query(
              collection(db, 'users'),
              where('uid', '==', userId),
              limit(1)
            );
            
            const userSnapshot = await getDocs(userQuery);
            
            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data();
              
              // Get unread count for this chat
              const unreadQuery = query(
                collection(db, 'messages'),
                where('chatId', '==', chatDoc.id),
                where('sender', '==', 'user'),
                where('read', '==', false)
              );
              
              const unreadSnapshot = await getDocs(unreadQuery);
              
              users.push({
                id: userId,
                email: userData.email || '',
                displayName: userData.displayName || 'Unknown User',
                lastMessage: chatData.lastMessage || 'No messages yet',
                lastMessageTime: chatData.lastMessageTime?.toDate() || new Date(),
                unreadCount: unreadSnapshot.size,
                isVIP: userData.isVIP || false
              });
            }
          }
          
          console.log('AdminChats: Loaded chat users:', users.length);
          setChatUsers(users);
          setLoading(false);
          setRefreshing(false);
          setError('');
        } catch (error: any) {
          console.error('AdminChats: Error processing chats:', error);
          setError('Failed to load chat data: ' + error.message);
          setLoading(false);
          setRefreshing(false);
        }
      }, (error) => {
        console.error('AdminChats: Error in chats listener:', error);
        setError('Failed to load chats: ' + error.message);
        setLoading(false);
        setRefreshing(false);
      });

      return unsubscribe;
    } catch (error: any) {
      console.error('AdminChats: Error setting up chat listener:', error);
      setError('Failed to initialize chats: ' + error.message);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setError('');
    loadChatUsers();
  };

  const openChat = async (userId: string, userName: string) => {
    try {
      console.log('AdminChats: Opening chat for user:', userId);
      
      // Mark user messages as read when admin opens the chat
      const chatId = `${userId}_admin`;
      await markMessagesAsRead(chatId, 'user');
      
      router.push({
        pathname: '/admin/chats/[userId]',
        params: { userId, userName }
      });
    } catch (error: any) {
      console.error('AdminChats: Error opening chat:', error);
      Alert.alert('Error', 'Failed to open chat: ' + error.message);
    }
  };

  const getTotalUnreadCount = () => {
    return chatUsers.reduce((total, user) => total + user.unreadCount, 0);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
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
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Button
            text="← Back"
            onPress={() => router.back()}
            variant="outline"
            style={styles.backButton}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>User Chats & Support</Text>
            <Text style={styles.headerSubtitle}>
              {getTotalUnreadCount()} unread messages
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading chats...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <Button 
              text="Retry" 
              onPress={handleRefresh} 
              style={styles.retryButton}
            />
          </View>
        ) : chatUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No user chats yet</Text>
            <Text style={styles.emptySubtext}>
              Users will appear here when they start chatting with you
            </Text>
          </View>
        ) : (
          chatUsers.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={[
                styles.chatItem,
                user.unreadCount > 0 && styles.chatItemUnread
              ]}
              onPress={() => openChat(user.id, user.displayName)}
            >
              <View style={styles.chatItemLeft}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {user.displayName}
                    {user.isVIP && <Text style={styles.vipBadge}> VIP</Text>}
                  </Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={2}>
                  {user.lastMessage}
                </Text>
              </View>
              
              <View style={styles.chatItemRight}>
                <Text style={styles.timestamp}>
                  {formatTime(user.lastMessageTime)}
                </Text>
                {user.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCount}>
                      {user.unreadCount > 99 ? '99+' : user.unreadCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Total Users: {chatUsers.length} | Unread: {getTotalUnreadCount()}
        </Text>
        <Text style={styles.footerSubtext}>
          Real-time chat updates via Firebase
        </Text>
      </View>
    </View>
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
  content: {
    flex: 1,
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
  chatItem: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chatItemUnread: {
    backgroundColor: colors.primary + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  chatItemLeft: {
    flex: 1,
    marginRight: spacing.md,
  },
  userInfo: {
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  vipBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 18,
  },
  chatItemRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  timestamp: {
    fontSize: 12,
    color: colors.textMuted,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.surface,
  },
  footer: {
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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