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

  return (
    <View style={[commonStyles.card, styles.newsCard]}>
      {article.imageUrl && (
        <Image 
          source={{ uri: article.imageUrl }} 
          style={styles.newsImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle}>{article.title}</Text>
        
        <Text style={[commonStyles.textMuted, { fontSize: 12, marginBottom: spacing.sm }]}>
          {formatTime(article.createdAt)}
        </Text>
        
        <Text style={commonStyles.text}>{article.summary}</Text>
        
        {expanded && (
          <View style={styles.fullContent}>
            <View style={commonStyles.divider} />
            <Text style={commonStyles.text}>{article.content}</Text>
          </View>
        )}
        
        <TouchableOpacity onPress={toggleExpanded} style={styles.readMoreButton}>
          <Text style={styles.readMoreText}>
            {expanded ? 'Read Less' : 'Read More'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  newsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: 200,
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
  fullContent: {
    marginTop: spacing.md,
  },
  readMoreButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 14,
  },
});