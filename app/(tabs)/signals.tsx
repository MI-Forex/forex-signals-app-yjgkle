
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
import { checkInternetConnectivity } from '../../utils/networkUtils';

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
  console.log('SignalsScreen: Component rendering');
  const [signals, setSignals] = useState<Signal[]>([]);
  const [filteredSignals, setFilteredSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [signalTypeFilter, setSignalTypeFilter] = useState<'all' | 'normal' | 'vip'>('all');
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [refreshTimeout, setRefreshTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showConnectivityError, setShowConnectivityError] = useState(false);
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
      setShowConnectivityError(false);
      
      // Complete refresh if we're refreshing
      if (refreshing) {
        console.log('Signals refresh completed via listener');
        setRefreshing(false);
        setLastRefreshTime(new Date());
        
        // Clear any existing timeout
        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
          setRefreshTimeout(null);
        }
      }
    }, (error) => {
      console.error('Error fetching signals:', error);
      setLoading(false);
      
      // Stop refreshing on error
      if (refreshing) {
        setRefreshing(false);
        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
          setRefreshTimeout(null);
        }
      }
      
      // Check if it's a network error
      if (error.message.includes('network') || error.message.includes('offline') || error.code === 'unavailable') {
        setShowConnectivityError(true);
      } else {
        // Generic error messages for security
        let errorMessage = 'Failed to load signals';
        if (error.message.includes('permission')) {
          errorMessage = 'Please check your credentials';
        }
        
        Alert.alert('Error', errorMessage);
      }
    });

    return () => {
      unsubscribe();
      // Clear timeout on cleanup
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [user, filters, refreshTimeout]);

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
    console.log('Pull to refresh triggered for signals');
    
    // Check internet connectivity first
    try {
      const isConnected = await checkInternetConnectivity();
      if (!isConnected) {
        console.log('No internet connectivity detected');
        setShowConnectivityError(true);
        Alert.alert('No Internet Connection', 'Please check your internet connectivity.');
        return;
      }
    } catch (error) {
      console.error('Error checking connectivity:', error);
      // Continue with refresh even if connectivity check fails
    }

    setRefreshing(true);
    setLastRefreshTime(new Date());
    setShowConnectivityError(false);
    
    // Clear any existing timeout
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }
    
    // Fallback timeout to ensure refresh completes
    const timeout = setTimeout(() => {
      console.log('Signals refresh timeout - completing refresh');
      setRefreshing(false);
      setRefreshTimeout(null);
    }, 5000); // 5 seconds timeout
    
    setRefreshTimeout(timeout);
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

  const dismissConnectivityError = () => {
    setShowConnectivityError(false);
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
            style={StyleSheet.flatten({ paddingHorizontal: spacing.md, paddingVertical: spacing.sm })}
          />
          {canManage && (
            <Button
              text="Manage"
              onPress={handleManageSignals}
              variant="primary"
              style={StyleSheet.flatten({ paddingHorizontal: spacing.md, paddingVertical: spacing.sm })}
            />
          )}
        </View>
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
            style={StyleSheet.flatten({ 
              marginTop: spacing.sm, 
              paddingHorizontal: spacing.md, 
              paddingVertical: spacing.xs,
              borderColor: colors.white,
            })}
            textStyle={StyleSheet.flatten({ color: colors.white, fontSize: 12 })}
          />
        </View>
      )}

      {/* Signal Type Filter */}
      <View style={styles.filterContainer}>
        <Button
          text="All Signals"
          onPress={() => handleSignalTypeFilter('all')}
          variant={signalTypeFilter === 'all' ? 'primary' : 'outline'}
          style={StyleSheet.flatten([
            styles.filterButton,
            signalTypeFilter === 'all' && styles.filterButtonActive
          ])}
          textStyle={StyleSheet.flatten([
            styles.filterButtonText,
            signalTypeFilter === 'all' && styles.filterButtonTextActive
          ])}
        />
        <Button
          text="Normal"
          onPress={() => handleSignalTypeFilter('normal')}
          variant={signalTypeFilter === 'normal' ? 'primary' : 'outline'}
          style={StyleSheet.flatten([
            styles.filterButton,
            signalTypeFilter === 'normal' && styles.filterButtonActive
          ])}
          textStyle={StyleSheet.flatten([
            styles.filterButtonText,
            signalTypeFilter === 'normal' && styles.filterButtonTextActive
          ])}
        />
        {userData?.isVIP && (
          <Button
            text="VIP"
            onPress={() => handleSignalTypeFilter('vip')}
            variant={signalTypeFilter === 'vip' ? 'primary' : 'outline'}
            style={StyleSheet.flatten([
              styles.filterButton,
              signalTypeFilter === 'vip' && styles.filterButtonActive
            ])}
            textStyle={StyleSheet.flatten([
              styles.filterButtonText,
              signalTypeFilter === 'vip' && styles.filterButtonTextActive
            ])}
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
        
        {filteredSignals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {signalTypeFilter === 'vip' && !userData?.isVIP
                ? 'VIP signals are available for VIP members only'
                : 'No signals available'
              }
            </Text>
            {lastRefreshTime && (
              <Text style={[styles.emptyText, { fontSize: 12, marginTop: spacing.sm }]}>
                Last updated: {lastRefreshTime.toLocaleTimeString()}
              </Text>
            )}
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
