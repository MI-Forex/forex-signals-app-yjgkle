import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  ActivityIndicator
} from 'react-native';
import { commonStyles, colors, spacing, borderRadius } from '../styles/commonStyles';
import { getThumbnailUrl, getFullSizeUrl } from '../utils/cloudinaryUtils';
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
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);

  React.useEffect(() => {
    if (analysis.imageUrl && imageLoading) {
      // Show loading message after 2 seconds
      const timer = setTimeout(() => {
        setShowLoadingMessage(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [analysis.imageUrl, imageLoading]);

  const formatTime = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
    setShowLoadingMessage(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    setShowLoadingMessage(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.container} onPress={openModal} activeOpacity={0.7}>
        <View style={styles.header}>
          <Text style={styles.title}>{analysis.title}</Text>
          <Text style={styles.timestamp}>{formatTime(analysis.createdAt)}</Text>
        </View>

        {analysis.imageUrl && (
          <View style={styles.imageContainer}>
            {imageLoading && (
              <View style={styles.imageLoader}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>
                  {showLoadingMessage ? 'Loading Images...' : 'Loading image...'}
                </Text>
              </View>
            )}
            {!imageError && (
              <Image
                source={{ uri: getThumbnailUrl(analysis.imageUrl) }}
                style={[styles.image, imageLoading && styles.imageHidden]}
                onLoad={handleImageLoad}
                onError={handleImageError}
                resizeMode="cover"
              />
            )}
            {imageError && (
              <View style={styles.imageError}>
                <Text style={styles.errorText}>Failed to load image</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.description}>{getDisplayContent()}</Text>
          {shouldShowReadMore() && (
            <Text style={styles.readMore}>Read More</Text>
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
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    height: 200,
    backgroundColor: colors.background,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageHidden: {
    opacity: 0,
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 14,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  imageError: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  content: {
    padding: spacing.md,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  readMore: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
});