import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import Button from '../../components/Button';
import SignalCard from '../../components/SignalCard';
import FilterModal from '../../components/FilterModal';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';

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
    if (!user) {
      router.replace('/auth/login');
      return;
    }

    console.log('Setting up signals listener');
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
      
      console.log('Signals updated:', signalsData.length);
      setSignals(signalsData);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error('Error fetching signals:', error);
      setLoading(false);
      setRefreshing(false);
      Alert.alert('Error', 'Failed to load signals');
    });

    return unsubscribe;
  }, [user, filters]);

  const handleRefresh = () => {
    setRefreshing(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleNews = () => {
    router.push('/news');
  };

  const handleAdmin = () => {
    if (userData?.role === 'admin') {
      router.push('/admin');
    }
  };

  const applyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setFilterModalVisible(false);
  };

  if (loading) {
    return (
      <View style={commonStyles.loading}>
        <Text style={commonStyles.text}>Loading signals...</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={[commonStyles.spaceBetween, { padding: spacing.md, paddingBottom: 0 }]}>
        <View>
          <Text style={commonStyles.title}>Forex Signals</Text>
          <Text style={commonStyles.textSecondary}>
            Welcome back, {userData?.displayName || user?.email}
          </Text>
        </View>
        <Button
          text="Profile"
          onPress={handleProfile}
          variant="outline"
          style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
        />
      </View>

      <View style={[commonStyles.row, { padding: spacing.md, gap: spacing.sm }]}>
        <Button
          text="Filter"
          onPress={() => setFilterModalVisible(true)}
          variant="secondary"
          style={{ flex: 1 }}
        />
        <Button
          text="News"
          onPress={handleNews}
          variant="secondary"
          style={{ flex: 1 }}
        />
        {userData?.role === 'admin' && (
          <Button
            text="Admin"
            onPress={handleAdmin}
            variant="success"
            style={{ flex: 1 }}
          />
        )}
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
        {signals.length === 0 ? (
          <View style={[commonStyles.centerContent, { minHeight: 200 }]}>
            <Text style={commonStyles.textMuted}>No signals available</Text>
          </View>
        ) : (
          signals.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))
        )}
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