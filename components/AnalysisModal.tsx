import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  Dimensions 
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { commonStyles, colors, spacing, borderRadius } from '../styles/commonStyles';
import { getOptimizedImageUrl } from '../utils/cloudinaryUtils';
import { Ionicons } from '@expo/vector-icons';

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

export default function AnalysisModal({ visible, analysis, onClose }: AnalysisModalProps) {
  const [imageModalVisible, setImageModalVisible] = useState(false);

  if (!analysis) return null;

  const formatTime = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const openImageZoom = () => {
    if (analysis.imageUrl) {
      setImageModalVisible(true);
    }
  };

  const closeImageZoom = () => {
    setImageModalVisible(false);
  };

  // Get optimized image URLs for different use cases
  const thumbnailUrl = analysis.imageUrl 
    ? getOptimizedImageUrl(analysis.imageUrl, 600, 400, 80)
    : null;
  
  const fullSizeUrl = analysis.imageUrl 
    ? getOptimizedImageUrl(analysis.imageUrl, 1200, 675, 85)
    : null;

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Market Analysis</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.analysisContainer}>
              <Text style={styles.title}>{analysis.title}</Text>
              <Text style={styles.timestamp}>{formatTime(analysis.createdAt)}</Text>

              {thumbnailUrl && (
                <TouchableOpacity onPress={openImageZoom} style={styles.imageContainer}>
                  <Image 
                    source={{ uri: thumbnailUrl }} 
                    style={styles.image}
                    resizeMode="cover"
                  />
                  <View style={styles.imageOverlay}>
                    <Ionicons name="expand" size={16} color={colors.white} />
                    <Text style={styles.imageOverlayText}>Tap to zoom</Text>
                  </View>
                </TouchableOpacity>
              )}

              <View style={styles.contentContainer}>
                <Text style={styles.contentText}>{analysis.content}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Image Zoom Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageZoom}
      >
        <View style={styles.imageModalContainer}>
          <TouchableOpacity 
            style={styles.imageCloseButton}
            onPress={closeImageZoom}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={24} color={colors.white} />
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
    </>
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
    padding: spacing.md,
  },
  analysisContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
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
  imageContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: colors.background,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  imageOverlayText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  contentContainer: {
    gap: spacing.md,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.text,
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  imageCloseButton: {
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
});