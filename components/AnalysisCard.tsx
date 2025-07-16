import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { commonStyles, colors, spacing, borderRadius } from '../styles/commonStyles';

interface Analysis {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
}

interface AnalysisCardProps {
  analysis: Analysis;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textMuted,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  content: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  expandedContent: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  readMoreText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default function AnalysisCard({ analysis }: AnalysisCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const shouldShowReadMore = analysis.content.length > 150;
  const displayContent = expanded ? analysis.content : analysis.content.substring(0, 150) + (shouldShowReadMore ? '...' : '');

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{analysis.title}</Text>
        <Text style={styles.timestamp}>{formatTime(analysis.createdAt)}</Text>
      </View>

      {analysis.imageUrl && (
        <Image 
          source={{ uri: analysis.imageUrl }} 
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <Text style={expanded ? styles.expandedContent : styles.content}>
        {displayContent}
      </Text>

      {shouldShowReadMore && (
        <TouchableOpacity style={styles.readMoreButton} onPress={toggleExpanded}>
          <Text style={styles.readMoreText}>
            {expanded ? 'Read Less' : 'Read More'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}