import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';
import { doc, getDoc, setDoc, collection, query, getDocs, updateDoc, deleteDoc, where, orderBy, Timestamp } from 'firebase/firestore';
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
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);
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

  const deleteUser = async (userId: string, userEmail: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete user ${userEmail}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', userId));
              setUsers(prev => prev.filter(user => user.id !== userId));
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

  const exportUsersData = async () => {
    try {
      const startOfDay = new Date(dateFrom);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(dateTo);
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

      // Generate CSV content
      const csvHeader = 'ID,Email,Display Name,Phone Number,VIP Status,Created At\n';
      const csvContent = usersData.map(user => 
        `${user.id},"${user.email}","${user.displayName || ''}","${user.phoneNumber || ''}","${user.isVIP ? 'Yes' : 'No'}","${user.createdAt?.toISOString() || ''}"`
      ).join('\n');
      
      const fullCsv = csvHeader + csvContent;
      
      console.log('Users CSV data:', fullCsv);
      Alert.alert(
        'Export Users', 
        `Found ${usersData.length} users from ${dateFrom.toLocaleDateString()} to ${dateTo.toLocaleDateString()}.\n\nCSV data has been logged to console. In a production app, this would be downloaded as a file.`
      );
    } catch (error) {
      console.error('Error exporting users data:', error);
      Alert.alert('Error', 'Failed to export users data');
    }
  };

  const exportSignalsData = async () => {
    try {
      const startOfDay = new Date(dateFrom);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(dateTo);
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

      // Generate CSV content
      const csvHeader = 'ID,Pair,Type,Entry Point,Stop Loss,Take Profit,Status,Notes,Created At\n';
      const csvContent = signalsData.map(signal => 
        `${signal.id},"${signal.pair}","${signal.type}","${signal.entryPoint}","${signal.stopLoss}","${signal.takeProfit}","${signal.status}","${signal.notes || ''}","${signal.createdAt?.toISOString() || ''}"`
      ).join('\n');
      
      const fullCsv = csvHeader + csvContent;
      
      console.log('Signals CSV data:', fullCsv);
      Alert.alert(
        'Export Signals', 
        `Found ${signalsData.length} signals from ${dateFrom.toLocaleDateString()} to ${dateTo.toLocaleDateString()}.\n\nCSV data has been logged to console. In a production app, this would be downloaded as a file.`
      );
    } catch (error) {
      console.error('Error exporting signals data:', error);
      Alert.alert('Error', 'Failed to export signals data');
    }
  };

  const handleDateFromChange = (event: any, selectedDate?: Date) => {
    setShowDateFromPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateFrom(selectedDate);
    }
  };

  const handleDateToChange = (event: any, selectedDate?: Date) => {
    setShowDateToPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateTo(selectedDate);
    }
  };

  const handleExport = (type: 'users' | 'signals') => {
    setExportType(type);
    if (type === 'users') {
      exportUsersData();
    } else {
      exportSignalsData();
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
              <View style={styles.userActions}>
                <Button
                  text={user.isVIP ? 'Remove VIP' : 'Make VIP'}
                  onPress={() => toggleUserVIP(user.id, user.isVIP || false)}
                  variant={user.isVIP ? 'outline' : 'success'}
                  style={styles.actionButton}
                />
                <Button
                  text="Delete"
                  onPress={() => deleteUser(user.id, user.email)}
                  variant="danger"
                  style={styles.actionButton}
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Export</Text>
          <Text style={styles.exportDescription}>
            Export data for a date range. Select the start and end dates, then choose the type of data to export.
          </Text>
          
          <View style={styles.dateRangeContainer}>
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>From Date:</Text>
              <Button
                text={dateFrom.toLocaleDateString()}
                onPress={() => setShowDateFromPicker(true)}
                variant="outline"
                style={styles.dateButton}
              />
            </View>
            
            <View style={styles.dateInputContainer}>
              <Text style={styles.dateLabel}>To Date:</Text>
              <Button
                text={dateTo.toLocaleDateString()}
                onPress={() => setShowDateToPicker(true)}
                variant="outline"
                style={styles.dateButton}
              />
            </View>
          </View>

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
        </View>
      </ScrollView>

      {showDateFromPicker && (
        <DateTimePicker
          value={dateFrom}
          mode="date"
          display="default"
          onChange={handleDateFromChange}
        />
      )}

      {showDateToPicker && (
        <DateTimePicker
          value={dateTo}
          mode="date"
          display="default"
          onChange={handleDateToChange}
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
  userActions: {
    flexDirection: 'column',
    gap: spacing.xs,
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 80,
  },
  exportDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  dateButton: {
    paddingVertical: spacing.sm,
  },
  exportContainer: {
    gap: spacing.sm,
  },
  exportButton: {
    marginBottom: spacing.sm,
  },
});