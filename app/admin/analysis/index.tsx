import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, RefreshControl, StyleSheet } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';
import { db } from '../../../firebase/config';
import Button from '../../../components/Button';
import AdminAnalysisCard from '../../../components/AdminAnalysisCard';
import { commonStyles, colors, spacing } from '../../../styles/commonStyles';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  backButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  addButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginLeft: spacing.sm,
  },
});

export default function AdminAnalysisScreen() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { userData } = useAuth();

  useEffect(() => {
    if (userData?.isAdmin || userData?.isEditor) {
      const analysisQuery = query(
        collection(db, 'analysis'),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(analysisQuery, (snapshot) => {
        const analysisData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Analysis[];
        setAnalyses(analysisData);
        setLoading(false);
        setRefreshing(false);
      });

      return () => unsubscribe();
    }
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
      'Are you sure you want to delete this analysis? This action cannot be undone.',
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

  if (!userData?.isAdmin && !userData?.isEditor) {
    return (
      <View style={commonStyles.centerContent}>
        <Text style={commonStyles.text}>Access denied. Admin or Editor privileges required.</Text>
        <Button text="Go Back" onPress={handleBack} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={commonStyles.loading}>
        <Text style={commonStyles.text}>Loading analysis...</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Analysis</Text>
        <View style={{ flexDirection: 'row' }}>
          <Button
            text="Back"
            onPress={handleBack}
            variant="outline"
            style={styles.backButton}
          />
          <Button
            text="Add Analysis"
            onPress={handleAddAnalysis}
            variant="primary"
            style={styles.addButton}
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
            <Button
              text="Add First Analysis"
              onPress={handleAddAnalysis}
              variant="primary"
              style={{ marginTop: spacing.md }}
            />
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