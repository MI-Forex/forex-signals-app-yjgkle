import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';
import { doc, getDoc, setDoc, collection, query, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import Button from '../../../components/Button';
import { commonStyles, colors, spacing, borderRadius } from '../../../styles/commonStyles';

interface VIPSettings {
  monthlyPrice: number;
  features: string[];
}

interface User {
  id: string;
  email: string;
  displayName?: string;
  isVIP?: boolean;
}

export default function AdminVIPScreen() {
  const [vipSettings, setVipSettings] = useState<VIPSettings>({
    monthlyPrice: 99,
    features: [
      'Exclusive high-accuracy signals',
      'Priority customer support',
      'Advanced market analysis',
      'Real-time notifications',
      'Weekly market reports',
      '1-on-1 trading consultation',
      'Direct chat with admin'
    ]
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { userData } = useAuth();

  useEffect(() => {
    loadVIPSettings();
    loadUsers();
  }, []);

  const loadVIPSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'vip'));
      if (settingsDoc.exists()) {
        setVipSettings(settingsDoc.data() as VIPSettings);
      }
    } catch (error) {
      console.error('Error loading VIP settings:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveVIPSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'vip'), vipSettings);
      Alert.alert('Success', 'VIP settings updated successfully');
    } catch (error) {
      console.error('Error saving VIP settings:', error);
      Alert.alert('Error', 'Failed to save VIP settings');
    } finally {
      setSaving(false);
    }
  };

  const toggleUserVIP = async (userId: string, currentVIPStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isVIP: !currentVIPStatus
      });
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isVIP: !currentVIPStatus } : user
      ));
      
      Alert.alert('Success', `User VIP status ${!currentVIPStatus ? 'granted' : 'removed'}`);
    } catch (error) {
      console.error('Error updating user VIP status:', error);
      Alert.alert('Error', 'Failed to update user VIP status');
    }
  };

  const exportData = () => {
    // This would typically generate and download CSV data
    Alert.alert('Export Data', 'CSV export functionality would be implemented here with date filtering options.');
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
        <Text style={commonStyles.text}>Loading VIP settings...</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>VIP Settings Management</Text>
        <Button
          text="Back"
          onPress={() => router.back()}
          variant="outline"
          style={styles.backButton}
        />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing Settings</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.label}>Monthly Price ($)</Text>
            <TextInput
              style={styles.priceInput}
              value={vipSettings.monthlyPrice.toString()}
              onChangeText={(text) => {
                const price = parseFloat(text) || 0;
                setVipSettings(prev => ({ ...prev, monthlyPrice: price }));
              }}
              keyboardType="numeric"
              placeholder="Enter monthly price"
            />
          </View>
          <Button
            text="Save Settings"
            onPress={saveVIPSettings}
            loading={saving}
            style={styles.saveButton}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Management</Text>
          {users.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.displayName || 'Unknown'}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={[styles.vipStatus, user.isVIP && styles.vipActive]}>
                  {user.isVIP ? 'VIP Member' : 'Regular User'}
                </Text>
              </View>
              <Button
                text={user.isVIP ? 'Remove VIP' : 'Make VIP'}
                onPress={() => toggleUserVIP(user.id, user.isVIP || false)}
                variant={user.isVIP ? 'danger' : 'success'}
                style={styles.vipButton}
              />
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Export</Text>
          <Button
            text="Export Users & Signals Data (CSV)"
            onPress={exportData}
            variant="outline"
            style={styles.exportButton}
          />
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
  },
  backButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  priceContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  priceInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveButton: {
    marginTop: spacing.md,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  vipStatus: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  vipActive: {
    color: colors.success,
    fontWeight: '600',
  },
  vipButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  exportButton: {
    marginTop: spacing.sm,
  },
});