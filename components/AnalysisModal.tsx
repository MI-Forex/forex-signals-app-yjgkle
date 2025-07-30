import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { commonStyles, colors, spacing, borderRadius } from '../styles/commonStyles';
import { getFullSizeUrl } from '../utils/cloudinaryUtils';
import ImageViewer from 'react-native-image-zoom-viewer';

interface Analysis {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: Date;
}

interface AnalysisModalProps {
  visible: boolean;
  analysis: Analysis | null;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function AnalysisModal({ visible, analysis, onClose }: AnalysisModalProps) {
  const [imageZoomVisible, setImageZoomVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [contentExpanded, setContentExpanded] = useState(false);

  if (!analysis) return null;

  const formatTime = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const openImageZoom = () => {
    if (analysis.imageUrl && !imageError) {
      setImageZoomVisible(true);
    }
  };

  const closeImageZoom = () => {
    setImageZoomVisible(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const getDisplayContent = () => {
    if (contentExpanded || analysis.content.length <= 300) {
      return analysis.content;
    }
    return analysis.content.substring(0, 300) + '...';
  };

  const shouldShowReadMore = () => {
    return analysis.content.length > 300;
  };

  const toggleContentExpanded = () => {
    setContentExpanded(!contentExpanded);
  };

  const imageUrls = analysis.imageUrl ? [{ url: getFullSizeUrl(analysis.imageUrl) }] : [];

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{analysis.title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.timestamp}>{formatTime(analysis.createdAt)}</Text>

            {analysis.imageUrl && (
              <TouchableOpacity 
                style={styles.imageContainer} 
                onPress={openImageZoom}
                activeOpacity={0.8}
              >
                {imageLoading && (
                  <View style={styles.imageLoader}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Loading image...</Text>
                  </View>
                )}
                {!imageError && (
                  <Image
                    source={{ uri: getFullSizeUrl(analysis.imageUrl) }}
                    style={[styles.image, imageLoading && styles.imageHidden]}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    resizeMode="cover"
                  />
                )}
                {imageError && (
                  <View style={styles.imageError}>
                    <Ionicons name="image-outline" size={48} color={colors.textMuted} />
                    <Text style={styles.errorText}>Failed to load image</Text>
                  </View>
                )}
                {!imageLoading && !imageError && (
                  <View style={styles.zoomHint}>
                    <Ionicons name="expand" size={20} color={colors.white} />
                    <Text style={styles.zoomHintText}>Tap to zoom</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            <View style={styles.textContent}>
              <Text style={styles.description}>{getDisplayContent()}</Text>
              {shouldShowReadMore() && (
                <TouchableOpacity onPress={toggleContentExpanded} style={styles.readMoreButton}>
                  <Text style={styles.readMoreText}>
                    {contentExpanded ? 'Read Less' : 'Read More'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Image Zoom Modal */}
      <Modal
        visible={imageZoomVisible}
        transparent={true}
        onRequestClose={closeImageZoom}
      >
        <ImageViewer
          imageUrls={imageUrls}
          index={0}
          onSwipeDown={closeImageZoom}
          enableSwipeDown={true}
          backgroundColor="rgba(0,0,0,0.9)"
          renderHeader={() => (
            <View style={styles.imageViewerHeader}>
              <TouchableOpacity onPress={closeImageZoom} style={styles.imageCloseButton}>
                <Ionicons name="close" size={30} color={colors.white} />
              </TouchableOpacity>
            </View>
          )}
          saveToLocalByLongPress={false}
          menuContext={{
            saveToLocal: 'Save to Photos',
            cancel: 'Cancel'
          }}
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: spacing.md,
  },
  closeButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  timestamp: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  imageContainer: {
    height: 250,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surface,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  imageError: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  errorText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  zoomHint: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  zoomHintText: {
    color: colors.white,
    fontSize: 12,
    marginLeft: spacing.xs,
  },
  textContent: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  readMoreButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  imageViewerHeader: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
  },
  imageCloseButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: spacing.sm,
  },
});