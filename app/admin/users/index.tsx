<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Alert, RefreshControl, StyleSheet, TextInput } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';
import { db } from '../../../firebase/config';
import Button from '../../../components/Button';
import { commonStyles, colors, spacing, borderRadius } from '../../../styles/commonStyles';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
=======

import Button from '../../../components/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from '@firebase/firestore';
import { db } from '../../../firebase/config';
import { commonStyles, colors, spacing, borderRadius } from '../../../styles/commonStyles';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Alert, RefreshControl, StyleSheet, TextInput } from 'react-native';
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62

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

<<<<<<< HEAD
export default function AdminUsersScreen() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { userData } = useAuth();

  useEffect(() => {
    if (userData?.isAdmin) {
      const usersQuery = query(collection(db, 'users'));
      const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as UserData[];
        setUsers(usersData);
        setFilteredUsers(usersData);
        setLoading(false);
        setRefreshing(false);
      });

      return () => unsubscribe();
    }
  }, [userData]);

  const handleRefresh = () => {
    setRefreshing(true);
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        (user.displayName && user.displayName.toLowerCase().includes(query.toLowerCase())) ||
        (user.phoneNumber && user.phoneNumber.includes(query))
      );
      setFilteredUsers(filtered);
    }
  }, [users]);

  // Update filtered users when users array changes
  useEffect(() => {
    handleSearch(searchQuery);
  }, [users, handleSearch, searchQuery]);

  const handleBack = () => {
    router.back();
  };

  const handleDeactivateUser = async (userId: string, isActive: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isActive: !isActive
      });
      Alert.alert('Success', `User ${!isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const handleMakeEditor = async (userId: string, isCurrentlyEditor: boolean) => {
    try {
      const newRole = isCurrentlyEditor ? 'user' : 'editor';
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        isEditor: !isCurrentlyEditor
      });
      Alert.alert(
        'Success', 
        `User ${isCurrentlyEditor ? 'removed from' : 'assigned as'} Editor successfully`
      );
    } catch (error) {
      console.error('Error updating user role:', error);
      Alert.alert('Error', 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    // Prevent admin from deleting themselves
    if (userId === userData?.uid) {
      Alert.alert('Error', 'You cannot delete your own account');
      return;
    }

    Alert.alert(
      'Delete User',
      `Are you sure you want to permanently delete user "${userEmail}"?\n\nThis action cannot be undone and will remove:
      • User account and profile
      • All user data
      • Chat history
      • VIP status
      
      The user will no longer be able to access the app.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', userId));
              Alert.alert('Success', 'User deleted successfully');
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (!userData?.isAdmin) {
    return (
      <View style={commonStyles.centerContent}>
        <Text style={commonStyles.text}>Access denied. Admin privileges required.</Text>
        <Button text="Go Back" onPress={handleBack} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={commonStyles.loading}>
        <Text style={commonStyles.text}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <Button
          text="Back"
          onPress={handleBack}
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
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users by name, email, or phone..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{users.length}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {users.filter(user => user.isAdmin).length}
            </Text>
            <Text style={styles.statLabel}>Admins</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {users.filter(user => user.isEditor).length}
            </Text>
            <Text style={styles.statLabel}>Editors</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {users.filter(user => user.isVIP).length}
            </Text>
            <Text style={styles.statLabel}>VIP Members</Text>
          </View>
        </View>

        {searchQuery.trim() !== '' && (
          <View style={styles.searchResults}>
            <Text style={styles.searchResultsText}>
              Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </Text>
          </View>
        )}

        <View style={styles.usersList}>
          {filteredUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <View style={styles.userHeader}>
                  <Text style={styles.userName}>
                    {user.displayName || 'Unknown User'}
                  </Text>
                  <View style={styles.userBadges}>
                    {user.isAdmin && (
                      <View style={styles.adminBadge}>
                        <Text style={styles.badgeText}>ADMIN</Text>
                      </View>
                    )}
                    {user.isEditor && (
                      <View style={styles.editorBadge}>
                        <Text style={styles.badgeText}>EDITOR</Text>
                      </View>
                    )}
                    {user.isVIP && (
                      <View style={styles.vipBadge}>
                        <Text style={styles.badgeText}>VIP</Text>
                      </View>
                    )}
                    {user.isActive === false && (
                      <View style={styles.inactiveBadge}>
                        <Text style={styles.badgeText}>INACTIVE</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <Text style={styles.userEmail}>{user.email}</Text>
                
                {user.phoneNumber && (
                  <Text style={styles.userPhone}>{user.phoneNumber}</Text>
                )}
                
                <Text style={styles.userDate}>
                  Joined: {user.createdAt.toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.userActions}>
                {!user.isAdmin && (
                  <>
                    <Button
                      text={user.isActive !== false ? 'Deactivate' : 'Activate'}
                      onPress={() => handleDeactivateUser(user.id, user.isActive !== false)}
                      variant={user.isActive !== false ? 'outline' : 'success'}
                      style={styles.actionButton}
                    />
                    
                    <Button
                      text={user.isEditor ? 'Remove Editor' : 'Make Editor'}
                      onPress={() => handleMakeEditor(user.id, user.isEditor || false)}
                      variant={user.isEditor ? 'warning' : 'primary'}
                      style={styles.actionButton}
                    />
                    
                    <Button
                      text="Delete"
                      onPress={() => handleDeleteUser(user.id, user.email)}
                      variant="danger"
                      style={styles.actionButton}
                    />
                  </>
                )}
                
                {user.isAdmin && user.id === userData?.uid && (
                  <Text style={styles.currentUserText}>Current User</Text>
                )}
                
                {user.isAdmin && user.id !== userData?.uid && (
                  <Text style={styles.adminUserText}>Admin User</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>User Management</Text>
          <Text style={styles.infoText}>
            • View all registered users and their details
          </Text>
          <Text style={styles.infoText}>
            • Activate or deactivate user accounts
          </Text>
          <Text style={styles.infoText}>
            • Assign or remove Editor role to users
          </Text>
          <Text style={styles.infoText}>
            • Delete user accounts permanently
          </Text>
          <Text style={styles.infoText}>
            • Monitor VIP memberships and admin roles
          </Text>
          <Text style={styles.infoText}>
            • Admin accounts cannot be deleted by other admins
          </Text>
          
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>⚠️ Important Notes</Text>
            <Text style={styles.warningText}>
              • Editors can add and manage signals, analysis, and news
            </Text>
            <Text style={styles.warningText}>
              • Deleting a user is permanent and cannot be undone
            </Text>
            <Text style={styles.warningText}>
              • Deleted users will lose all data and access
            </Text>
            <Text style={styles.warningText}>
              • Consider deactivating instead of deleting
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
=======
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
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
    flex: 1,
  },
  backButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  searchContainer: {
    marginBottom: spacing.md,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
<<<<<<< HEAD
  searchResults: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  searchResultsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  usersList: {
    marginBottom: spacing.lg,
  },
  userCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userInfo: {
    marginBottom: spacing.md,
  },
=======
  userCard: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  userName: {
<<<<<<< HEAD
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  userBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  adminBadge: {
    backgroundColor: colors.error,
    borderRadius: 8,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  editorBadge: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  vipBadge: {
    backgroundColor: colors.success,
    borderRadius: 8,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  inactiveBadge: {
    backgroundColor: colors.textMuted,
    borderRadius: 8,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  userPhone: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  userDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  userActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 70,
  },
  currentUserText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    alignSelf: 'center',
  },
  adminUserText: {
    fontSize: 12,
    color: colors.textMuted,
    alignSelf: 'center',
  },
  infoSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
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
  warningBox: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  warningText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: spacing.xs,
  },
});
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
