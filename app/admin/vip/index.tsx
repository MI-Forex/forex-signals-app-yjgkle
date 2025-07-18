import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';
import { doc, getDoc, setDoc, collection, query, getDocs, updateDoc, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import Button from '../../../components/Button';
import { commonStyles, colors, spacing, borderRadius } from '../../../styles/commonStyles';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

interface VIPSettings {
  monthlyPrice: number;
  features: string[];
}

interface User {
  id: string;
  email: string;
  displayName?: string;
  isVIP?: boolean;
  createdAt?: Date;
}

interface Signal {
  id: string;
  pair: string;
  type: string;
  entryPoint: number;
  stopLoss: number;
  takeProfit: number;
  status: string;
  createdAt: Date;
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
  const [exportDate, setExportDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [exportType, setExportType] = useState<'users' | 'signals' | null>(null);
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
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
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

  const exportUsersData = async () => {
    try {
      const startOfDay = new Date(exportDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(exportDate);
      endOfDay.setHours(23, 59, 59, 999);

      const usersQuery = query(
        collection(db, 'users'),
        where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
        where('createdAt', '<=', Timestamp.fromDate(endOfDay)),
        orderBy('createdAt', 'desc')
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      // In a real implementation, this would generate and download a CSV file
      console.log('Users data for export:', usersData);
      Alert.alert('Export Users', `Found ${usersData.length} users for ${exportDate.toLocaleDateString()}. CSV export functionality would be implemented here.`);
    } catch (error) {
      console.error('Error exporting users data:', error);
      Alert.alert('Error', 'Failed to export users data');
    }
  };

  const exportSignalsData = async () => {
    try {
      const startOfDay = new Date(exportDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(exportDate);
      endOfDay.setHours(23, 59, 59, 999);

      const signalsQuery = query(
        collection(db, 'signals'),
        where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
        where('createdAt', '<=', Timestamp.fromDate(endOfDay)),
        orderBy('createdAt', 'desc')
      );
      
      const signalsSnapshot = await getDocs(signalsQuery);
      const signalsData = signalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));

      // In a real implementation, this would generate and download a CSV file
      console.log('Signals data for export:', signalsData);
      Alert.alert('Export Signals', `Found ${signalsData.length} signals for ${exportDate.toLocaleDateString()}. CSV export functionality would be implemented here.`);
    } catch (error) {
      console.error('Error exporting signals data:', error);
      Alert.alert('Error', 'Failed to export signals data');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setExportDate(selectedDate);
    }
  };

  const handleExport = (type: 'users' | 'signals') => {
    setExportType(type);
    setShowDatePicker(true);
  };

  const confirmExport = () => {
    if (exportType === 'users') {
      exportUsersData();
    } else if (exportType === 'signals') {
      exportSignalsData();
    }
    setExportType(null);
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
          <Text style={styles.exportDescription}>
            Export data for a specific date. Select the type of data and date to export.
          </Text>
          
          <View style={styles.exportContainer}>
            <Button
              text="Export Users Data (CSV)"
              onPress={() => handleExport('users')}
              variant="outline"
              style={styles.exportButton}
            />
            <Button
              text="Export Signals Data (CSV)"
              onPress={() => handleExport('signals')}
              variant="outline"
              style={styles.exportButton}
            />
          </View>

          {exportType && (
            <View style={styles.dateSelectionContainer}>
              <Text style={styles.dateLabel}>
                Selected Date: {exportDate.toLocaleDateString()}
              </Text>
              <Button
                text={`Confirm Export ${exportType === 'users' ? 'Users' : 'Signals'}`}
                onPress={confirmExport}
                style={styles.confirmButton}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={exportDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
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
  exportDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  exportContainer: {
    gap: spacing.sm,
  },
  exportButton: {
    marginBottom: spacing.sm,
  },
  dateSelectionContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  confirmButton: {
    marginTop: spacing.sm,
  },
});