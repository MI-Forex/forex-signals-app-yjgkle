import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, RefreshControl, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../firebase/config';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { commonStyles, colors, spacing } from '../../../styles/commonStyles';
import Button from '../../../components/Button';
import AdminAnalysisCard from '../../../components/AdminAnalysisCard';

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

export default function AdminAnalysisScreen() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { userData } = useAuth();

  useEffect(() => {
    if (!userData?.isAdmin) {
      router.back();
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
      setAnalyses(analysisData);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error('Error fetching analysis:', error);
      setLoading(false);
      setRefreshing(false);
      Alert.alert('Error', 'Failed to load analysis');
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
    router.push(`/admin/analysis/edit?id=${analysisId}`);
  };

  const handleDeleteAnalysis = (analysisId: string) => {
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
              Alert.alert('Success', 'Analysis deleted successfully');
            } catch (error) {
              console.error('Error deleting analysis:', error);
              Alert.alert('Error', 'Failed to delete analysis');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={commonStyles.loading}>
        <Text style={commonStyles.text}>Loading analysis...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Analysis</Text>
        <View style={styles.headerButtons}>
          <Button
            text="Back"
            onPress={handleBack}
            variant="outline"
            style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
          />
          <Button
            text="Add Analysis"
            onPress={handleAddAnalysis}
            variant="primary"
            style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
          />
        </View>
      </View>

      <ScrollView
        style={commonStyles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {analyses.length === 0 ? (
          <View style={[commonStyles.centerContent, { minHeight: 200 }]}>
            <Text style={commonStyles.textMuted}>No analysis found</Text>
          </View>
        ) : (
          analyses.map((analysis) => (
            <AdminAnalysisCard
              key={analysis.id}
              analysis={analysis}
              onEdit={() => handleEditAnalysis(analysis.id)}
              onDelete={() => handleDeleteAnalysis(analysis.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}