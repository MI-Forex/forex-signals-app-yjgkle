import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where, getDocs } from 'firebase/firestore';
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
  const { userData } = useAuth();

  useEffect(() => {
    if (userData?.isAdmin) {
      loadChatUsers();
    }
  }, [userData]);

  const loadChatUsers = async () => {
    try {
      // In a real implementation with Supabase, this would load actual chat data
      // For now, we'll simulate chat users
      const simulatedChatUsers: ChatUser[] = [
        {
          id: 'user1',
          email: 'john.doe@example.com',
          displayName: 'John Doe',
          lastMessage: 'Hi, I\'m interested in VIP membership. Can you help me?',
          lastMessageTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          unreadCount: 2,
          isVIP: false
        },
        {
          id: 'user2',
          email: 'jane.smith@example.com',
          displayName: 'Jane Smith',
          lastMessage: 'Thank you for the VIP upgrade! The signals are amazing.',
          lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          unreadCount: 0,
          isVIP: true
        },
        {
          id: 'user3',
          email: 'mike.wilson@example.com',
          displayName: 'Mike Wilson',
          lastMessage: 'When will the next market analysis be available?',
          lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          unreadCount: 1,
          isVIP: true
        }
      ];

      setChatUsers(simulatedChatUsers);
    } catch (error) {
      console.error('Error loading chat users:', error);
      Alert.alert('Error', 'Failed to load chat users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadChatUsers();
  };

  const openChat = (userId: string, userName: string) => {
    // Mark messages as read
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
          <Text style={styles.infoTitle}>Chat Management</Text>
          <Text style={styles.infoText}>
            • Users can initiate chats from the VIP section
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
          
          <View style={styles.supabaseNote}>
            <Text style={styles.supabaseNoteTitle}>📝 Implementation Note</Text>
            <Text style={styles.supabaseNoteText}>
              For full real-time chat functionality, please enable Supabase by pressing the Supabase button and connecting to your project. This will enable:
            </Text>
            <Text style={styles.supabaseNoteText}>• Real-time message synchronization</Text>
            <Text style={styles.supabaseNoteText}>• Persistent chat history</Text>
            <Text style={styles.supabaseNoteText}>• Push notifications for new messages</Text>
            <Text style={styles.supabaseNoteText}>• Advanced chat features</Text>
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
  supabaseNote: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  supabaseNoteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  supabaseNoteText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: spacing.xs,
  },
});