import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../firebase/config';
import { doc, getDoc, setDoc, collection, query, getDocs, updateDoc, deleteDoc, where, orderBy, Timestamp } from 'firebase/firestore';
import { commonStyles, colors, spacing, borderRadius, shadows } from '../../../styles/commonStyles';
import Button from '../../../components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import { supabase } from '../../../utils/supabaseConfig';

interface VIPSettings {
  monthlyPrice: number;
  features: string[];
}

interface WhatsAppSettings {
  url: string;
  enabled: boolean;
}

interface User {
  id: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  isVIP?: boolean;
  vipExpiryDate?: Date;
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
    features: ['Premium Signals', 'Priority Support', 'Advanced Analysis']
  });
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppSettings>({
    url: 'https://wa.me/+919343601863',
    enabled: true
  });
  const [users, setUsers] = useState<User[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [signalStats, setSignalStats] = useState<SignalStats>({
    totalSignals: 0,
    normalSignals: 0,
    vipSignals: 0
  });
  const [loading, setLoading] = useState(false);
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);
  
  const { userData } = useAuth();

  useEffect(() => {
    if (userData?.isAdmin) {
      loadVIPSettings();
      loadWhatsAppSettings();
      loadUsers();
      loadSignalStats();
    }
  }, [userData]);

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchQuery]);

  const loadVIPSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'vip'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setVipSettings({
          monthlyPrice: data.monthlyPrice || 99,
          features: data.features || ['Premium Signals', 'Priority Support', 'Advanced Analysis']
        });
      }
    } catch (error) {
      console.error('Error loading VIP settings:', error);
    }
  };

  const loadWhatsAppSettings = async () => {
    try {
      console.log('Admin VIP: Loading WhatsApp settings from Supabase...');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 8000);
      });

      const queryPromise = supabase
        .from('settings')
        .select('value')
        .eq('id', 'whatsapp_link')
        .single();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.log('Admin VIP: Error loading WhatsApp settings:', error.message);
        // Use default settings if loading fails
        return;
      }

      if (data?.value) {
        console.log('Admin VIP: WhatsApp settings loaded:', data.value);
        const settings = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        setWhatsappSettings({
          url: settings.url || 'https://wa.me/+919343601863',
          enabled: settings.enabled !== false
        });
      }
    } catch (error) {
      console.log('Admin VIP: Error loading WhatsApp settings:', error);
      // Continue with default settings
    }
  };

  const loadUsers = async () => {
    try {
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        vipExpiryDate: doc.data().vipExpiryDate?.toDate()
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadSignalStats = async () => {
    try {
      const signalsQuery = query(collection(db, 'signals'), orderBy('createdAt', 'desc'));
      const signalsSnapshot = await getDocs(signalsQuery);
      const signalsData = signalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Signal[];
      
      setSignals(signalsData);
      
      const stats = {
        totalSignals: signalsData.length,
        normalSignals: signalsData.filter(s => s.targetUsers === 'normal' || !s.isVip).length,
        vipSignals: signalsData.filter(s => s.targetUsers === 'vip' || s.isVip).length
      };
      
      setSignalStats(stats);
    } catch (error) {
      console.error('Error loading signal stats:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const saveVIPSettings = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'vip'), vipSettings);
      Alert.alert('Success', 'VIP settings updated successfully');
    } catch (error) {
      console.error('Error saving VIP settings:', error);
      Alert.alert('Error', 'Failed to update VIP settings');
    } finally {
      setLoading(false);
    }
  };

  const saveWhatsAppSettings = async () => {
    setWhatsappLoading(true);
    try {
      console.log('Admin VIP: Saving WhatsApp settings to Supabase:', whatsappSettings);
      
      // Validate URL format
      if (!whatsappSettings.url || !whatsappSettings.url.trim()) {
        Alert.alert('Error', 'WhatsApp URL cannot be empty');
        return;
      }

      // Ensure URL starts with https://wa.me/ or https://api.whatsapp.com/
      const url = whatsappSettings.url.trim();
      if (!url.startsWith('https://wa.me/') && !url.startsWith('https://api.whatsapp.com/')) {
        Alert.alert('Error', 'Please enter a valid WhatsApp URL (https://wa.me/...)');
        return;
      }

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });

      const updatePromise = supabase
        .from('settings')
        .upsert({
          id: 'whatsapp_link',
          value: whatsappSettings,
          updated_at: new Date().toISOString(),
          updated_by: userData?.uid || 'admin'
        });

      const { error } = await Promise.race([updatePromise, timeoutPromise]) as any;

      if (error) {
        console.error('Admin VIP: Supabase error:', error);
        throw new Error(`Database update failed: ${error.message}`);
      }

      Alert.alert('Success', 'WhatsApp link updated successfully');
      console.log('Admin VIP: WhatsApp settings saved successfully');
    } catch (error) {
      console.error('Admin VIP: Error saving WhatsApp settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to update WhatsApp link: ${errorMessage}`);
    } finally {
      setWhatsappLoading(false);
    }
  };

  const toggleUserVIP = async (userId: string, currentVIPStatus: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      
      if (currentVIPStatus) {
        // Remove VIP status
        await updateDoc(userRef, {
          isVIP: false,
          vipExpiryDate: null,
          updatedAt: new Date()
        });
        Alert.alert('Success', 'VIP status removed');
      } else {
        // Add VIP status with 3-month default duration
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 3);
        
        await updateDoc(userRef, {
          isVIP: true,
          vipExpiryDate: expiryDate,
          updatedAt: new Date()
        });
        Alert.alert('Success', `VIP status granted until ${expiryDate.toLocaleDateString()}`);
      }
      
      loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating VIP status:', error);
      Alert.alert('Error', 'Failed to update VIP status');
    }
  };

  const deleteUser = async (userId: string, userEmail: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userEmail}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', userId));
              Alert.alert('Success', 'User deleted successfully');
              loadUsers();
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
      const fromTimestamp = Timestamp.fromDate(dateFrom);
      const toTimestamp = Timestamp.fromDate(dateTo);
      
      const usersQuery = query(
        collection(db, 'users'),
        where('createdAt', '>=', fromTimestamp),
        where('createdAt', '<=', toTimestamp),
        orderBy('createdAt', 'desc')
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({
        email: doc.data().email,
        displayName: doc.data().displayName,
        phoneNumber: doc.data().phoneNumber,
        isVIP: doc.data().isVIP,
        vipExpiryDate: doc.data().vipExpiryDate?.toDate()?.toLocaleDateString(),
        createdAt: doc.data().createdAt?.toDate()?.toLocaleDateString()
      }));
      
      console.log('Users data for export:', usersData);
      Alert.alert('Export Ready', `Found ${usersData.length} users for the selected date range. Data logged to console.`);
    } catch (error) {
      console.error('Error exporting users data:', error);
      Alert.alert('Error', 'Failed to export users data');
    }
  };

  const exportSignalsData = async () => {
    try {
      const fromTimestamp = Timestamp.fromDate(dateFrom);
      const toTimestamp = Timestamp.fromDate(dateTo);
      
      const signalsQuery = query(
        collection(db, 'signals'),
        where('createdAt', '>=', fromTimestamp),
        where('createdAt', '<=', toTimestamp),
        orderBy('createdAt', 'desc')
      );
      
      const signalsSnapshot = await getDocs(signalsQuery);
      const signalsData = signalsSnapshot.docs.map(doc => ({
        signalId: doc.data().signalId,
        pair: doc.data().pair,
        type: doc.data().type,
        segment: doc.data().segment,
        status: doc.data().status,
        entryPoint: doc.data().entryPoint,
        stopLoss: doc.data().stopLoss,
        takeProfit: doc.data().takeProfit,
        targetUsers: doc.data().targetUsers,
        createdAt: doc.data().createdAt?.toDate()?.toLocaleDateString()
      }));
      
      console.log('Signals data for export:', signalsData);
      Alert.alert('Export Ready', `Found ${signalsData.length} signals for the selected date range. Data logged to console.`);
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
    if (type === 'users') {
      exportUsersData();
    } else {
      exportSignalsData();
    }
  };

  if (!userData?.isAdmin) {
    return (
      <View style={[commonStyles.container, commonStyles.centerContent]}>
        <Text style={commonStyles.text}>Access denied. Admin privileges required.</Text>
        <Button text="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Button 
          text="← Back" 
          onPress={() => router.back()} 
          variant="outline" 
          style={{ borderColor: colors.primary, backgroundColor: colors.background }}
          textStyle={{ color: colors.primary, fontWeight: '600' }}
        />
        <Text style={styles.title}>VIP Settings Management</Text>
      </View>

      {/* Signal Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Signal Statistics</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{signalStats.totalSignals}</Text>
            <Text style={styles.statLabel}>Total Signals</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{signalStats.normalSignals}</Text>
            <Text style={styles.statLabel}>Normal User Signals</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.success }]}>{signalStats.vipSignals}</Text>
            <Text style={styles.statLabel}>VIP Signals</Text>
          </View>
        </View>
      </View>

      {/* Pricing Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing Settings</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Monthly Price ($)</Text>
          <TextInput
            style={styles.input}
            value={vipSettings.monthlyPrice.toString()}
            onChangeText={(text) => setVipSettings(prev => ({ ...prev, monthlyPrice: Number(text) || 0 }))}
            keyboardType="numeric"
            placeholder="99"
          />
        </View>
        <Button
          text={loading ? "Saving..." : "Save Pricing"}
          onPress={saveVIPSettings}
          loading={loading}
          disabled={loading}
          style={styles.saveButton}
          variant="success"
        />
      </View>

      {/* WhatsApp Link Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>WhatsApp Support Settings</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>WhatsApp Link</Text>
          <TextInput
            style={styles.input}
            value={whatsappSettings.url}
            onChangeText={(text) => setWhatsappSettings(prev => ({ ...prev, url: text }))}
            placeholder="https://wa.me/+919343601863"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <View style={styles.checkboxContainer}>
          <Button
            text={whatsappSettings.enabled ? "✓ Enabled" : "✗ Disabled"}
            onPress={() => setWhatsappSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
            variant={whatsappSettings.enabled ? "success" : "outline"}
            style={styles.toggleButton}
          />
        </View>
        <Button
          text={whatsappLoading ? "Saving..." : "Save WhatsApp Settings"}
          onPress={saveWhatsAppSettings}
          loading={whatsappLoading}
          disabled={whatsappLoading}
          style={styles.saveButton}
          variant="primary"
        />
      </View>

      {/* Data Export Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Export Settings</Text>
        <View style={styles.dateContainer}>
          <View style={styles.dateInputContainer}>
            <Text style={styles.label}>From Date</Text>
            <Button
              text={dateFrom.toLocaleDateString()}
              onPress={() => setShowDateFromPicker(true)}
              variant="outline"
              style={styles.dateButton}
            />
          </View>
          <View style={styles.dateInputContainer}>
            <Text style={styles.label}>To Date</Text>
            <Button
              text={dateTo.toLocaleDateString()}
              onPress={() => setShowDateToPicker(true)}
              variant="outline"
              style={styles.dateButton}
            />
          </View>
        </View>
        <View style={styles.exportButtons}>
          <Button
            text="Export Users"
            onPress={() => handleExport('users')}
            variant="outline"
            style={styles.exportButton}
          />
          <Button
            text="Export Signals"
            onPress={() => handleExport('signals')}
            variant="outline"
            style={styles.exportButton}
          />
        </View>
      </View>

      {/* User Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Management</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users by email or name..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
        
        {filteredUsers.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userEmail}>{user.email}</Text>
              {user.displayName && (
                <Text style={styles.userName}>{user.displayName}</Text>
              )}
              {user.isVIP && user.vipExpiryDate && (
                <Text style={styles.vipExpiry}>
                  VIP until: {user.vipExpiryDate.toLocaleDateString()}
                </Text>
              )}
            </View>
            <View style={styles.userActions}>
              <Button
                text={user.isVIP ? "Remove VIP" : "Make VIP"}
                onPress={() => toggleUserVIP(user.id, user.isVIP || false)}
                variant={user.isVIP ? "danger" : "success"}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
    ...shadows.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    letterSpacing: -0.25,
  },
  section: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    padding: spacing.xl,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
    letterSpacing: -0.25,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    minWidth: 80,
    ...shadows.sm,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  saveButton: {
    marginTop: spacing.md,
    ...shadows.md,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  exportButton: {
    flex: 1,
    ...shadows.sm,
  },
  searchContainer: {
    marginBottom: spacing.lg,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  userInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  vipExpiry: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '500',
  },
  userActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 90,
    ...shadows.sm,
  },
  checkboxContainer: {
    marginBottom: spacing.lg,
  },
  toggleButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    ...shadows.sm,
  },
});