import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, Dimensions, ScrollView } from 'react-native';
import { commonStyles, colors, spacing, borderRadius } from '../styles/commonStyles';
import ImageViewer from 'react-native-image-zoom-viewer';

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

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
  imageContainer: {
    marginBottom: spacing.sm,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
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
    paddingVertical: spacing.xs,
  },
  readMoreText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  // Image zoom modal styles
  imageModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default function AnalysisCard({ analysis }: AnalysisCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [imageZoomVisible, setImageZoomVisible] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const openImageZoom = () => {
    if (analysis.imageUrl) {
      setImageZoomVisible(true);
    }
  };

  const closeImageZoom = () => {
    setImageZoomVisible(false);
  };

  const shouldShowReadMore = analysis.content.length > 150;
  const displayContent = expanded ? analysis.content : analysis.content.substring(0, 150) + (shouldShowReadMore ? '...' : '');

  const images = analysis.imageUrl ? [{ url: analysis.imageUrl }] : [];

  return (
    <>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{analysis.title}</Text>
          <Text style={styles.timestamp}>{formatTime(analysis.createdAt)}</Text>
        </View>

        {analysis.imageUrl && (
          <TouchableOpacity style={styles.imageContainer} onPress={openImageZoom}>
            <Image 
              source={{ uri: analysis.imageUrl }} 
              style={styles.image}
              resizeMode="cover"
            />
          </TouchableOpacity>
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

      {/* Image Zoom Modal */}
      <Modal
        visible={imageZoomVisible}
        transparent
        animationType="fade"
        onRequestClose={closeImageZoom}
      >
        <View style={styles.imageModal}>
          <TouchableOpacity style={styles.closeButton} onPress={closeImageZoom}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          
          {images.length > 0 && (
            <ImageViewer
              imageUrls={images}
              enableSwipeDown
              onSwipeDown={closeImageZoom}
              renderIndicator={() => null}
              backgroundColor="rgba(0, 0, 0, 0.9)"
              enableImageZoom
              saveToLocalByLongPress={false}
              menuContext={{
                saveToLocal: '',
                cancel: ''
              }}
            />
          )}
        </View>
      </Modal>
    </>
  );
}