import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Image 
} from 'react-native';
import { commonStyles, colors, spacing, borderRadius } from '../styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';

interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
}

interface NewsModalProps {
  visible: boolean;
  article: NewsArticle | null;
  onClose: () => void;
}

export default function NewsModal({ visible, article, onClose }: NewsModalProps) {
  if (!article) return null;

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Forex News</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.articleContainer}>
            {article.imageUrl && (
              <Image 
                source={{ uri: article.imageUrl }} 
                style={styles.image}
                resizeMode="cover"
              />
            )}

            <View style={styles.textContent}>
              <Text style={styles.title}>{article.title}</Text>
              <Text style={styles.timestamp}>{formatTime(article.createdAt)}</Text>

              <View style={styles.summaryContainer}>
                <Text style={styles.summaryLabel}>Summary</Text>
                <Text style={styles.summaryText}>{article.summary}</Text>
              </View>

              {article.content && (
                <View style={styles.contentContainer}>
                  <Text style={styles.contentLabel}>Full Article</Text>
                  <View style={styles.contentDivider} />
                  <Text style={styles.contentText}>{article.content}</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  articleContainer: {
    backgroundColor: colors.surface,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: colors.background,
  },
  textContent: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    lineHeight: 28,
  },
  timestamp: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  summaryContainer: {
    marginBottom: spacing.lg,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  contentContainer: {
    marginTop: spacing.md,
  },
  contentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  contentDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.text,
  },
});