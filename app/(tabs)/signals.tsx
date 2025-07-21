import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import SignalCard from '../../components/SignalCard';
import FilterModal from '../../components/FilterModal';
import Button from '../../components/Button';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';
import { router } from 'expo-router';

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
  isVip?: boolean;
  targetUsers?: 'normal' | 'vip';
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
  filterContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  signalTypeContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  signalTypeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
});

export default function SignalsScreen() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [filteredSignals, setFilteredSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [signalTypeFilter, setSignalTypeFilter] = useState<'all' | 'normal' | 'vip'>('all');
  const [filters, setFilters] = useState({
    pair: 'all',
    type: 'all',
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
  });

  const { user, userData } = useAuth();

  useEffect(() => {
    if (!user) return;

    console.log('Setting up signals listener');
    const q = query(
      collection(db, 'signals'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

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

  useEffect(() => {
    loadSignals();
  }, [signals, filters, signalTypeFilter, userData]);

  const loadSignals = () => {
    let filtered = [...signals];

    // Apply signal type filter based on user VIP status
    filtered = applySignalTypeFilter(filtered, signalTypeFilter);

    // Apply other filters
    if (filters.pair !== 'all') {
      filtered = filtered.filter(signal => signal.pair === filters.pair);
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(signal => signal.type === filters.type);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(signal => signal.createdAt >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      const endOfDay = new Date(filters.dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(signal => signal.createdAt <= endOfDay);
    }

    setFilteredSignals(filtered);
  };

  const applySignalTypeFilter = (signalsToFilter: Signal[], typeFilter: 'all' | 'normal' | 'vip') => {
    if (typeFilter === 'all') {
      // Show all signals user has access to
      if (userData?.isVIP || userData?.isAdmin || userData?.isEditor) {
        return signalsToFilter; // VIP users see all signals
      } else {
        return signalsToFilter.filter(signal => 
          signal.targetUsers === 'normal' || !signal.targetUsers || !signal.isVip
        );
      }
    } else if (typeFilter === 'normal') {
      return signalsToFilter.filter(signal => 
        signal.targetUsers === 'normal' || !signal.targetUsers || !signal.isVip
      );
    } else if (typeFilter === 'vip') {
      if (userData?.isVIP || userData?.isAdmin || userData?.isEditor) {
        return signalsToFilter.filter(signal => 
          signal.targetUsers === 'vip' || signal.isVip
        );
      } else {
        return []; // Non-VIP users can't see VIP signals
      }
    }
    return signalsToFilter;
  };

  const handleRefresh = () => {
    setRefreshing(true);
  };

  const applyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setFilterModalVisible(false);
  };

  const handleManageSignals = () => {
    router.push('/admin/signals');
  };

  const handleSignalTypeFilter = (type: 'all' | 'normal' | 'vip') => {
    setSignalTypeFilter(type);
  };

  // Check if user can manage signals (admin or editor)
  const canManage = userData?.isAdmin || userData?.isEditor;

  if (loading) {
    return (
      <View style={commonStyles.loading}>
        <Text style={commonStyles.text}>Loading signals...</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Forex Signals</Text>
        {canManage && (
          <Button
            text="Manage"
            onPress={handleManageSignals}
            variant="primary"
            style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
          />
        )}
      </View>

      <View style={styles.filterContainer}>
        <Button
          text="Filter"
          onPress={() => setFilterModalVisible(true)}
          variant="outline"
          style={styles.filterButton}
        />
      </View>

      {/* Signal Type Filter - only show if user is VIP, admin, or editor */}
      {(userData?.isVIP || userData?.isAdmin || userData?.isEditor) && (
        <View style={styles.signalTypeContainer}>
          <Button
            text="All Signals"
            onPress={() => handleSignalTypeFilter('all')}
            variant={signalTypeFilter === 'all' ? 'primary' : 'outline'}
            style={styles.signalTypeButton}
          />
          <Button
            text="Normal"
            onPress={() => handleSignalTypeFilter('normal')}
            variant={signalTypeFilter === 'normal' ? 'primary' : 'outline'}
            style={styles.signalTypeButton}
          />
          <Button
            text="VIP Only"
            onPress={() => handleSignalTypeFilter('vip')}
            variant={signalTypeFilter === 'vip' ? 'primary' : 'outline'}
            style={styles.signalTypeButton}
          />
        </View>
      )}

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
        {filteredSignals.length === 0 ? (
          <View style={[commonStyles.centerContent, { minHeight: 200 }]}>
            <Text style={commonStyles.textMuted}>No signals available</Text>
          </View>
        ) : (
          filteredSignals.map((signal) => (
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