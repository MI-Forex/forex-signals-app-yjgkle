import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { commonStyles, colors, spacing, borderRadius } from '../../../styles/commonStyles';
import Button from '../../../components/Button';
import { getAllUserChats, ChatUser } from '../../../utils/supabaseChatUtils';

export default function AdminChatsScreen() {
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [filteredChatUsers, setFilteredChatUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string>('');
  const { userData } = useAuth();

  useEffect(() => {
    if (userData?.isAdmin) {
      loadChatUsers();
    } else {
      router.replace('/(tabs)/signals');
    }
  }, [userData]);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [chatUsers]);

  const loadChatUsers = async () => {
    try {
      console.log('AdminChats: Loading user chats...');
      setError('');
      
      const users = await getAllUserChats();
      setChatUsers(users);
      setFilteredChatUsers(users);
      console.log('AdminChats: Loaded chat users:', users.length);
    } catch (error: any) {
      console.error('AdminChats: Error loading chats Error:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      setError('Failed to load chats: ' + errorMessage);
      Alert.alert('Error', `Failed to load chats: ${errorMessage}`);
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
    console.log('AdminChats: Opening chat for user:', userId, userName);
    router.push(`/admin/chats/${userId}?userName=${encodeURIComponent(userName)}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredChatUsers(chatUsers);
      return;
    }

    const filtered = chatUsers.filter(user =>
      user.userName.toLowerCase().includes(query.toLowerCase()) ||
      user.userEmail.toLowerCase().includes(query.toLowerCase()) ||
      user.lastMessage.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredChatUsers(filtered);
  };

  const getTotalUnreadCount = () => {
    return filteredChatUsers.reduce((total, user) => total + user.unreadCount, 0);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!userData?.isAdmin) {
    return (
      <View style={[commonStyles.container, commonStyles.centered]}>
        <Text style={commonStyles.text}>Access denied</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Chats & Support</Text>
        <Button
          text="Back"
          onPress={() => router.back()}
          variant="outline"
          style={styles.backButton}
        />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users, emails, or messages..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Total Chats: {filteredChatUsers.length} | Unread Messages: {getTotalUnreadCount()}
        </Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Button text="Retry" onPress={loadChatUsers} style={styles.retryButton} />
        </View>
      ) : (
        <ScrollView
          style={styles.chatsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading chats...</Text>
            </View>
          ) : filteredChatUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No chats found matching your search' : 'No user chats available'}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try a different search term' : 'Users will appear here when they start chatting'}
              </Text>
            </View>
          ) : (
            filteredChatUsers.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={styles.chatItem}
                onPress={() => openChat(user.userId, user.userName)}
                activeOpacity={0.7}
              >
                <View style={styles.chatHeader}>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.userName}</Text>
                    <Text style={styles.userEmail}>{user.userEmail}</Text>
                    {user.isVip && (
                      <Text style={styles.vipBadge}>VIP</Text>
                    )}
                  </View>
                  <View style={styles.chatMeta}>
                    <Text style={styles.timestamp}>{formatTime(user.lastMessageTime)}</Text>
                    {user.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadCount}>{user.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.lastMessage} numberOfLines={2}>
                  {user.lastMessage || 'No messages yet'}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </View>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  backButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  searchContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statsContainer: {
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statsText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  chatsList: {
    flex: 1,
  },
  chatItem: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  userEmail: {
    fontSize: 12,
    color: colors.textMuted,
  },
  vipBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  chatMeta: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textMuted,
  },
  unreadBadge: {
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
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
  errorContainer: {
    padding: spacing.xl,
    alignItems: 'center',
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
});