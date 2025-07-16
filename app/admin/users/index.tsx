import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, RefreshControl, StyleSheet } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';
import Button from '../../../components/Button';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { commonStyles, colors, spacing, borderRadius } from '../../../styles/commonStyles';

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
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  userCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  userInfo: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  adminBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  adminText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  inactiveBadge: {
    backgroundColor: colors.danger,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  inactiveText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
});

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { userData } = useAuth();

  useEffect(() => {
    if (userData?.role !== 'admin') {
      router.replace('/(tabs)/profile');
      return;
    }

    console.log('Setting up users listener for admin');
    const q = query(collection(db, 'users'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as UserData[];
      
      console.log('Admin users updated:', usersData.length);
      setUsers(usersData);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error('Error fetching users:', error);
      setLoading(false);
      setRefreshing(false);
      Alert.alert('Error', 'Failed to load users');
    });

    return unsubscribe;
  }, [userData]);

  const handleRefresh = () => {
    setRefreshing(true);
  };

  const handleBack = () => {
    router.back();
  };

  const handleDeactivateUser = async (userId: string, isActive: boolean) => {
    const action = isActive ? 'deactivate' : 'activate';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      `Are you sure you want to ${action} this user?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'users', userId), {
                isActive: !isActive
              });
              Alert.alert('Success', `User ${action}d successfully`);
            } catch (error) {
              console.error(`Error ${action}ing user:`, error);
              Alert.alert('Error', `Failed to ${action} user`);
            }
          }
        }
      ]
    );
  };

  const handleDeleteUser = async (userId: string) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to permanently delete this user? This action cannot be undone.',
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
              Alert.alert('Error', 'Failed to delete user');
            }
          }
        }
      ]
    );
  };

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
        <Text style={styles.title}>Manage Users</Text>
        <Button
          text="Back"
          onPress={handleBack}
          variant="outline"
          style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
        />
      </View>

      <ScrollView
        style={commonStyles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {users.length === 0 ? (
          <View style={[commonStyles.centerContent, { minHeight: 200 }]}>
            <Text style={commonStyles.textMuted}>No users found</Text>
          </View>
        ) : (
          users.map((user) => (
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

              <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm }}>
                {user.isAdmin && (
                  <View style={styles.adminBadge}>
                    <Text style={styles.adminText}>ADMIN</Text>
                  </View>
                )}
                
                {user.isActive === false && (
                  <View style={styles.inactiveBadge}>
                    <Text style={styles.inactiveText}>INACTIVE</Text>
                  </View>
                )}
              </View>

              {user.uid !== userData?.uid && (
                <View style={styles.actions}>
                  <Button
                    text={user.isActive === false ? "Activate" : "Deactivate"}
                    onPress={() => handleDeactivateUser(user.id, user.isActive !== false)}
                    variant={user.isActive === false ? "success" : "secondary"}
                    style={styles.actionButton}
                  />
                  <Button
                    text="Delete"
                    onPress={() => handleDeleteUser(user.id)}
                    variant="danger"
                    style={styles.actionButton}
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