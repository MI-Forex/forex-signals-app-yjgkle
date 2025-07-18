import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';
import { collection, query, orderBy, onSnapshot, where, getDocs, limit } from 'firebase/firestore';
import { markMessagesAsRead } from '../../../utils/chatUtils';
import { db } from '../../../firebase/config';
import Button from '../../../components/Button';
import { commonStyles, colors, spacing, borderRadius } from '../../../styles/commonStyles';

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
      console.log('AdminChats: Loading chats for admin user');
      const unsubscribe = loadChatUsers();
      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    } else {
      setError('Admin access required');
      setLoading(false);
    }
  }, [userData]);

  const loadChatUsers = async () => {
    try {
      console.log('AdminChats: Starting to load chat users...');
      setError('');
      
      // Get all chat conversations
      const chatsQuery = query(
        collection(db, 'chats'),
        orderBy('lastMessageTime', 'desc')
      );

      const unsubscribe = onSnapshot(chatsQuery, async (snapshot) => {
        console.log('AdminChats: Received chats snapshot, size:', snapshot.size);
        const chatUserMap = new Map<string, ChatUser>();

        for (const chatDoc of snapshot.docs) {
          try {
            const chatData = chatDoc.data();
            const userId = chatData.userId;
            
            if (!userId || userId === userData?.uid) continue;

            console.log('AdminChats: Processing chat for user:', userId);

            // Get user data
            const userQuery = query(
              collection(db, 'users'),
              where('uid', '==', userId),
              limit(1)
            );
            
            const userSnapshot = await getDocs(userQuery);
            if (userSnapshot.empty) {
              console.log('AdminChats: User not found:', userId);
              continue;
            }

            const userDocData = userSnapshot.docs[0].data();
            
            // Get unread count for this user (messages from user that admin hasn't read)
            const unreadQuery = query(
              collection(db, 'messages'),
              where('chatId', '==', chatDoc.id),
              where('sender', '==', 'user'),
              where('read', '==', false)
            );
            
            const unreadSnapshot = await getDocs(unreadQuery);
            const unreadCount = unreadSnapshot.size;

            const chatUser: ChatUser = {
              id: userId,
              email: userDocData.email || '',
              displayName: userDocData.displayName || 'Unknown User',
              lastMessage: chatData.lastMessage || 'No messages yet',
              lastMessageTime: chatData.lastMessageTime?.toDate() || new Date(),
              unreadCount,
              isVIP: userDocData.isVIP || false
            };

            chatUserMap.set(userId, chatUser);
            console.log('AdminChats: Added chat user:', chatUser.displayName);
          } catch (userError) {
            console.error('AdminChats: Error processing user chat:', userError);
          }
        }

        const chatUsersArray = Array.from(chatUserMap.values());
        console.log('AdminChats: Total chat users loaded:', chatUsersArray.length);
        setChatUsers(chatUsersArray);
        setLoading(false);
        setRefreshing(false);
      }, (error) => {
        console.error('AdminChats: Error in chats listener:', error);
        setError('Failed to load chats: ' + error.message);
        setLoading(false);
        setRefreshing(false);
      });

      return unsubscribe;
    } catch (error: any) {
      console.error('AdminChats: Error loading chat users:', error);
      setError('Failed to load chat users: ' + error.message);
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
      
      // Mark messages as read in Firebase
      const chatId = `${userId}_admin`;
      await markMessagesAsRead(chatId, 'user');
      console.log('AdminChats: Marked messages as read for user:', userId);

      // Update local state
      setChatUsers(prev => 
        prev.map(user => 
          user.id === userId ? { ...user, unreadCount: 0 } : user
        )
      );

      // Navigate to individual chat screen
      router.push({
        pathname: '/admin/chats/[userId]',
        params: { userId, userName }
      });
    } catch (error) {
      console.error('AdminChats: Error opening chat:', error);
      // Still navigate even if marking as read fails
      router.push({
        pathname: '/admin/chats/[userId]',
        params: { userId, userName }
      });
    }
  };

  const getTotalUnreadCount = () => {
    return chatUsers.reduce((total, user) => total + user.unreadCount, 0);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
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

  if (loading) {
    return (
      <View style={commonStyles.loading}>
        <Text style={commonStyles.text}>Loading chats...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={commonStyles.centerContent}>
        <Text style={[commonStyles.text, { color: colors.error }]}>Error: {error}</Text>
        <Button text="Retry" onPress={handleRefresh} style={{ marginTop: spacing.md }} />
        <Button text="Go Back" onPress={() => router.back()} variant="outline" style={{ marginTop: spacing.sm }} />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>User Chats</Text>
          {getTotalUnreadCount() > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{getTotalUnreadCount()}</Text>
            </View>
          )}
        </View>
        <Button
          text="Back"
          onPress={() => router.back()}
          variant="outline"
          style={styles.backButton}
        />
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {chatUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No chat conversations yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Users can start chatting with you from the VIP section
            </Text>
          </View>
        ) : (
          <View style={styles.chatList}>
            {chatUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[
                  styles.chatUserCard,
                  user.unreadCount > 0 && styles.chatUserCardUnread
                ]}
                onPress={() => openChat(user.id, user.displayName)}
              >
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {user.displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                
                <View style={styles.chatUserInfo}>
                  <View style={styles.chatUserHeader}>
                    <Text style={[
                      styles.chatUserName,
                      user.unreadCount > 0 && styles.chatUserNameUnread
                    ]}>
                      {user.displayName}
                    </Text>
                    <View style={styles.chatUserMeta}>
                      {user.isVIP && (
                        <View style={styles.vipBadge}>
                          <Text style={styles.vipBadgeText}>VIP</Text>
                        </View>
                      )}
                      <Text style={styles.chatTime}>
                        {formatTime(user.lastMessageTime)}
                      </Text>
                    </View>
                  </View>
                  
                  <Text style={styles.chatUserEmail}>{user.email}</Text>
                  
                  <View style={styles.lastMessageContainer}>
                    <Text 
                      style={[
                        styles.lastMessage,
                        user.unreadCount > 0 && styles.lastMessageUnread
                      ]}
                      numberOfLines={2}
                    >
                      {user.lastMessage}
                    </Text>
                    {user.unreadCount > 0 && (
                      <View style={styles.messageUnreadBadge}>
                        <Text style={styles.messageUnreadBadgeText}>
                          {user.unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Firebase Chat Management</Text>
          <Text style={styles.infoText}>
            • Users can initiate chats from the VIP section
          </Text>
          <Text style={styles.infoText}>
            • Real-time message synchronization via Firebase
          </Text>
          <Text style={styles.infoText}>
            • Unread messages are highlighted with badges
          </Text>
          <Text style={styles.infoText}>
            • VIP members are marked with a VIP badge
          </Text>
          <Text style={styles.infoText}>
            • Tap on any conversation to open the chat
          </Text>
          <Text style={styles.infoText}>
            • Automatic read status tracking
          </Text>
          
          <View style={styles.firebaseNote}>
            <Text style={styles.firebaseNoteTitle}>🔥 Firebase Implementation</Text>
            <Text style={styles.firebaseNoteText}>
              Complete Firebase Firestore chat system with:
            </Text>
            <Text style={styles.firebaseNoteText}>• Real-time message synchronization</Text>
            <Text style={styles.firebaseNoteText}>• Persistent chat history storage</Text>
            <Text style={styles.firebaseNoteText}>• Automatic read status tracking</Text>
            <Text style={styles.firebaseNoteText}>• Multi-user chat support</Text>
            <Text style={styles.firebaseNoteText}>• Admin notification system</Text>
            <Text style={styles.firebaseNoteText}>• Scalable chat architecture</Text>
            <Text style={styles.firebaseNoteText}>• Error handling and retry logic</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: spacing.sm,
  },
  unreadBadge: {
    backgroundColor: colors.error,
    borderRadius: 12,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  backButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl * 2,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  chatList: {
    padding: spacing.md,
  },
  chatUserCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chatUserCardUnread: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  userAvatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatUserInfo: {
    flex: 1,
  },
  chatUserHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  chatUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  chatUserNameUnread: {
    fontWeight: 'bold',
  },
  chatUserMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  vipBadge: {
    backgroundColor: colors.success,
    borderRadius: 8,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  vipBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  chatTime: {
    fontSize: 12,
    color: colors.textMuted,
  },
  chatUserEmail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  lastMessageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  lastMessageUnread: {
    color: colors.text,
    fontWeight: '500',
  },
  messageUnreadBadge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  messageUnreadBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  firebaseNote: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  firebaseNoteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  firebaseNoteText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: spacing.xs,
  },
});