import React, { useState, useEffect } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Button from '../../../../components/Button';
import { db } from '../../../../firebase/config';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { commonStyles, colors, spacing, borderRadius } from '../../../../styles/commonStyles';
import { useAuth } from '../../../../contexts/AuthContext';
import { uploadImageToCloudinary } from '../../../../utils/cloudinaryUtils';

interface AnalysisData {
  title: string;
  content: string;
  imageUrl?: string;
}

export default function EditAnalysisScreen() {
  const { id } = useLocalSearchParams();
  const [formData, setFormData] = useState<AnalysisData>({
    title: '',
    content: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { userData } = useAuth();

  useEffect(() => {
    if (id) {
      loadAnalysis();
    }
  }, [id]);

  const loadAnalysis = async () => {
    try {
      console.log('EditAnalysis: Loading analysis with ID:', id);
      setInitialLoading(true);
      
      const docRef = doc(db, 'analysis', id as string);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          title: data.title || '',
          content: data.content || '',
          imageUrl: data.imageUrl || ''
        });
        console.log('EditAnalysis: Analysis loaded successfully');
      } else {
        Alert.alert('Error', 'Analysis not found');
        router.back();
      }
    } catch (error) {
      console.error('EditAnalysis: Error loading analysis:', error);
      Alert.alert('Error', 'Failed to load analysis');
      router.back();
    } finally {
      setInitialLoading(false);
    }
  };

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
      console.log('EditAnalysis: Requesting image picker permissions...');
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      console.log('EditAnalysis: Opening image picker...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('EditAnalysis: Image selected, uploading to Cloudinary...');
        setImageUploading(true);
        
        const imageUrl = await uploadImageToCloudinary(
          result.assets[0].uri,
          'analysis'
        );
        
        if (imageUrl) {
          setFormData(prev => ({ ...prev, imageUrl }));
          console.log('EditAnalysis: Image uploaded successfully:', imageUrl);
        }
      }
    } catch (error) {
      console.error('EditAnalysis: Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('EditAnalysis: Updating analysis...');
      
      const updateData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        imageUrl: formData.imageUrl || null,
        updatedAt: serverTimestamp(),
        updatedBy: userData?.uid || '',
        updatedByName: userData?.displayName || userData?.email || 'Admin',
      };

      const docRef = doc(db, 'analysis', id as string);
      await updateDoc(docRef, updateData);
      
      console.log('EditAnalysis: Analysis updated successfully');
      Alert.alert(
        'Success', 
        'Analysis updated successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('EditAnalysis: Error updating analysis:', error);
      Alert.alert('Error', 'Failed to update analysis. Please try again.');
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

  if (initialLoading) {
    return (
      <View style={[commonStyles.centerContent, { backgroundColor: colors.background }]}>
        <Text style={commonStyles.text}>Loading analysis...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Button
            text="← Back"
            onPress={handleBack}
            variant="outline"
            style={styles.backButton}
          />
          <Text style={styles.title}>Edit Analysis</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(value) => updateFormData('title', value)}
              placeholder="Enter analysis title"
              placeholderTextColor={colors.textMuted}
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Content *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.content}
              onChangeText={(value) => updateFormData('content', value)}
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
            <Text style={styles.label}>Analysis Image (Optional)</Text>
            <Button
              text={imageUploading ? "Uploading..." : "Pick Image"}
              onPress={pickImage}
              variant="outline"
              loading={imageUploading}
              disabled={imageUploading}
              style={styles.imageButton}
            />
            
            {formData.imageUrl ? (
              <View style={styles.imagePreview}>
                <Image 
                  source={{ uri: formData.imageUrl }} 
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <Button
                  text="Remove Image"
                  onPress={() => updateFormData('imageUrl', '')}
                  variant="danger"
                  style={styles.removeImageButton}
                />
              </View>
            ) : null}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              text={loading ? "Updating..." : "Update Analysis"}
              onPress={handleSubmit}
              loading={loading}
              disabled={loading || imageUploading}
              style={styles.submitButton}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    minHeight: 120,
    maxHeight: 200,
  },
  characterCount: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'right',
  },
  imageButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
  },
  imagePreview: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  removeImageButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
  submitButton: {
    paddingVertical: spacing.md,
  },
});