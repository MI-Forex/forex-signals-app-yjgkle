import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import Button from '../../../components/Button';
import AdminSignalCard from '../../../components/AdminSignalCard';
import { commonStyles, colors, spacing } from '../../../styles/commonStyles';

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

export default function AdminSignalsScreen() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { userData } = useAuth();

  useEffect(() => {
    if (userData?.role !== 'admin') {
      router.replace('/dashboard');
      return;
    }

    console.log('Setting up admin signals listener');
    const q = query(
      collection(db, 'signals'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const signalsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Signal[];
      
      console.log('Admin signals updated:', signalsData.length);
      setSignals(signalsData);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error('Error fetching admin signals:', error);
      setLoading(false);
      setRefreshing(false);
      Alert.alert('Error', 'Failed to load signals');
    });

    return unsubscribe;
  }, [userData]);

  const handleRefresh = () => {
    setRefreshing(true);
  };

  const handleBack = () => {
    router.back();
  };

  const handleAddSignal = () => {
    router.push('/admin/signals/add');
  };

  const handleEditSignal = (signalId: string) => {
    router.push(`/admin/signals/edit/${signalId}`);
  };

  const handleDeleteSignal = async (signalId: string) => {
    Alert.alert(
      'Delete Signal',
      'Are you sure you want to delete this signal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'signals', signalId));
              console.log('Signal deleted:', signalId);
            } catch (error) {
              console.error('Error deleting signal:', error);
              Alert.alert('Error', 'Failed to delete signal');
            }
          }
        }
      ]
    );
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
        <Text style={commonStyles.title}>Manage Signals</Text>
        <Button
          text="Back"
          onPress={handleBack}
          variant="outline"
          style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
        />
      </View>

      <View style={{ padding: spacing.md, paddingTop: 0 }}>
        <Button
          text="Add New Signal"
          onPress={handleAddSignal}
          variant="success"
        />
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
            <Text style={commonStyles.textMuted}>No signals found</Text>
          </View>
        ) : (
          signals.map((signal) => (
            <AdminSignalCard
              key={signal.id}
              signal={signal}
              onEdit={() => handleEditSignal(signal.id)}
              onDelete={() => handleDeleteSignal(signal.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}