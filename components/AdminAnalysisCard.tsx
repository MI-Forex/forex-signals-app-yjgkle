import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Button from './Button';
import { commonStyles, colors, spacing, borderRadius } from '../styles/commonStyles';

interface Analysis {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
}

interface AdminAnalysisCardProps {
  analysis: Analysis;
  onEdit: () => void;
  onDelete: () => void;
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
    height: 150,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  content: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});

export default function AdminAnalysisCard({ analysis, onEdit, onDelete }: AdminAnalysisCardProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const truncatedContent = analysis.content.length > 100 
    ? analysis.content.substring(0, 100) + '...' 
    : analysis.content;

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

      <Text style={styles.content}>{truncatedContent}</Text>

      <View style={styles.actions}>
        <Button
          text="Edit"
          onPress={onEdit}
          variant="outline"
          style={{ flex: 1, paddingVertical: spacing.sm }}
        />
        <Button
          text="Delete"
          onPress={onDelete}
          variant="danger"
          style={{ flex: 1, paddingVertical: spacing.sm }}
        />
      </View>
    </View>
  );
}