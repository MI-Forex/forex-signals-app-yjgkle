import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from 'firebase/firestore';
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
  isVip?: boolean;
  targetUsers?: 'normal' | 'vip';
  signalId?: string;
  segment?: string;
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
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
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
    pair: '',
    type: '',
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
    // Apply filters whenever signals or filters change
    let filtered = [...signals];

    // Apply signal type filter (VIP/Normal)
    filtered = applySignalTypeFilter(filtered, signalTypeFilter);

    // Apply other filters
    if (filters.pair) {
      filtered = filtered.filter(signal => 
        signal.pair.toLowerCase().includes(filters.pair.toLowerCase())
      );
    }

    if (filters.type) {
      filtered = filtered.filter(signal => signal.type === filters.type);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(signal => signal.createdAt >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(signal => signal.createdAt <= endDate);
    }

    setFilteredSignals(filtered);
  }, [signals, filters, signalTypeFilter, userData]);

  const loadSignals = async () => {
    // This function is called by the refresh control
    // The real-time listener will handle the actual data loading
    console.log('Manual refresh triggered');
  };

  const applySignalTypeFilter = (signalsToFilter: Signal[], typeFilter: 'all' | 'normal' | 'vip') => {
    if (typeFilter === 'all') {
      // Show all signals if user is VIP, otherwise only normal signals
      if (userData?.isVIP) {
        return signalsToFilter;
      } else {
        return signalsToFilter.filter(signal => 
          signal.targetUsers === 'normal' || !signal.isVip
        );
      }
    } else if (typeFilter === 'normal') {
      return signalsToFilter.filter(signal => 
        signal.targetUsers === 'normal' || !signal.isVip
      );
    } else if (typeFilter === 'vip') {
      // Only show VIP signals if user is VIP
      if (userData?.isVIP) {
        return signalsToFilter.filter(signal => 
          signal.targetUsers === 'vip' || signal.isVip
        );
      } else {
        return [];
      }
    }
    return signalsToFilter;
  };

  const handleRefresh = async () => {
    console.log('Pull to refresh triggered');
    setRefreshing(true);
    
    // Simulate a brief delay to show the refresh indicator
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const applyFilters = (newFilters: typeof filters) => {
    console.log('Applying filters:', newFilters);
    setFilters(newFilters);
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
      <View style={commonStyles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Forex Signals</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading signals...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Forex Signals</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Button
            text="Filter"
            onPress={() => setFilterModalVisible(true)}
            variant="outline"
            style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
          />
          {canManage && (
            <Button
              text="Manage"
              onPress={handleManageSignals}
              variant="primary"
              style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
            />
          )}
        </View>
      </View>

      {/* Signal Type Filter */}
      <View style={styles.filterContainer}>
        <Button
          text="All Signals"
          onPress={() => handleSignalTypeFilter('all')}
          variant={signalTypeFilter === 'all' ? 'primary' : 'outline'}
          style={[
            styles.filterButton,
            signalTypeFilter === 'all' && styles.filterButtonActive
          ]}
          textStyle={[
            styles.filterButtonText,
            signalTypeFilter === 'all' && styles.filterButtonTextActive
          ]}
        />
        <Button
          text="Normal"
          onPress={() => handleSignalTypeFilter('normal')}
          variant={signalTypeFilter === 'normal' ? 'primary' : 'outline'}
          style={[
            styles.filterButton,
            signalTypeFilter === 'normal' && styles.filterButtonActive
          ]}
          textStyle={[
            styles.filterButtonText,
            signalTypeFilter === 'normal' && styles.filterButtonTextActive
          ]}
        />
        {userData?.isVIP && (
          <Button
            text="VIP"
            onPress={() => handleSignalTypeFilter('vip')}
            variant={signalTypeFilter === 'vip' ? 'primary' : 'outline'}
            style={[
              styles.filterButton,
              signalTypeFilter === 'vip' && styles.filterButtonActive
            ]}
            textStyle={[
              styles.filterButtonText,
              signalTypeFilter === 'vip' && styles.filterButtonTextActive
            ]}
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
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredSignals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {signalTypeFilter === 'vip' && !userData?.isVIP
                ? 'VIP signals are available for VIP members only'
                : 'No signals available'
              }
            </Text>
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