import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
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
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
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
    status: ''
  });

  const { user, userData } = useAuth();

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
  };

  const applyFilters = (newFilters: typeof filters) => {
    console.log('Applying filters:', newFilters);
    setFilters(newFilters);
    setFilterModalVisible(false);
  };

  const handleManageSignals = () => {
    router.push('/admin/signals');
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
      <View style={styles.header}>
        <Text style={styles.title}>Forex Signals</Text>
        <View style={styles.headerButtons}>
          <Button
            text="Filter"
            onPress={() => setFilterModalVisible(true)}
            variant="outline"
            style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
          />
          {userData?.role === 'admin' && (
            <Button
              text="Manage"
              onPress={handleManageSignals}
              variant="primary"
              style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
            />
          )}
        </View>
      </View>

      <ScrollView
        style={commonStyles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
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