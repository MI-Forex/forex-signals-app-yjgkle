import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, RefreshControl, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../firebase/config';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import Button from '../../../components/Button';
import AdminAnalysisCard from '../../../components/AdminAnalysisCard';
import { commonStyles, colors, spacing, borderRadius, shadows } from '../../../styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Analysis {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  createdBy: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
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

export default function AdminAnalysisScreen() {
  const [analysis, setAnalysis] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { userData } = useAuth();

  useEffect(() => {
    if (!userData?.isAdmin && userData?.role !== 'admin' && !userData?.isEditor && userData?.role !== 'editor') {
      router.replace('/(tabs)/analysis');
      return;
    }

    console.log('Setting up admin analysis listener');
    const q = query(
      collection(db, 'analysis'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const analysisData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Analysis[];
      
      console.log('Admin analysis updated:', analysisData.length);
      setAnalysis(analysisData);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error('Error fetching admin analysis:', error);
      setLoading(false);
      setRefreshing(false);
      
      // Generic error messages for security
      let errorMessage = 'Failed to load analysis';
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

  const handleAddAnalysis = () => {
    router.push('/admin/analysis/add');
  };

  const handleEditAnalysis = (analysisId: string) => {
    router.push(`/admin/analysis/edit/${analysisId}`);
  };

  const handleDeleteAnalysis = async (analysisId: string) => {
    // Check if user has permission to delete
    if (!userData?.isAdmin && userData?.role !== 'admin' && !userData?.isEditor && userData?.role !== 'editor') {
      Alert.alert('Access Denied', 'You do not have permission to delete analysis');
      return;
    }

    Alert.alert(
      'Delete Analysis',
      'Are you sure you want to delete this analysis?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'analysis', analysisId));
              console.log('Analysis deleted:', analysisId);
            } catch (error) {
              console.error('Error deleting analysis:', error);
              
              // Generic error messages for security
              let errorMessage = 'Failed to delete analysis';
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
        <Ionicons name="analytics-outline" size={48} color={colors.primary} />
        <Text style={styles.loadingText}>Loading analysis...</Text>
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
          
          <Text style={styles.title}>Manage Analysis</Text>
          
          {/* Placeholder for symmetry */}
          <View style={{ width: 70 }} />
        </View>
      </LinearGradient>

      {/* Add Analysis Button */}
      <View style={styles.buttonContainer}>
        <Button
          text=""
          onPress={handleAddAnalysis}
          variant="success"
          style={styles.addButton}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.white} />
          <Text style={styles.addButtonText}>Add Analysis</Text>
        </Button>
      </View>

      {/* Analysis List */}
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
        {analysis.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="analytics-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyText}>No analysis found</Text>
            <Text style={[styles.emptyText, { fontSize: 14, marginTop: spacing.sm }]}>
              Create your first analysis to get started
            </Text>
          </View>
        ) : (
          analysis.map((item) => (
            <AdminAnalysisCard
              key={item.id}
              analysis={item}
              onEdit={() => handleEditAnalysis(item.id)}
              onDelete={() => handleDeleteAnalysis(item.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}