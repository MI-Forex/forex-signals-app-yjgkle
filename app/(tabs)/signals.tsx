import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import Button from '../../components/Button';
import { db } from '../../firebase/config';
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from 'firebase/firestore';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';
import SignalCard from '../../components/SignalCard';
import FilterModal from '../../components/FilterModal';

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
    dateTo: undefined as Date | undefined
  });
  const { user, userData } = useAuth();

  useEffect(() => {
    if (user) {
      const unsubscribe = loadSignals();
      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    }
  }, [user, filters]);

  const loadSignals = () => {
    try {
      console.log('Loading signals with filters:', filters);
      setLoading(true);

      // Build query constraints
      const constraints = [orderBy('createdAt', 'desc'), limit(50)];

      // Add date filters if specified
      if (filters.dateFrom) {
        const startOfDay = new Date(filters.dateFrom);
        startOfDay.setHours(0, 0, 0, 0);
        constraints.push(where('createdAt', '>=', Timestamp.fromDate(startOfDay)));
      }

      if (filters.dateTo) {
        const endOfDay = new Date(filters.dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        constraints.push(where('createdAt', '<=', Timestamp.fromDate(endOfDay)));
      }

      // Add type filter if specified
      if (filters.type) {
        constraints.push(where('type', '==', filters.type));
      }

      const signalsQuery = query(collection(db, 'signals'), ...constraints);

      const unsubscribe = onSnapshot(signalsQuery, (snapshot) => {
        console.log('Received signals snapshot, size:', snapshot.size);
        const loadedSignals: Signal[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          const signal: Signal = {
            id: doc.id,
            pair: data.pair,
            type: data.type,
            entryPoint: data.entryPoint,
            stopLoss: data.stopLoss,
            takeProfit: data.takeProfit,
            notes: data.notes,
            status: data.status,
            createdAt: data.createdAt?.toDate() || new Date(),
            createdBy: data.createdBy,
            isVip: data.isVip || false,
            targetUsers: data.targetUsers || (data.isVip ? 'vip' : 'normal')
          };

          // Filter by pair if specified
          if (!filters.pair || signal.pair.toLowerCase().includes(filters.pair.toLowerCase())) {
            // Filter based on user VIP status and signal targeting
            if (userData?.isVIP) {
              // VIP users can see all signals
              loadedSignals.push(signal);
            } else {
              // Normal users can only see normal signals
              if (!signal.isVip && signal.targetUsers !== 'vip') {
                loadedSignals.push(signal);
              }
            }
          }
        });

        console.log('Loaded signals:', loadedSignals.length);
        setSignals(loadedSignals);
        applySignalTypeFilter(loadedSignals, signalTypeFilter);
        setLoading(false);
        setRefreshing(false);
      }, (error) => {
        console.error('Error loading signals:', error);
        
        // Generic error messages for security
        let errorMessage = 'Failed to load signals';
        if (error.code === 'permission-denied') {
          errorMessage = 'Please check your credentials';
        } else if (error.code === 'unavailable') {
          errorMessage = 'Please check internet connectivity';
        }
        
        Alert.alert('Error', errorMessage);
        setLoading(false);
        setRefreshing(false);
      });

      return unsubscribe;
    } catch (error: any) {
      console.error('Error setting up signals listener:', error);
      
      // Generic error messages for security
      let errorMessage = 'Failed to initialize signals';
      if (error.message.includes('network')) {
        errorMessage = 'Please check internet connectivity';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Please check your credentials';
      }
      
      Alert.alert('Error', errorMessage);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applySignalTypeFilter = (signalsToFilter: Signal[], typeFilter: 'all' | 'normal' | 'vip') => {
    let filtered = signalsToFilter;

    if (typeFilter === 'normal') {
      filtered = signalsToFilter.filter(signal => !signal.isVip && signal.targetUsers !== 'vip');
    } else if (typeFilter === 'vip') {
      filtered = signalsToFilter.filter(signal => signal.isVip || signal.targetUsers === 'vip');
    }

    setFilteredSignals(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadSignals();
  };

  const applyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setFilterModalVisible(false);
  };

  const handleManageSignals = () => {
    if (userData?.isAdmin) {
      router.push('/admin/signals');
    }
  };

  const handleSignalTypeFilter = (type: 'all' | 'normal' | 'vip') => {
    setSignalTypeFilter(type);
    applySignalTypeFilter(signals, type);
  };

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Forex Signals</Text>
        <View style={styles.headerButtons}>
          <Button
            text="Filter"
            onPress={() => setFilterModalVisible(true)}
            variant="outline"
            style={styles.headerButton}
          />
          {userData?.isAdmin && (
            <Button
              text="Manage"
              onPress={handleManageSignals}
              style={styles.headerButton}
            />
          )}
        </View>
      </View>

      {/* VIP Signal Type Filter - Only show for VIP users */}
      {userData?.isVIP && (
        <View style={styles.signalTypeFilter}>
          <Text style={styles.filterLabel}>Signal Type:</Text>
          <View style={styles.filterButtons}>
            <Button
              text="All"
              onPress={() => handleSignalTypeFilter('all')}
              variant={signalTypeFilter === 'all' ? 'primary' : 'outline'}
              style={styles.filterButton}
            />
            <Button
              text="Normal"
              onPress={() => handleSignalTypeFilter('normal')}
              variant={signalTypeFilter === 'normal' ? 'primary' : 'outline'}
              style={styles.filterButton}
            />
            <Button
              text="VIP"
              onPress={() => handleSignalTypeFilter('vip')}
              variant={signalTypeFilter === 'vip' ? 'primary' : 'outline'}
              style={styles.filterButton}
            />
          </View>
        </View>
      )}

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading ? (
          <View style={commonStyles.loading}>
            <Text style={commonStyles.text}>Loading signals...</Text>
          </View>
        ) : filteredSignals.length === 0 ? (
          <View style={commonStyles.centerContent}>
            <Text style={commonStyles.text}>No signals available</Text>
            <Text style={styles.emptySubtext}>
              {userData?.isVIP 
                ? 'Check back later for new signals or adjust your filters'
                : 'Upgrade to VIP to access exclusive signals'
              }
            </Text>
          </View>
        ) : (
          filteredSignals.map((signal) => (
            <View key={signal.id} style={styles.signalWrapper}>
              <SignalCard signal={signal} />
              {(signal.isVip || signal.targetUsers === 'vip') && (
                <View style={styles.vipBadge}>
                  <Text style={styles.vipBadgeText}>VIP</Text>
                </View>
              )}
            </View>
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
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  signalTypeFilter: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  signalWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  vipBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  vipBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
});