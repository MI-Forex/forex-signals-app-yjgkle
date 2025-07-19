import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { commonStyles, colors, spacing, borderRadius } from '../styles/commonStyles';

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
  const [expanded, setExpanded] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const getDisplaySummary = () => {
    if (expanded || article.summary.length <= 150) {
      return article.summary;
    }
    return article.summary.substring(0, 150) + '...';
  };

  const shouldShowReadMore = () => {
    return article.summary.length > 150 || article.content.length > 0;
  };

  return (
    <View style={styles.newsCard}>
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
        
        {expanded && article.content && (
          <View style={styles.fullContent}>
            <View style={styles.contentDivider} />
            <Text style={styles.contentText}>{article.content}</Text>
          </View>
        )}
        
        {shouldShowReadMore() && (
          <TouchableOpacity onPress={toggleExpanded} style={styles.readMoreButton}>
            <Text style={styles.readMoreText}>
              {expanded ? 'Read Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
  fullContent: {
    marginTop: spacing.md,
  },
  contentDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  readMoreButton: {
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