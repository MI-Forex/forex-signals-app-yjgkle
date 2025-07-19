import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl, TextInput } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';
import Button from '../../../components/Button';
import { commonStyles, colors, spacing, borderRadius } from '../../../styles/commonStyles';
import { getAllUserChats, ChatUser } from '../../../utils/supabaseChatUtils';

export default function AdminChatsScreen() {
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [filteredChatUsers, setFilteredChatUsers] = useState<ChatUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');
  const { userData } = useAuth();

  useEffect(() => {
    if (!userData?.isAdmin) {
      router.replace('/admin');
      return;
    }
    loadChatUsers();
  }, [userData]);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [chatUsers]);

  const loadChatUsers = async () => {
    try {
      console.log('AdminChats: Loading Supabase chat users...');
      setError('');
      const users = await getAllUserChats();
      setChatUsers(users);
      setFilteredChatUsers(users);
      console.log('AdminChats: Loaded chat users:', users.length);
    } catch (error: any) {
      console.error('AdminChats: Error loading chat users:', error);
      setError('Failed to load chats');
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
    if (query.trim() === '') {
      setFilteredChatUsers(chatUsers);
    } else {
      const filtered = chatUsers.filter(user => 
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        user.displayName.toLowerCase().includes(query.toLowerCase()) ||
        user.lastMessage.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredChatUsers(filtered);
    }
  };

  const getTotalUnreadCount = () => {
    return filteredChatUsers.reduce((total, user) => total + user.unreadCount, 0);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    <View style={commonStyles.container}>
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
          placeholder="Search chats by user name, email, or message..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {searchQuery.trim() !== '' && (
        <View style={styles.searchResults}>
          <Text style={styles.searchResultsText}>
            Found {filteredChatUsers.length} chat{filteredChatUsers.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </Text>
        </View>
      )}

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Total Chats: {filteredChatUsers.length} | Unread Messages: {getTotalUnreadCount()}
        </Text>
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
            <Button text="Retry" onPress={loadChatUsers} style={styles.retryButton} />
          </View>
        ) : filteredChatUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery.trim() !== '' ? 'No chats found matching your search.' : 'No user chats available.'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery.trim() !== '' ? 'Try adjusting your search terms.' : 'Users will appear here when they start chatting.'}
            </Text>
          </View>
        ) : (
          filteredChatUsers.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={[styles.chatCard, user.unreadCount > 0 && styles.unreadChatCard]}
              onPress={() => openChat(user.id, user.displayName)}
              activeOpacity={0.7}
            >
              <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                  <Text style={styles.userName}>{user.displayName}</Text>
                  <Text style={styles.timestamp}>{formatTime(user.lastMessageTime)}</Text>
                </View>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={[styles.lastMessage, user.unreadCount > 0 && styles.unreadMessage]}>
                  {user.lastMessage || 'No messages yet'}
                </Text>
                <View style={styles.chatFooter}>
                  <Text style={[styles.vipStatus, user.isVIP && styles.vipActive]}>
                    {user.isVIP ? 'VIP Member' : 'Regular User'}
                  </Text>
                  {user.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadCount}>{user.unreadCount}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  backButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
  searchResults: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  searchResultsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: colors.surface,
    padding: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  statsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  chatCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unreadChatCard: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: colors.primaryLight || colors.surface,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textMuted,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  unreadMessage: {
    color: colors.text,
    fontWeight: '500',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vipStatus: {
    fontSize: 12,
    color: colors.textMuted,
  },
  vipActive: {
    color: colors.success,
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadCount: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
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