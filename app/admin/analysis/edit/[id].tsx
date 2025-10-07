
import { db } from '../../../../firebase/config';
import { commonStyles, colors, spacing, borderRadius } from '../../../../styles/commonStyles';
import { doc, getDoc, updateDoc, serverTimestamp } from '@firebase/firestore';
import { router, useLocalSearchParams } from 'expo-router';
import Button from '../../../../components/Button';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageToCloudinary } from '../../../../utils/cloudinaryUtils';

interface AnalysisData {
  title: string;
  content: string;
  imageUrl: string;
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
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
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
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
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
  const [loading, setLoading] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { userData } = useAuth();

  const loadAnalysis = useCallback(async () => {
    if (!id || typeof id !== 'string') {
      Alert.alert('Error', 'Invalid analysis ID');
      router.back();
      return;
    }

    try {
      const analysisDoc = await getDoc(doc(db, 'analysis', id));
      
      if (!analysisDoc.exists()) {
        Alert.alert('Error', 'Analysis not found');
        router.back();
        return;
      }

      const data = analysisDoc.data();
      setFormData({
        title: data.title || '',
        content: data.content || '',
        imageUrl: data.imageUrl || '',
      });
    } catch (error: any) {
      console.error('Error loading analysis:', error);
      Alert.alert('Error', 'Failed to load analysis');
      router.back();
    } finally {
      setLoadingAnalysis(false);
    }
  }, [id]);

  useEffect(() => {
    // Check if user has permission to edit analysis
    if (!userData?.isAdmin && userData?.role !== 'admin' && !userData?.isEditor && userData?.role !== 'editor') {
      Alert.alert('Access Denied', 'You do not have permission to edit analysis');
      router.back();
      return;
    }

    loadAnalysis();
  }, [userData, loadAnalysis]);

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return false;
    }
    if (!formData.content.trim()) {
      Alert.alert('Error', 'Please enter the content');
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
        setUploadingImage(false);
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to upload image');
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const analysisData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        imageUrl: formData.imageUrl.trim() || null,
        updatedAt: serverTimestamp(),
        updatedBy: userData?.uid || '',
      };

      await updateDoc(doc(db, 'analysis', id as string), analysisData);
      
      Alert.alert('Success', 'Analysis updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error updating analysis:', error);
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

  if (loadingAnalysis) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Loading analysis...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Edit Analysis</Text>
        <Button
          text="Cancel"
          onPress={handleBack}
          variant="outline"
          size="small"
        />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
            placeholder="Enter the full analysis content..."
            placeholderTextColor={colors.textSecondary}
            value={formData.content}
            onChangeText={(value) => updateFormData('content', value)}
            multiline
            numberOfLines={10}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Image (Optional)</Text>
          <Button
            text={uploadingImage ? "Uploading..." : "Pick Image"}
            onPress={pickImage}
            variant="outline"
            disabled={uploadingImage}
          />
          {formData.imageUrl ? (
            <Image 
              source={{ uri: formData.imageUrl }} 
              style={styles.imagePreview}
              resizeMode="cover"
            />
          ) : null}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            text="Update Analysis"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || uploadingImage}
            size="large"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
