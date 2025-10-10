
<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from 'react';
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
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62

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
<<<<<<< HEAD
    backgroundColor: colors.background,
=======
    alignItems: 'center',
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
<<<<<<< HEAD
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
=======
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
  },
  filterButtonTextActive: {
    color: colors.white,
  },
<<<<<<< HEAD
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
=======
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
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
<<<<<<< HEAD
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

  const applySignalTypeFilter = useCallback((signalsToFilter: Signal[], typeFilter: 'all' | 'normal' | 'vip') => {
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
  }, [userData?.isVIP]);
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62

  useEffect(() => {
    if (!user) return;

    console.log('Setting up signals listener');
<<<<<<< HEAD
    const q = query(
      collection(db, 'signals'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const signalsData = snapshot.docs.map(doc => ({
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Signal[];
      
<<<<<<< HEAD
=======
      // Apply signal type filter
      signalsData = applySignalTypeFilter(signalsData);
      
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      console.log('Signals updated:', signalsData.length);
      setSignals(signalsData);
      setLoading(false);
      setShowConnectivityError(false);
      
      // Complete refresh if we're refreshing
      if (refreshing) {
        console.log('Signals refresh completed via listener');
        setRefreshing(false);
        setLastRefreshTime(new Date());
<<<<<<< HEAD
        
        // Clear any existing timeout
        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
          setRefreshTimeout(null);
        }
=======
        clearRefreshTimeout();
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      }
    }, (error) => {
      console.error('Error fetching signals:', error);
      setLoading(false);
      
      // Stop refreshing on error
      if (refreshing) {
        setRefreshing(false);
<<<<<<< HEAD
        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
          setRefreshTimeout(null);
        }
=======
        clearRefreshTimeout();
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      }
      
      // Check if it's a network error
      if (error.message.includes('network') || error.message.includes('offline') || error.code === 'unavailable') {
        setShowConnectivityError(true);
      } else {
<<<<<<< HEAD
        // Generic error messages for security
=======
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
        let errorMessage = 'Failed to load signals';
        if (error.message.includes('permission')) {
          errorMessage = 'Please check your credentials';
        }
        
        Alert.alert('Error', errorMessage);
      }
    });

    return () => {
      unsubscribe();
<<<<<<< HEAD
      // Clear timeout on cleanup
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [user, filters, refreshing, refreshTimeout]);

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
  }, [signals, filters, signalTypeFilter, applySignalTypeFilter]);
=======
      clearRefreshTimeout();
    };
  }, [user, filters, signalTypeFilter, userData?.isVIP, applySignalTypeFilter, refreshing, clearRefreshTimeout]);

  useEffect(() => {
    return () => {
      clearRefreshTimeout();
    };
  }, [clearRefreshTimeout]);
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62

  const handleRefresh = async () => {
    console.log('Pull to refresh triggered for signals');
    
    // Check internet connectivity first
<<<<<<< HEAD
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
=======
    const isConnected = await checkInternetConnectivity();
    if (!isConnected) {
      console.log('No internet connectivity detected');
      setShowConnectivityError(true);
      Alert.alert('No Internet Connection', 'Please check your internet connectivity.');
      return;
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
    }

    setRefreshing(true);
    setLastRefreshTime(new Date());
    setShowConnectivityError(false);
    
    // Clear any existing timeout
<<<<<<< HEAD
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
=======
    clearRefreshTimeout();
    
    // Fallback timeout to ensure refresh completes
    refreshTimeoutRef.current = setTimeout(() => {
      console.log('Signals refresh timeout - completing refresh');
      setRefreshing(false);
      refreshTimeoutRef.current = null;
    }, 5000); // 5 seconds timeout
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
  };

  const applyFilters = (newFilters: typeof filters) => {
    console.log('Applying filters:', newFilters);
    setFilters(newFilters);
<<<<<<< HEAD
=======
    setFilterModalVisible(false);
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
  };

  const handleManageSignals = () => {
    router.push('/admin/signals');
  };

  const handleSignalTypeFilter = (type: 'all' | 'normal' | 'vip') => {
<<<<<<< HEAD
=======
    console.log('Setting signal type filter:', type);
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
    setSignalTypeFilter(type);
  };

  const dismissConnectivityError = () => {
    setShowConnectivityError(false);
  };

<<<<<<< HEAD
=======
  const handleSignalPress = (signal: Signal) => {
    logSignalView(signal.id, signal.type, signal.isVip || signal.targetUsers === 'vip');
  };

>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
  // Check if user can manage signals (admin or editor)
  const canManage = userData?.isAdmin || userData?.isEditor;

  if (loading) {
    return (
      <View style={commonStyles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Forex Signals</Text>
        </View>
<<<<<<< HEAD
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading signals...</Text>
=======
        <View style={commonStyles.loading}>
          <Text style={commonStyles.text}>Loading signals...</Text>
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
        </View>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Forex Signals</Text>
<<<<<<< HEAD
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
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
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
<<<<<<< HEAD
            style={StyleSheet.flatten({ 
=======
            style={{ 
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
              marginTop: spacing.sm, 
              paddingHorizontal: spacing.md, 
              paddingVertical: spacing.xs,
              borderColor: colors.white,
<<<<<<< HEAD
            })}
            textStyle={StyleSheet.flatten({ color: colors.white, fontSize: 12 })}
=======
            }}
            textStyle={{ color: colors.white, fontSize: 12 }}
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
          />
        </View>
      )}

<<<<<<< HEAD
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

=======
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
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
        
<<<<<<< HEAD
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
=======
        {signals.length === 0 ? (
          <View style={[commonStyles.centerContent, { minHeight: 200 }]}>
            <Text style={commonStyles.textMuted}>No signals available</Text>
            {lastRefreshTime && (
              <Text style={[commonStyles.textMuted, { fontSize: 12, marginTop: spacing.sm }]}>
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
                Last updated: {lastRefreshTime.toLocaleTimeString()}
              </Text>
            )}
          </View>
        ) : (
<<<<<<< HEAD
          filteredSignals.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
=======
          signals.map((signal) => (
            <SignalCard 
              key={signal.id} 
              signal={signal} 
              onPress={() => handleSignalPress(signal)}
            />
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
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
