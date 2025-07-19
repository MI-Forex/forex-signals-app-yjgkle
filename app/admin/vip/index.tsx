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
  phoneNumber?: string;
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
  targetUsers?: 'normal' | 'vip';
  isVip?: boolean;
}

interface SignalStats {
  totalSignals: number;
  normalSignals: number;
  vipSignals: number;
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
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);
  const [exportType, setExportType] = useState<'users' | 'signals' | null>(null);
  const [signalStats, setSignalStats] = useState<SignalStats>({
    totalSignals: 0,
    normalSignals: 0,
    vipSignals: 0
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const { userData } = useAuth();

  useEffect(() => {
    loadVIPSettings();
    loadUsers();
    loadSignalStats();
  }, []);

  // Update filtered users when users or search query changes
  useEffect(() => {
    handleSearch(searchQuery);
  }, [users]);

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
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSignalStats = async () => {
    setLoadingStats(true);
    try {
      const signalsQuery = query(collection(db, 'signals'), orderBy('createdAt', 'desc'));
      const signalsSnapshot = await getDocs(signalsQuery);
      
      let totalSignals = 0;
      let normalSignals = 0;
      let vipSignals = 0;

      signalsSnapshot.docs.forEach(doc => {
        const signal = doc.data();
        totalSignals++;
        
        // Check if signal is for VIP users
        if (signal.targetUsers === 'vip' || signal.isVip === true) {
          vipSignals++;
        } else {
          normalSignals++;
        }
      });

      setSignalStats({
        totalSignals,
        normalSignals,
        vipSignals
      });
    } catch (error) {
      console.error('Error loading signal stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSearch = (query: string) => {
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
      const csvHeader = 'ID,Pair,Type,Entry Point,Stop Loss,Take Profit,Status,Target Users,Notes,Created At\n';
      const csvContent = signalsData.map(signal => 
        `${signal.id},"${signal.pair}","${signal.type}","${signal.entryPoint}","${signal.stopLoss}","${signal.takeProfit}","${signal.status}","${signal.targetUsers || (signal.isVip ? 'vip' : 'normal')}","${signal.notes || ''}","${signal.createdAt?.toISOString() || ''}"`
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
          <Text style={styles.sectionTitle}>Signal Statistics</Text>
          {loadingStats ? (
            <Text style={styles.loadingText}>Loading statistics...</Text>
          ) : (
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{signalStats.totalSignals}</Text>
                <Text style={styles.statLabel}>Total Signals</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{signalStats.normalSignals}</Text>
                <Text style={styles.statLabel}>Normal User Signals</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{signalStats.vipSignals}</Text>
                <Text style={styles.statLabel}>VIP User Signals</Text>
              </View>
            </View>
          )}
          <Button
            text="Refresh Statistics"
            onPress={loadSignalStats}
            variant="outline"
            style={styles.refreshButton}
            loading={loadingStats}
          />
        </View>

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

          {searchQuery.trim() !== '' && (
            <View style={styles.searchResults}>
              <Text style={styles.searchResultsText}>
                Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </Text>
            </View>
          )}

          {filteredUsers.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.displayName || 'Unknown'}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                {user.phoneNumber && (
                  <Text style={styles.userPhone}>{user.phoneNumber}</Text>
                )}
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
  searchContainer: {
    marginBottom: spacing.md,
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
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  searchResultsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
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
  userPhone: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
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
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  refreshButton: {
    marginTop: spacing.sm,
  },
});