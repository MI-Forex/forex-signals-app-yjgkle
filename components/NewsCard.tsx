import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { commonStyles, colors, spacing, borderRadius } from '../styles/commonStyles';
import NewsModal from './NewsModal';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
}

interface NewsCardProps {
  article: NewsArticle;
}

export default function NewsCard({ article }: NewsCardProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const getDisplaySummary = () => {
    if (article.summary.length <= 120) {
      return article.summary;
    }
    return article.summary.substring(0, 120) + '...';
  };

  const shouldShowReadMore = () => {
    return article.summary.length > 120 || article.content.length > 0;
  };

  return (
    <>
      <TouchableOpacity style={styles.newsCard} onPress={openModal} activeOpacity={0.7}>
        {article.imageUrl && (
          <Image 
            source={{ uri: article.imageUrl }} 
            style={styles.newsImage}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.newsContent}>
          <Text style={styles.newsTitle}>{article.title}</Text>
          
          <Text style={styles.timestamp}>
            {formatTime(article.createdAt)}
          </Text>
          
          <Text style={styles.summaryText}>{getDisplaySummary()}</Text>
          
          {shouldShowReadMore() && (
            <View style={styles.readMoreContainer}>
              <Text style={styles.readMoreText}>Tap to read more</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <NewsModal
        visible={modalVisible}
        article={article}
        onClose={closeModal}
      />
    </>
  );
}

const styles = StyleSheet.create({
  newsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.background,
  },
  newsContent: {
    padding: spacing.md,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  readMoreContainer: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    marginTop: spacing.sm,
  },
  readMoreText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});