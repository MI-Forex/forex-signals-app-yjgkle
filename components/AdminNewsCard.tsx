import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { commonStyles, colors, spacing, borderRadius } from '../styles/commonStyles';
import Button from './Button';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
}

interface AdminNewsCardProps {
  article: NewsArticle;
  onEdit: () => void;
  onDelete: () => void;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  summary: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
});

export default function AdminNewsCard({ article, onEdit, onDelete }: AdminNewsCardProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{article.title}</Text>
        <Text style={styles.timestamp}>{formatTime(article.createdAt)}</Text>
      </View>

      {article.imageUrl && (
        <Image 
          source={{ uri: article.imageUrl }} 
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <Text style={styles.summary} numberOfLines={3}>
        {article.summary}
      </Text>

      <View style={styles.actions}>
        <Button
          text="Edit"
          onPress={onEdit}
          variant="secondary"
          style={styles.actionButton}
        />
        <Button
          text="Delete"
          onPress={onDelete}
          variant="danger"
          style={styles.actionButton}
        />
      </View>
    </View>
  );
}