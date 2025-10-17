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
import { commonStyles, colors, spacing, borderRadius } from '../../../../styles/commonStyles';
import { useAuth } from '../../../../contexts/AuthContext';
import Button from '../../../../components/Button';
import { uploadImageToCloudinary } from '../../../../utils/cloudinaryUtils';
import { db } from '../../../../firebase/config';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';

interface AnalysisData {
  title: string;
  content: string;
  imageUrl?: string;
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
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  inputContainer: {
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
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  imageContainer: {
    marginBottom: spacing.md,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  buttonContainer: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
});

export default function EditAnalysisScreen() {
  const { id } = useLocalSearchParams();
  const [formData, setFormData] = useState<AnalysisData>({
    title: '',
    content: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { userData } = useAuth();

  // Check if user has permission to edit analysis
  React.useEffect(() => {
    if (!userData?.isAdmin && userData?.role !== 'admin' && !userData?.isEditor && userData?.role !== 'editor') {
      Alert.alert('Access Denied', 'You do not have permission to edit analysis');
      router.back();
    }
  }, [userData]);

  useEffect(() => {
    if (id) {
      loadAnalysis();
    }
  }, [id]);

  const loadAnalysis = async () => {
    try {
      console.log('Loading analysis with ID:', id);
      const analysisDoc = await getDoc(doc(db, 'analysis', id as string));
      
      if (analysisDoc.exists()) {
        const data = analysisDoc.data();
        setFormData({
          title: data.title || '',
          content: data.content || '',
          imageUrl: data.imageUrl || '',
        });
        console.log('Analysis loaded successfully');
      } else {
        Alert.alert('Error', 'Analysis not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
      Alert.alert('Error', 'Failed to load analysis');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return false;
    }
    if (!formData.content.trim()) {
      Alert.alert('Error', 'Please enter content');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingImage(true);
        const imageUrl = await uploadImageToCloudinary(result.assets[0].uri);
        setFormData(prev => ({ ...prev, imageUrl }));
        console.log('Image uploaded successfully:', imageUrl);
      }
    } catch (error: any) {
      console.error('Error picking/uploading image:', error);
      
      // Generic error messages for security
      let errorMessage = 'Failed to upload image. Please try again.';
      if (error.message.includes('network')) {
        errorMessage = 'Please check internet connectivity';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const updateData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        imageUrl: formData.imageUrl || '',
        updatedAt: serverTimestamp(),
        updatedBy: userData?.uid || '',
        updatedByName: userData?.displayName || 'Admin'
      };

      console.log('Updating analysis with data:', updateData);
      await updateDoc(doc(db, 'analysis', id as string), updateData);
      
      Alert.alert('Success', 'Analysis updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error updating analysis:', error);
      
      // Generic error messages for security
      let errorMessage = 'Failed to update analysis. Please try again.';
      if (error.message.includes('network')) {
        errorMessage = 'Please check internet connectivity';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Please check your credentials';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <View style={commonStyles.loading}>
        <Text style={commonStyles.text}>Loading analysis...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Edit Analysis</Text>
        <Button
          text="Cancel"
          onPress={handleBack}
          variant="outline"
          style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
        />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter analysis title"
            placeholderTextColor={colors.textSecondary}
            value={formData.title}
            onChangeText={(value) => updateFormData('title', value)}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Content *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter detailed analysis content..."
            placeholderTextColor={colors.textSecondary}
            value={formData.content}
            onChangeText={(value) => updateFormData('content', value)}
            multiline
            numberOfLines={6}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Analysis Image (Optional)</Text>
          <View style={styles.imageContainer}>
            {formData.imageUrl ? (
              <Image 
                source={{ uri: formData.imageUrl }} 
                style={styles.imagePreview}
                resizeMode="cover"
              />
            ) : null}
            
            <View style={styles.imageButtons}>
              <Button
                text={formData.imageUrl ? "Change Image" : "Add Image"}
                onPress={pickImage}
                loading={uploadingImage}
                disabled={uploadingImage}
                variant="outline"
                style={{ flex: 1 }}
              />
              
              {formData.imageUrl && (
                <Button
                  text="Remove"
                  onPress={() => updateFormData('imageUrl', '')}
                  variant="danger"
                  style={{ flex: 1 }}
                />
              )}
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            text="Update Analysis"
            onPress={handleSubmit}
            loading={saving}
            disabled={saving}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}