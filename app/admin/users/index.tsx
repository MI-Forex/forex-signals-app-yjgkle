
import Button from '../../../components/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from '@firebase/firestore';
import { db } from '../../../firebase/config';
import { commonStyles, colors, spacing, borderRadius } from '../../../styles/commonStyles';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Alert, RefreshControl, StyleSheet, TextInput } from 'react-native';

interface UserData {
  id: string;
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  role: 'user' | 'admin' | 'editor';
  isAdmin: boolean;
  isEditor?: boolean;
  createdAt: Date;
  isActive?: boolean;
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
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  searchContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userCard: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  userInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  adminBadge: {
    backgroundColor: colors.danger,
  },
  editorBadge: {
    backgroundColor: colors.warning,
  },
  inactiveBadge: {
    backgroundColor: colors.textMuted,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
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

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { userData } = useAuth();

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(query.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredUsers(filtered);
  }, [users]);

  useEffect(() => {
    // Check if user has permission
    if (!userData?.isAdmin && userData?.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have permission to manage users');
      router.back();
      return;
    }

    console.log('Setting up users listener');
    const q = query(collection(db, 'users'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as UserData[];
      
      console.log('Users updated:', usersData.length);
      setUsers(usersData);
      setFilteredUsers(usersData);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to load users');
      setLoading(false);
      setRefreshing(false);
    });

    return unsubscribe;
  }, [userData]);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  const handleRefresh = () => {
    setRefreshing(true);
    // The onSnapshot listener will automatically update the data
  };

  const handleBack = () => {
    router.back();
  };

  const handleDeactivateUser = async (userId: string, isActive: boolean) => {
    try {
      const action = isActive ? 'deactivate' : 'activate';
      Alert.alert(
        `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
        `Are you sure you want to ${action} this user?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: action.charAt(0).toUpperCase() + action.slice(1),
            style: 'destructive',
            onPress: async () => {
              await updateDoc(doc(db, 'users', userId), {
                isActive: !isActive
              });
              Alert.alert('Success', `User ${action}d successfully`);
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error updating user:', error);
      Alert.alert('Error', 'Failed to update user');
    }
  };

  const handleMakeEditor = async (userId: string, isCurrentlyEditor: boolean) => {
    try {
      const action = isCurrentlyEditor ? 'remove editor role from' : 'make editor';
      Alert.alert(
        `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
        `Are you sure you want to ${action} this user?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Confirm',
            onPress: async () => {
              await updateDoc(doc(db, 'users', userId), {
                isEditor: !isCurrentlyEditor,
                role: isCurrentlyEditor ? 'user' : 'editor'
              });
              Alert.alert('Success', `User role updated successfully`);
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error updating user role:', error);
      Alert.alert('Error', 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    try {
      Alert.alert(
        'Delete User',
        `Are you sure you want to delete ${userEmail}? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await deleteDoc(doc(db, 'users', userId));
              Alert.alert('Success', 'User deleted successfully');
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error deleting user:', error);
      Alert.alert('Error', 'Failed to delete user');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Users</Text>
          <Button
            text="Back"
            onPress={handleBack}
            variant="outline"
            size="small"
          />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Loading users...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Users</Text>
        <Button
          text="Back"
          onPress={handleBack}
          variant="outline"
          size="small"
        />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
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
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'No users found' : 'No users yet'}
            </Text>
          </View>
        ) : (
          filteredUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userHeader}>
                <Text style={styles.userName}>
                  {user.displayName || 'No Name'}
                </Text>
              </View>
              
              <Text style={styles.userEmail}>{user.email}</Text>
              
              {user.phoneNumber && (
                <Text style={styles.userInfo}>Phone: {user.phoneNumber}</Text>
              )}
              
              <Text style={styles.userInfo}>
                Joined: {user.createdAt.toLocaleDateString()}
              </Text>

              <View style={styles.badgeContainer}>
                {user.isAdmin && (
                  <View style={[styles.badge, styles.adminBadge]}>
                    <Text style={styles.badgeText}>ADMIN</Text>
                  </View>
                )}
                {user.isEditor && (
                  <View style={[styles.badge, styles.editorBadge]}>
                    <Text style={styles.badgeText}>EDITOR</Text>
                  </View>
                )}
                {user.isActive === false && (
                  <View style={[styles.badge, styles.inactiveBadge]}>
                    <Text style={styles.badgeText}>INACTIVE</Text>
                  </View>
                )}
              </View>

              {!user.isAdmin && (
                <View style={styles.buttonContainer}>
                  <Button
                    text={user.isEditor ? 'Remove Editor' : 'Make Editor'}
                    onPress={() => handleMakeEditor(user.id, user.isEditor || false)}
                    variant="outline"
                    size="small"
                    style={{ flex: 1 }}
                  />
                  <Button
                    text={user.isActive === false ? 'Activate' : 'Deactivate'}
                    onPress={() => handleDeactivateUser(user.id, user.isActive !== false)}
                    variant="outline"
                    size="small"
                    style={{ flex: 1 }}
                  />
                  <Button
                    text="Delete"
                    onPress={() => handleDeleteUser(user.id, user.email)}
                    variant="outline"
                    size="small"
                    style={{ flex: 1 }}
                  />
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
