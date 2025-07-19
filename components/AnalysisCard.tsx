import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Modal, 
  Dimensions, 
  ScrollView 
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { commonStyles, colors, spacing, borderRadius } from '../styles/commonStyles';
import { getOptimizedImageUrl } from '../utils/cloudinaryUtils';

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
  const [expanded, setExpanded] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const openImageZoom = () => {
    if (analysis.imageUrl) {
      setImageModalVisible(true);
    }
  };

  const closeImageZoom = () => {
    setImageModalVisible(false);
  };

  const getDisplayContent = () => {
    if (expanded || analysis.content.length <= 150) {
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
  
  const fullSizeUrl = analysis.imageUrl 
    ? getOptimizedImageUrl(analysis.imageUrl, 1200, 675, 85)
    : null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{analysis.title}</Text>
        <Text style={styles.timestamp}>{formatTime(analysis.createdAt)}</Text>
      </View>

      {thumbnailUrl && (
        <TouchableOpacity onPress={openImageZoom} style={styles.imageContainer}>
          <Image 
            source={{ uri: thumbnailUrl }} 
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <Text style={styles.imageOverlayText}>Tap to zoom</Text>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.content}>
        <Text style={styles.contentText}>{getDisplayContent()}</Text>
        
        {shouldShowReadMore() && (
          <TouchableOpacity onPress={toggleExpanded} style={styles.readMoreButton}>
            <Text style={styles.readMoreText}>
              {expanded ? 'Read Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Image Zoom Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageZoom}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={closeImageZoom}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          
          {fullSizeUrl && (
            <ImageViewer
              imageUrls={[{ url: fullSizeUrl }]}
              index={0}
              onSwipeDown={closeImageZoom}
              enableSwipeDown={true}
              backgroundColor="rgba(0,0,0,0.9)"
              renderIndicator={() => null}
              saveToLocalByLongPress={false}
              enablePreload={true}
            />
          )}
        </View>
      </Modal>
    </View>
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
    position: 'relative',
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  imageOverlayText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    gap: spacing.sm,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  readMoreText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
});