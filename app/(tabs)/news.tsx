import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import NewsCard from '../../components/NewsCard';
import Button from '../../components/Button';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';
import { router } from 'expo-router';

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
});

export default function NewsScreen() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { user, userData } = useAuth();

  useEffect(() => {
    if (!user) return;

    console.log('Setting up news listener');
    const q = query(
      collection(db, 'news'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as NewsArticle[];
      
      console.log('News updated:', newsData.length);
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
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
  };

  const handleManageNews = () => {
    router.push('/admin/news');
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
        <Text style={styles.title}>Forex News</Text>
        {userData?.role === 'admin' && (
          <Button
            text="Manage"
            onPress={handleManageNews}
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
          />
        }
      >
        {articles.length === 0 ? (
          <View style={[commonStyles.centerContent, { minHeight: 200 }]}>
            <Text style={commonStyles.textMuted}>No news articles available</Text>
          </View>
        ) : (
          articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))
        )}
      </ScrollView>
    </View>
  );
}