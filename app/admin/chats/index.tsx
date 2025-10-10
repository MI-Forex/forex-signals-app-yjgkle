
<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from 'react';
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

  const loadChatUsers = useCallback(async () => {
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
  }, []);

  const handleSearch = useCallback((query: string) => {
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
  }, [chatUsers]);

  useEffect(() => {
    if (userData?.isAdmin) {
      loadChatUsers();
    } else {
      router.replace('/(tabs)/signals');
    }
  }, [userData, loadChatUsers]);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [chatUsers, handleSearch, searchQuery]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadChatUsers();
  };

  const openChat = (userId: string, userName: string) => {
    console.log('AdminChats: Opening chat for user:', userId, userName);
    router.push(`/admin/chats/${userId}?userName=${encodeURIComponent(userName)}`);
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
=======
import Button from '../../../components/Button';
import { router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { commonStyles, colors, spacing, borderRadius } from '../../../styles/commonStyles';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, RefreshControl } from 'react-native';
import { supabase, SupabaseChat } from '../../../utils/supabaseConfig';
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
<<<<<<< HEAD
    padding: spacing.md,
=======
    padding: spacing.lg,
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
<<<<<<< HEAD
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  backButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
=======
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
  searchContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  searchInput: {
    backgroundColor: colors.background,
<<<<<<< HEAD
    borderRadius: borderRadius.md,
=======
    borderRadius: borderRadius.lg,
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
<<<<<<< HEAD
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
=======
  chatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
<<<<<<< HEAD
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
=======
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  chatEmail: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  chatLastMessage: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  chatTime: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  vipBadge: {
    backgroundColor: colors.warning,
    borderRadius: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  vipText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
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
});

export default function AdminChatsScreen() {
  const [chats, setChats] = useState<SupabaseChat[]>([]);
  const [filteredChats, setFilteredChats] = useState<SupabaseChat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { userData } = useAuth();

  const loadChats = useCallback(async () => {
    try {
      console.log('Loading chats...');
      const { data, error } = await supabase
        .from('chats')
        .select('*')
        .order('last_message_time', { ascending: false });

      if (error) {
        console.error('Error loading chats:', error);
        return;
      }

      console.log('Chats loaded:', data?.length || 0);
      setChats(data || []);
      setFilteredChats(data || []);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredChats(chats);
      return;
    }

    const filtered = chats.filter(chat => 
      chat.user_name.toLowerCase().includes(query.toLowerCase()) ||
      chat.user_email.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredChats(filtered);
  }, [chats]);

  useEffect(() => {
    // Check if user has permission
    if (!userData?.isAdmin && userData?.role !== 'admin') {
      router.back();
      return;
    }

    loadChats();

    // Subscribe to chat updates
    const subscription = supabase
      .channel('chats_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chats' },
        () => {
          console.log('Chats updated, reloading...');
          loadChats();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userData, loadChats]);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadChats();
  };

  const handleChatPress = (chat: SupabaseChat) => {
    router.push(`/admin/chats/${chat.user_id}`);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Chats</Text>
          <Button
            text="Back"
            onPress={() => router.back()}
            variant="outline"
            size="small"
          />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Loading chats...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <Button
          text="Back"
          onPress={() => router.back()}
          variant="outline"
          size="small"
        />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {filteredChats.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No chats found' : 'No chats yet'}
            </Text>
          </View>
        ) : (
          filteredChats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatItem}
              onPress={() => handleChatPress(chat)}
            >
              <View style={styles.chatInfo}>
                <Text style={styles.chatName}>{chat.user_name}</Text>
                <Text style={styles.chatEmail}>{chat.user_email}</Text>
                <Text style={styles.chatLastMessage} numberOfLines={1}>
                  {chat.last_message}
                </Text>
              </View>
              <View style={styles.chatMeta}>
                <Text style={styles.chatTime}>
                  {formatTime(chat.last_message_time)}
                </Text>
                {chat.unread_count > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{chat.unread_count}</Text>
                  </View>
                )}
                {chat.is_vip && (
                  <View style={styles.vipBadge}>
                    <Text style={styles.vipText}>VIP</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
