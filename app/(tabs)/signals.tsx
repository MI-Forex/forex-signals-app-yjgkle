
import FilterModal from '../../components/FilterModal';
import { useAuth } from '../../contexts/AuthContext';
import { View, Text, ScrollView, RefreshControl, Alert, StyleSheet } from 'react-native';
import { checkInternetConnectivity } from '../../utils/networkUtils';
import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase/config';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';
import Button from '../../components/Button';
import SignalCard from '../../components/SignalCard';
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from '@firebase/firestore';
import { router } from 'expo-router';
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  filterButton: {
    flex: 1,
  },
  signalTypeContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  signalTypeButton: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  errorContainer: {
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default function SignalsScreen() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [filteredSignals, setFilteredSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [signalTypeFilter, setSignalTypeFilter] = useState<'all' | 'normal' | 'vip'>('all');
  const [connectivityError, setConnectivityError] = useState<string | null>(null);
  const [refreshTimeout, setRefreshTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const [filters, setFilters] = useState({
    pair: '',
    type: '',
    status: '',
    segment: ''
  });

  const { user, userData } = useAuth();

  const applySignalTypeFilter = useCallback((signalsToFilter: Signal[], typeFilter: 'all' | 'normal' | 'vip'): Signal[] => {
    let filtered = signalsToFilter;

    // Apply signal type filter
    if (typeFilter === 'normal') {
      filtered = filtered.filter(signal => !signal.isVip && signal.targetUsers !== 'vip');
    } else if (typeFilter === 'vip') {
      filtered = filtered.filter(signal => signal.isVip || signal.targetUsers === 'vip');
    }

    // Apply other filters
    if (filters.pair) {
      filtered = filtered.filter(signal => 
        signal.pair.toLowerCase().includes(filters.pair.toLowerCase())
      );
    }

    if (filters.type) {
      filtered = filtered.filter(signal => signal.type === filters.type);
    }

    if (filters.status) {
      filtered = filtered.filter(signal => signal.status === filters.status);
    }

    if (filters.segment) {
      filtered = filtered.filter(signal => signal.segment === filters.segment);
    }

    return filtered;
  }, [filters]);

  const clearRefreshTimeout = useCallback(() => {
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
      setRefreshTimeout(null);
    }
  }, [refreshTimeout]);

  useEffect(() => {
    logScreenView('Signals Screen');
    
    return () => {
      clearRefreshTimeout();
    };
  }, [clearRefreshTimeout]);

  useEffect(() => {
    const filtered = applySignalTypeFilter(signals, signalTypeFilter);
    setFilteredSignals(filtered);
    
    // Log signal filter usage
    if (signalTypeFilter !== 'all') {
      logEvent(ANALYTICS_EVENTS.SIGNAL_FILTER, {
        filter_type: 'signal_type',
        filter_value: signalTypeFilter
      });
    }
  }, [signals, filters, signalTypeFilter, userData, applySignalTypeFilter]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    const setupSignalsListener = async () => {
      try {
        const isConnected = await checkInternetConnectivity();
        if (!isConnected) {
          setConnectivityError('No internet connection. Please check your network and try again.');
          setLoading(false);
          return;
        }

        setConnectivityError(null);

        const signalsRef = collection(db, 'signals');
        let signalsQuery = query(
          signalsRef,
          orderBy('createdAt', 'desc'),
          limit(50)
        );

        // Filter based on user VIP status
        if (!userData?.isVIP) {
          signalsQuery = query(
            signalsRef,
            where('targetUsers', 'in', ['normal', null]),
            orderBy('createdAt', 'desc'),
            limit(50)
          );
        }

        unsubscribe = onSnapshot(
          signalsQuery,
          (snapshot) => {
            const signalsData = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
              } as Signal;
            });

            setSignals(signalsData);
            setLoading(false);
            setRefreshing(false);

            // Clear any existing timeout
            clearRefreshTimeout();

            console.log(`Signals: Loaded ${signalsData.length} signals`);
          },
          (error) => {
            console.error('Signals: Error fetching signals:', error);
            logEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
              error_message: 'Signals fetch error',
              context: 'Signals Screen'
            });
            setLoading(false);
            setRefreshing(false);
          }
        );
      } catch (error) {
        console.error('Signals: Error setting up listener:', error);
        logEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
          error_message: 'Signals listener setup error',
          context: 'Signals Screen'
        });
        setLoading(false);
        setRefreshing(false);
      }
    };

    setupSignalsListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      clearRefreshTimeout();
    };
  }, [user, filters, userData?.isVIP, clearRefreshTimeout]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setConnectivityError(null);
    
    await logEvent(ANALYTICS_EVENTS.SIGNAL_REFRESH);
    
    // Set a timeout to stop refreshing if it takes too long
    const timeout = setTimeout(() => {
      setRefreshing(false);
    }, 10000);
    
    setRefreshTimeout(timeout);
  };

  const applyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setShowFilterModal(false);
    
    // Log filter usage
    const activeFilters = Object.entries(newFilters).filter(([_, value]) => value !== '');
    if (activeFilters.length > 0) {
      logEvent(ANALYTICS_EVENTS.SIGNAL_FILTER, {
        filter_count: activeFilters.length,
        filters: activeFilters.map(([key, value]) => `${key}:${value}`).join(',')
      });
    }
  };

  const handleManageSignals = () => {
    router.push('/admin/signals');
  };

  const handleSignalTypeFilter = (type: 'all' | 'normal' | 'vip') => {
    setSignalTypeFilter(type);
  };

  const dismissConnectivityError = () => {
    setConnectivityError(null);
  };

  const handleSignalPress = (signal: Signal) => {
    logSignalView(signal.id, signal.type, signal.isVip || signal.targetUsers === 'vip');
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={commonStyles.text}>Loading signals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {connectivityError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{connectivityError}</Text>
            <Button
              title="Dismiss"
              onPress={dismissConnectivityError}
              variant="secondary"
              style={{ marginTop: spacing.sm }}
            />
          </View>
        )}

        <View style={styles.header}>
          <Text style={styles.title}>Forex Signals</Text>
          {(userData?.isAdmin || userData?.isEditor) && (
            <Button
              title="Manage"
              onPress={handleManageSignals}
              variant="secondary"
              size="small"
            />
          )}
        </View>

        <View style={styles.signalTypeContainer}>
          <Button
            title="All Signals"
            onPress={() => handleSignalTypeFilter('all')}
            variant={signalTypeFilter === 'all' ? 'primary' : 'secondary'}
            style={styles.signalTypeButton}
            size="small"
          />
          <Button
            title="Normal"
            onPress={() => handleSignalTypeFilter('normal')}
            variant={signalTypeFilter === 'normal' ? 'primary' : 'secondary'}
            style={styles.signalTypeButton}
            size="small"
          />
          <Button
            title="VIP"
            onPress={() => handleSignalTypeFilter('vip')}
            variant={signalTypeFilter === 'vip' ? 'primary' : 'secondary'}
            style={styles.signalTypeButton}
            size="small"
          />
        </View>

        <View style={styles.filterContainer}>
          <Button
            title="Filter Signals"
            onPress={() => setShowFilterModal(true)}
            variant="secondary"
            style={styles.filterButton}
          />
        </View>

        {filteredSignals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {signals.length === 0 
                ? "No signals available at the moment." 
                : "No signals match your current filters."
              }
            </Text>
            {signals.length === 0 && (
              <Button
                title="Refresh"
                onPress={handleRefresh}
                variant="primary"
              />
            )}
          </View>
        ) : (
          filteredSignals.map((signal) => (
            <SignalCard 
              key={signal.id} 
              signal={signal} 
              onPress={() => handleSignalPress(signal)}
            />
          ))
        )}
      </ScrollView>

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={applyFilters}
        currentFilters={filters}
      />
    </View>
  );
}
