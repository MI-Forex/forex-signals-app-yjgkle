
import { checkInternetConnectivity } from '../../utils/networkUtils';
import SignalCard from '../../components/SignalCard';
import { router } from 'expo-router';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import FilterModal from '../../components/FilterModal';
import { View, Text, ScrollView, RefreshControl, Alert, StyleSheet } from 'react-native';
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from '@firebase/firestore';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';
import { logScreenView, logSignalView, logEvent, ANALYTICS_EVENTS } from '../../utils/analyticsUtils';

interface Signal {
  id: string;
  pair: string;
  type: 'BUY' | 'SELL';
  entryPoint: number;
  stopLoss: number;
  takeProfit: number;
  notes?: string;
  status: 'active' | 'closed' | 'hit_tp' | 'hit_sl' | 'inprogress' | 'pending';
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
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  refreshingContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  refreshingText: {
    fontSize: 14,
    color: colors.primary,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  connectivityError: {
    backgroundColor: colors.error,
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: spacing.sm,
    alignItems: 'center',
  },
  connectivityErrorText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default function SignalsScreen() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    pair: '',
    type: '',
    status: '',
  });
  const [signalTypeFilter, setSignalTypeFilter] = useState<'all' | 'normal' | 'vip'>('all');
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [showConnectivityError, setShowConnectivityError] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { user, userData } = useAuth();

  const clearRefreshTimeout = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  }, []);

  const applySignalTypeFilter = useCallback((allSignals: Signal[]) => {
    if (signalTypeFilter === 'all') {
      return allSignals;
    } else if (signalTypeFilter === 'vip') {
      return allSignals.filter(signal => signal.isVip || signal.targetUsers === 'vip');
    } else {
      return allSignals.filter(signal => !signal.isVip && signal.targetUsers !== 'vip');
    }
  }, [signalTypeFilter]);

  useEffect(() => {
    if (!user) return;

    console.log('Setting up signals listener');
    console.log('User VIP status:', userData?.isVIP);
    console.log('Signal type filter:', signalTypeFilter);

    let q;
    
    // Build query based on filters and VIP status
    if (filters.pair || filters.type || filters.status) {
      const constraints = [orderBy('createdAt', 'desc'), limit(50)];
      
      if (filters.pair) {
        constraints.unshift(where('pair', '==', filters.pair));
      }
      if (filters.type) {
        constraints.unshift(where('type', '==', filters.type));
      }
      if (filters.status) {
        constraints.unshift(where('status', '==', filters.status));
      }
      
      q = query(collection(db, 'signals'), ...constraints);
    } else {
      q = query(
        collection(db, 'signals'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let signalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Signal[];
      
      // Apply signal type filter
      signalsData = applySignalTypeFilter(signalsData);
      
      console.log('Signals updated:', signalsData.length);
      setSignals(signalsData);
      setLoading(false);
      setShowConnectivityError(false);
      
      // Complete refresh if we're refreshing
      if (refreshing) {
        console.log('Signals refresh completed via listener');
        setRefreshing(false);
        setLastRefreshTime(new Date());
        clearRefreshTimeout();
      }
    }, (error) => {
      console.error('Error fetching signals:', error);
      setLoading(false);
      
      // Stop refreshing on error
      if (refreshing) {
        setRefreshing(false);
        clearRefreshTimeout();
      }
      
      // Check if it's a network error
      if (error.message.includes('network') || error.message.includes('offline') || error.code === 'unavailable') {
        setShowConnectivityError(true);
      } else {
        let errorMessage = 'Failed to load signals';
        if (error.message.includes('permission')) {
          errorMessage = 'Please check your credentials';
        }
        
        Alert.alert('Error', errorMessage);
      }
    });

    return () => {
      unsubscribe();
      clearRefreshTimeout();
    };
  }, [user, filters, signalTypeFilter, userData?.isVIP, applySignalTypeFilter, refreshing, clearRefreshTimeout]);

  useEffect(() => {
    return () => {
      clearRefreshTimeout();
    };
  }, [clearRefreshTimeout]);

  const handleRefresh = async () => {
    console.log('Pull to refresh triggered for signals');
    
    // Check internet connectivity first
    const isConnected = await checkInternetConnectivity();
    if (!isConnected) {
      console.log('No internet connectivity detected');
      setShowConnectivityError(true);
      Alert.alert('No Internet Connection', 'Please check your internet connectivity.');
      return;
    }

    setRefreshing(true);
    setLastRefreshTime(new Date());
    setShowConnectivityError(false);
    
    // Clear any existing timeout
    clearRefreshTimeout();
    
    // Fallback timeout to ensure refresh completes
    refreshTimeoutRef.current = setTimeout(() => {
      console.log('Signals refresh timeout - completing refresh');
      setRefreshing(false);
      refreshTimeoutRef.current = null;
    }, 5000); // 5 seconds timeout
  };

  const applyFilters = (newFilters: typeof filters) => {
    console.log('Applying filters:', newFilters);
    setFilters(newFilters);
    setFilterModalVisible(false);
  };

  const handleManageSignals = () => {
    router.push('/admin/signals');
  };

  const handleSignalTypeFilter = (type: 'all' | 'normal' | 'vip') => {
    console.log('Setting signal type filter:', type);
    setSignalTypeFilter(type);
  };

  const dismissConnectivityError = () => {
    setShowConnectivityError(false);
  };

  const handleSignalPress = (signal: Signal) => {
    logSignalView(signal.id, signal.type, signal.isVip || signal.targetUsers === 'vip');
  };

  // Check if user can manage signals (admin or editor)
  const canManage = userData?.isAdmin || userData?.isEditor;

  if (loading) {
    return (
      <View style={commonStyles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Forex Signals</Text>
        </View>
        <View style={commonStyles.loading}>
          <Text style={commonStyles.text}>Loading signals...</Text>
        </View>
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

      {/* Signal Type Filter */}
      <View style={styles.filterContainer}>
        <Button
          text="All"
          onPress={() => handleSignalTypeFilter('all')}
          variant={signalTypeFilter === 'all' ? 'primary' : 'outline'}
          style={{ flex: 1, paddingVertical: spacing.sm }}
        />
        <Button
          text="Normal"
          onPress={() => handleSignalTypeFilter('normal')}
          variant={signalTypeFilter === 'normal' ? 'primary' : 'outline'}
          style={{ flex: 1, paddingVertical: spacing.sm }}
        />
        <Button
          text="VIP"
          onPress={() => handleSignalTypeFilter('vip')}
          variant={signalTypeFilter === 'vip' ? 'primary' : 'outline'}
          style={{ flex: 1, paddingVertical: spacing.sm }}
        />
      </View>

      {/* Connectivity Error Banner */}
      {showConnectivityError && (
        <View style={styles.connectivityError}>
          <Text style={styles.connectivityErrorText}>
            Please check your internet connectivity
          </Text>
          <Button
            text="Dismiss"
            onPress={dismissConnectivityError}
            variant="outline"
            style={{ 
              marginTop: spacing.sm, 
              paddingHorizontal: spacing.md, 
              paddingVertical: spacing.xs,
              borderColor: colors.white,
            }}
            textStyle={{ color: colors.white, fontSize: 12 }}
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
            colors={[colors.primary]}
            title="Pull to refresh signals"
            titleColor={colors.textMuted}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {refreshing && (
          <View style={styles.refreshingContainer}>
            <Text style={styles.refreshingText}>Refreshing signals...</Text>
          </View>
        )}
        
        {signals.length === 0 ? (
          <View style={[commonStyles.centerContent, { minHeight: 200 }]}>
            <Text style={commonStyles.textMuted}>No signals available</Text>
            {lastRefreshTime && (
              <Text style={[commonStyles.textMuted, { fontSize: 12, marginTop: spacing.sm }]}>
                Last updated: {lastRefreshTime.toLocaleTimeString()}
              </Text>
            )}
          </View>
        ) : (
          signals.map((signal) => (
            <SignalCard 
              key={signal.id} 
              signal={signal} 
              onPress={() => handleSignalPress(signal)}
            />
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
