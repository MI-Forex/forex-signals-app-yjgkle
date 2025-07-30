import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import AnalysisCard from '../../components/AnalysisCard';
import Button from '../../components/Button';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';
import { router } from 'expo-router';

interface Analysis {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
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
});

export default function AnalysisScreen() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());

  const { user, userData } = useAuth();

  useEffect(() => {
    if (!user) return;

    console.log('Setting up analysis listener');
    const q = query(
      collection(db, 'analysis'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const analysisData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Analysis[];
      
      console.log('Analysis updated:', analysisData.length);
      setAnalyses(analysisData);
      setLoading(false);
      
      // Complete refresh if we're refreshing
      if (refreshing) {
        setTimeout(() => {
          setRefreshing(false);
          setLastRefreshTime(new Date());
          console.log('Analysis refresh completed');
        }, 1000);
      }
    }, (error) => {
      console.error('Error fetching analysis:', error);
      setLoading(false);
      setRefreshing(false);
      
      let errorMessage = 'Failed to load analysis';
      if (error.message.includes('network')) {
        errorMessage = 'Please check internet connectivity';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Please check your credentials';
      }
      
      Alert.alert('Error', errorMessage);
    });

    return unsubscribe;
  }, [user]);

  const handleRefresh = () => {
    console.log('Pull to refresh triggered for analysis');
    setRefreshing(true);
    setLastRefreshTime(new Date());
    
    // Fallback timeout in case the listener doesn't fire
    setTimeout(() => {
      if (refreshing) {
        console.log('Analysis refresh timeout - completing refresh');
        setRefreshing(false);
      }
    }, 5000);
  };

  const handleManageAnalysis = () => {
    router.push('/admin/analysis');
  };

  // Check if user can manage analysis (admin or editor)
  const canManage = userData?.isAdmin || userData?.isEditor;

  if (loading) {
    return (
      <View style={commonStyles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Market Analysis</Text>
        </View>
        <View style={commonStyles.loading}>
          <Text style={commonStyles.text}>Loading analysis...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Market Analysis</Text>
        {canManage && (
          <Button
            text="Manage"
            onPress={handleManageAnalysis}
            variant="primary"
            style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
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
            title="Pull to refresh analysis"
            titleColor={colors.textMuted}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {refreshing && (
          <View style={styles.refreshingContainer}>
            <Text style={styles.refreshingText}>Refreshing analysis...</Text>
          </View>
        )}
        
        {analyses.length === 0 ? (
          <View style={[commonStyles.centerContent, { minHeight: 200 }]}>
            <Text style={commonStyles.textMuted}>No analysis available</Text>
            {lastRefreshTime && (
              <Text style={[commonStyles.textMuted, { fontSize: 12, marginTop: spacing.sm }]}>
                Last updated: {lastRefreshTime.toLocaleTimeString()}
              </Text>
            )}
          </View>
        ) : (
          analyses.map((analysis) => (
            <AnalysisCard key={analysis.id} analysis={analysis} />
          ))
        )}
      </ScrollView>
    </View>
  );
}