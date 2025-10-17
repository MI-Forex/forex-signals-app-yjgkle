import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';
import SignalCard from '../../components/SignalCard';
import FilterModal from '../../components/FilterModal';
import Button from '../../components/Button';

interface Signal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entryPoint: number;
  stopLoss: number;
  takeProfit: number;
  notes?: string;
  status: 'active' | 'closed' | 'hit_tp' | 'hit_sl';
  createdAt: Date;
  createdBy: string;
}

export default function DashboardScreen() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    pair: '',
    type: '',
    status: ''
  });

  const { user, userData, logout } = useAuth();

  useEffect(() => {
    if (!user) return;

    console.log('Setting up signals listener with filters:', filters);
    
    let q = query(
      collection(db, 'signals'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    // Apply filters
    if (filters.pair) {
      q = query(q, where('pair', '==', filters.pair));
    }
    if (filters.type) {
      q = query(q, where('type', '==', filters.type));
    }
    if (filters.status) {
      q = query(q, where('status', '==', filters.status));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const signalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Signal[];
      
      console.log('Received signals:', signalsData.length);
      setSignals(signalsData);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error('Error fetching signals:', error);
      setLoading(false);
      setRefreshing(false);
      Alert.alert('Error', 'Failed to load signals. Please try again.');
    });

    return unsubscribe;
  }, [user, filters]);

  const handleRefresh = () => {
    setRefreshing(true);
    // The useEffect will handle the refresh through the listener
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleNews = () => {
    router.push('/news');
  };

  const handleAdmin = () => {
    router.push('/admin');
  };

  const applyFilters = (newFilters: typeof filters) => {
    console.log('Applying filters:', newFilters);
    setFilters(newFilters);
    setFilterModalVisible(false);
  };

  if (loading) {
    return (
      <View style={commonStyles.centerContent}>
        <Text style={commonStyles.textSecondary}>Loading signals...</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      {/* Header with Logo */}
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/00a46297-3f16-4e57-967e-c79ec0897b80.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.welcomeText}>
          Welcome, {userData?.displayName || user?.email}
        </Text>
      </View>

      <ScrollView
        style={commonStyles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={commonStyles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Text style={commonStyles.sectionTitle}>Latest Signals</Text>
            <Button
              text="Filter"
              onPress={() => setFilterModalVisible(true)}
              variant="outline"
              style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
            />
          </View>

          {signals.length === 0 ? (
            <View style={commonStyles.centerContent}>
              <Text style={commonStyles.textSecondary}>No signals available</Text>
            </View>
          ) : (
            signals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))
          )}
        </View>

        <View style={commonStyles.section}>
          <View style={{ flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' }}>
            <Button
              text="News"
              onPress={handleNews}
              variant="outline"
              style={{ flex: 1, minWidth: 100 }}
            />
            <Button
              text="Profile"
              onPress={handleProfile}
              variant="outline"
              style={{ flex: 1, minWidth: 100 }}
            />
            {userData?.role === 'admin' && (
              <Button
                text="Admin"
                onPress={handleAdmin}
                variant="success"
                style={{ flex: 1, minWidth: 100 }}
              />
            )}
          </View>
          
          <Button
            text="Logout"
            onPress={handleLogout}
            variant="danger"
            style={{ marginTop: spacing.md }}
          />
        </View>
      </ScrollView>

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={applyFilters}
        currentFilters={filters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLogo: {
    width: 60,
    height: 60,
    marginBottom: spacing.sm,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
});