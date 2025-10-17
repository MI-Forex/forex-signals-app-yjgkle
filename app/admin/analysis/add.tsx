import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Alert, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  StyleSheet, 
  Image 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import Button from '../../../components/Button';
import { commonStyles, colors, spacing, borderRadius, shadows } from '../../../styles/commonStyles';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../firebase/config';
import { uploadImageToCloudinary } from '../../../utils/cloudinaryUtils';

export default function AddAnalysisScreen() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const { userData } = useAuth();

  // Check if user has permission to add analysis
  React.useEffect(() => {
    if (!userData?.isAdmin && userData?.role !== 'admin' && !userData?.isEditor && userData?.role !== 'editor') {
      Alert.alert('Access Denied', 'You do not have permission to add analysis');
      router.back();
    }
  }, [userData]);

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title');
      return false;
    }
    if (!formData.content.trim()) {
      Alert.alert('Validation Error', 'Please enter content');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    try {
      console.log('AddAnalysis: Requesting image picker permissions...');
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      console.log('AddAnalysis: Opening image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('AddAnalysis: Image selected, uploading to Cloudinary...');
        setImageUploading(true);
        
        const imageUrl = await uploadImageToCloudinary(
          result.assets[0].uri,
          'analysis'
        );
        
        if (imageUrl) {
          setFormData(prev => ({ ...prev, imageUrl }));
          console.log('AddAnalysis: Image uploaded successfully:', imageUrl);
        }
      }
    } catch (error) {
      console.error('AddAnalysis: Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('AddAnalysis: Submitting analysis...');
      
      const analysisData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        imageUrl: formData.imageUrl || null,
        createdAt: serverTimestamp(),
        createdBy: userData?.uid || '',
        createdByName: userData?.displayName || userData?.email || 'Admin',
        updatedAt: serverTimestamp(),
        updatedBy: userData?.uid || '',
      };

      const docRef = await addDoc(collection(db, 'analysis'), analysisData);
      console.log('AddAnalysis: Analysis created with ID:', docRef.id);
      
      Alert.alert(
        'Success', 
        'Analysis added successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('AddAnalysis: Error adding analysis:', error);
      Alert.alert('Error', 'Failed to add analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInputFocus = (inputName: string) => {
    setFocusedInput(inputName);
  };

  const handleInputBlur = () => {
    setFocusedInput(null);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.headerGradient}
      >
        <Button
          text="← Back"
          onPress={handleBack}
          variant="outline"
          style={[styles.compactButton, { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)' }]}
          textStyle={[styles.compactButtonText, { color: colors.white }]}
        />
        <Text style={styles.title}>Add Analysis</Text>
        <View style={{ width: 80 }} />
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="document-text" size={16} color={colors.primary} /> Title *
            </Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'title' && styles.inputFocused
              ]}
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
              onFocus={() => handleInputFocus('title')}
              onBlur={handleInputBlur}
              placeholder="Enter analysis title"
              placeholderTextColor={colors.textMuted}
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="analytics" size={16} color={colors.primary} /> Content *
            </Text>
            <TextInput
              style={[
                styles.input, 
                styles.textArea,
                focusedInput === 'content' && styles.inputFocused
              ]}
              value={formData.content}
              onChangeText={(value) => updateFormData('content', value)}
              onFocus={() => handleInputFocus('content')}
              onBlur={handleInputBlur}
              placeholder="Enter analysis content"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              maxLength={2000}
            />
            <Text style={styles.characterCount}>
              {formData.content.length}/2000 characters
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="image" size={16} color={colors.primary} /> Analysis Image (Optional)
            </Text>
            <Button
              text={imageUploading ? "Uploading..." : "📷 Pick Image"}
              onPress={pickImage}
              variant="outline"
              loading={imageUploading}
              disabled={imageUploading}
              style={[styles.imageButton, styles.compactButton]}
              textStyle={styles.compactButtonText}
            />
            
            {formData.imageUrl ? (
              <View style={styles.imagePreview}>
                <Image 
                  source={{ uri: formData.imageUrl }} 
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <Button
                  text="🗑️ Remove"
                  onPress={() => updateFormData('imageUrl', '')}
                  variant="danger"
                  style={[styles.removeImageButton, styles.compactButton]}
                  textStyle={styles.compactButtonText}
                />
              </View>
            ) : null}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              text={loading ? "Adding..." : "✨ Add Analysis"}
              onPress={handleSubmit}
              loading={loading}
              disabled={loading || imageUploading}
              size="large"
              style={{ borderRadius: borderRadius.xl }}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    ...shadows.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    ...shadows.md,
  },
  textArea: {
    minHeight: 120,
    maxHeight: 200,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  compactButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 40,
    borderRadius: borderRadius.lg,
  },
  compactButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  imageButton: {
    alignSelf: 'flex-start',
  },
  imagePreview: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
  },
  removeImageButton: {
    alignSelf: 'flex-start',
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
});