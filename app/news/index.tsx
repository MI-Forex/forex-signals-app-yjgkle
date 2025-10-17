import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import NewsCard from '../../components/NewsCard';
import Button from '../../components/Button';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
  createdBy: string;
}

export default function NewsScreen() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
      return;
    }

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

  const handleBack = () => {
    router.back();
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
      <View style={[commonStyles.spaceBetween, { padding: spacing.md, paddingBottom: 0 }]}>
        <Text style={commonStyles.title}>Forex News</Text>
        <Button
          text="Back"
          onPress={handleBack}
          variant="outline"
          style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
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