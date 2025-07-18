import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Image } from 'react-native';
import { useAuth } from '../../../../contexts/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../../../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import Button from '../../../../components/Button';
import { commonStyles, colors, spacing, borderRadius } from '../../../../styles/commonStyles';

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const { userData } = useAuth();

  useEffect(() => {
    loadAnalysis();
  }, [id]);

  const loadAnalysis = async () => {
    try {
      if (typeof id === 'string') {
        const analysisDoc = await getDoc(doc(db, 'analysis', id));
        if (analysisDoc.exists()) {
          const data = analysisDoc.data();
          setFormData({
            title: data.title || '',
            content: data.content || '',
            imageUrl: data.imageUrl || ''
          });
        } else {
          Alert.alert('Error', 'Analysis not found');
          router.back();
        }
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
      Alert.alert('Error', 'Please enter analysis title');
      return false;
    }
    if (!formData.content.trim()) {
      Alert.alert('Error', 'Please enter analysis content');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUploading(true);
      try {
        const imageUrl = await uploadImage(result.assets[0].uri);
        setFormData(prev => ({ ...prev, imageUrl }));
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Error', 'Failed to upload image');
      } finally {
        setImageUploading(false);
      }
    }
  };

  const uploadImage = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = `analysis/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const imageRef = ref(storage, filename);
    
    await uploadBytes(imageRef, blob);
    return await getDownloadURL(imageRef);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const analysisData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        imageUrl: formData.imageUrl,
        updatedAt: new Date(),
        updatedBy: userData?.uid
      };

      if (typeof id === 'string') {
        await updateDoc(doc(db, 'analysis', id), analysisData);
        Alert.alert('Success', 'Analysis updated successfully');
        router.back();
      }
    } catch (error) {
      console.error('Error updating analysis:', error);
      Alert.alert('Error', 'Failed to update analysis. Please try again.');
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

  if (!userData?.isAdmin) {
    return (
      <View style={commonStyles.centerContent}>
        <Text style={commonStyles.text}>Access denied. Admin privileges required.</Text>
        <Button text="Go Back" onPress={handleBack} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={commonStyles.loading}>
        <Text style={commonStyles.text}>Loading analysis...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={commonStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Edit Analysis</Text>
        <Button
          text="Cancel"
          onPress={handleBack}
          variant="outline"
          style={styles.cancelButton}
        />
      </View>

      <ScrollView 
        style={commonStyles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={commonStyles.label}>Title *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.title}
            onChangeText={(value) => updateFormData('title', value)}
            placeholder="Enter analysis title"
            multiline
          />

          <Text style={commonStyles.label}>Content *</Text>
          <TextInput
            style={[commonStyles.input, styles.contentInput]}
            value={formData.content}
            onChangeText={(value) => updateFormData('content', value)}
            placeholder="Enter detailed analysis content..."
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />

          <Text style={commonStyles.label}>Image (Optional)</Text>
          {formData.imageUrl ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: formData.imageUrl }} style={styles.imagePreview} />
              <Button
                text="Change Image"
                onPress={pickImage}
                variant="outline"
                loading={imageUploading}
                style={styles.imageButton}
              />
            </View>
          ) : (
            <Button
              text="Add Image"
              onPress={pickImage}
              variant="outline"
              loading={imageUploading}
              style={styles.imageButton}
            />
          )}

          <Button
            text="Update Analysis"
            onPress={handleSubmit}
            loading={saving}
            disabled={saving}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  form: {
    padding: spacing.lg,
  },
  contentInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  imageContainer: {
    marginBottom: spacing.md,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  imageButton: {
    marginBottom: spacing.md,
  },
  submitButton: {
    marginTop: spacing.xl,
  },
});