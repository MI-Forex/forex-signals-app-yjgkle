import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, RefreshControl, StyleSheet } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';
import { db } from '../../../firebase/config';
import Button from '../../../components/Button';
import { commonStyles, colors, spacing, borderRadius } from '../../../styles/commonStyles';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface UserData {
  id: string;
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  role: 'user' | 'admin';
  isAdmin: boolean;
  createdAt: Date;
  isActive?: boolean;
}

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<UserData[]>([]);
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
        setLoading(false);
        setRefreshing(false);
      });

      return () => unsubscribe();
    }
  }, [userData]);

  const handleRefresh = () => {
    setRefreshing(true);
  };

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
              {users.filter(user => user.isVIP).length}
            </Text>
            <Text style={styles.statLabel}>VIP Members</Text>
          </View>
        </View>

        <View style={styles.usersList}>
          {users.map((user) => (
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
  content: {
    flex: 1,
    padding: spacing.md,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
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
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  userBadges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  adminBadge: {
    backgroundColor: colors.error,
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
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 80,
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