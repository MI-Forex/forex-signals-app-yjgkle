import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, RefreshControl, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import Button from '../../../components/Button';
import AdminSignalCard from '../../../components/AdminSignalCard';
import { commonStyles, colors, spacing, borderRadius, shadows } from '../../../styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.sm,
  },
  headerGradient: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  titleDark: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  compactButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 40,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  backButton: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 40,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  addButton: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 48,
    borderRadius: borderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginLeft: spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});

export default function AdminSignalsScreen() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { userData } = useAuth();

  useEffect(() => {
    if (!userData?.isAdmin && userData?.role !== 'admin' && !userData?.isEditor && userData?.role !== 'editor') {
      router.replace('/(tabs)/signals');
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
      
      // Generic error messages for security
      let errorMessage = 'Failed to load signals';
      if (error.message.includes('network')) {
        errorMessage = 'Please check internet connectivity';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Please check your credentials';
      }
      
      Alert.alert('Error', errorMessage);
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
    // Check if user has permission to delete
    if (!userData?.isAdmin && userData?.role !== 'admin' && !userData?.isEditor && userData?.role !== 'editor') {
      Alert.alert('Access Denied', 'You do not have permission to delete signals');
      return;
    }

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
              
              // Generic error messages for security
              let errorMessage = 'Failed to delete signal';
              if (error.message.includes('network')) {
                errorMessage = 'Please check internet connectivity';
              } else if (error.message.includes('permission')) {
                errorMessage = 'Please check your credentials';
              }
              
              Alert.alert('Error', errorMessage);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="trending-up-outline" size={48} color={colors.primary} />
        <Text style={styles.loadingText}>Loading signals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Modern Header with Gradient */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.headerGradient}
      >
        <View style={styles.headerRow}>
          <Button
            text=""
            onPress={handleBack}
            variant="outline"
            style={styles.backButton}
            textStyle={styles.buttonText}
          >
            <Ionicons name="arrow-back" size={18} color={colors.primary} />
            <Text style={styles.buttonText}>Back</Text>
          </Button>
          
          <Text style={styles.title}>Manage Signals</Text>
          
          {/* Placeholder for symmetry */}
          <View style={{ width: 70 }} />
        </View>
      </LinearGradient>

      {/* Add Signal Button */}
      <View style={styles.buttonContainer}>
        <Button
          text=""
          onPress={handleAddSignal}
          variant="success"
          style={styles.addButton}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.white} />
          <Text style={styles.addButtonText}>Add Signal</Text>
        </Button>
      </View>

      {/* Signals List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {signals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="trending-up-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyText}>No signals found</Text>
            <Text style={[styles.emptyText, { fontSize: 14, marginTop: spacing.sm }]}>
              Create your first signal to get started
            </Text>
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