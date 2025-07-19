import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, RefreshControl, StyleSheet } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';
import Button from '../../../components/Button';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { commonStyles, colors, spacing } from '../../../styles/commonStyles';
import AdminNewsCard from '../../../components/AdminNewsCard';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
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
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
});

export default function AdminNewsScreen() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { userData } = useAuth();

  useEffect(() => {
    if (!userData?.isAdmin && userData?.role !== 'admin') {
      router.replace('/(tabs)/news');
      return;
    }

    console.log('Setting up news listener for admin');
    const q = query(
      collection(db, 'news'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as NewsArticle[];
      
      console.log('Admin news updated:', newsData.length);
      setArticles(newsData);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error('Error fetching news:', error);
      setLoading(false);
      setRefreshing(false);
      Alert.alert('Error', 'Failed to load news');
    });

    return unsubscribe;
  }, [userData]);

  const handleRefresh = () => {
    setRefreshing(true);
  };

  const handleBack = () => {
    router.back();
  };

  const handleAddNews = () => {
    router.push('/admin/news/add');
  };

  const handleEditNews = (newsId: string) => {
    router.push(`/admin/news/edit/${newsId}`);
  };

  const handleDeleteNews = async (newsId: string) => {
    Alert.alert(
      'Delete News',
      'Are you sure you want to delete this news article?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'news', newsId));
              Alert.alert('Success', 'News article deleted successfully');
            } catch (error) {
              console.error('Error deleting news:', error);
              Alert.alert('Error', 'Failed to delete news article');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={commonStyles.loading}>
        <Text style={commonStyles.text}>Loading news...</Text>
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage News</Text>
        <View style={styles.headerButtons}>
          <Button
            text="Add News"
            onPress={handleAddNews}
            variant="primary"
            style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
          />
          <Button
            text="Back"
            onPress={handleBack}
            variant="outline"
            style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
          />
        </View>
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
        {articles.length === 0 ? (
          <View style={[commonStyles.centerContent, { minHeight: 200 }]}>
            <Text style={commonStyles.textMuted}>No news articles found</Text>
            <Button
              text="Add First Article"
              onPress={handleAddNews}
              style={{ marginTop: spacing.md }}
            />
          </View>
        ) : (
          articles.map((article) => (
            <AdminNewsCard
              key={article.id}
              article={article}
              onEdit={() => handleEditNews(article.id)}
              onDelete={() => handleDeleteNews(article.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}