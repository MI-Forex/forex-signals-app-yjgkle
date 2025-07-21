import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image
} from 'react-native';
import { commonStyles, colors, spacing, borderRadius } from '../styles/commonStyles';
import { getOptimizedImageUrl } from '../utils/cloudinaryUtils';
import AnalysisModal from './AnalysisModal';

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

export default function AnalysisCard({ analysis }: AnalysisCardProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
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

  const getDisplayContent = () => {
    if (analysis.content.length <= 150) {
      return analysis.content;
    }
    return analysis.content.substring(0, 150) + '...';
  };

  const shouldShowReadMore = () => {
    return analysis.content.length > 150;
  };

  // Get optimized image URLs for different use cases
  const thumbnailUrl = analysis.imageUrl 
    ? getOptimizedImageUrl(analysis.imageUrl, 400, 225, 70)
    : null;

  return (
    <>
      <TouchableOpacity style={styles.card} onPress={openModal} activeOpacity={0.7}>
        <View style={styles.header}>
          <Text style={styles.title}>{analysis.title}</Text>
          <Text style={styles.timestamp}>{formatTime(analysis.createdAt)}</Text>
        </View>

        {thumbnailUrl && (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: thumbnailUrl }} 
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.contentText}>{getDisplayContent()}</Text>
          
          {shouldShowReadMore() && (
            <View style={styles.readMoreContainer}>
              <Text style={styles.readMoreText}>Tap to read more</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <AnalysisModal
        visible={modalVisible}
        analysis={analysis}
        onClose={closeModal}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
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
  },
  header: {
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textMuted,
  },
  imageContainer: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: colors.background,
  },
  content: {
    gap: spacing.sm,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  readMoreContainer: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  readMoreText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});