<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from 'react';
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
=======

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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62

interface AnalysisData {
  title: string;
  content: string;
<<<<<<< HEAD
  imageUrl?: string;
=======
  imageUrl: string;
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
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
<<<<<<< HEAD
    padding: spacing.md,
=======
    padding: spacing.lg,
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
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
<<<<<<< HEAD
=======
    paddingBottom: spacing.xxxl,
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
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
<<<<<<< HEAD
    borderRadius: borderRadius.md,
=======
    borderRadius: borderRadius.lg,
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    backgroundColor: colors.surface,
<<<<<<< HEAD
    borderRadius: borderRadius.md,
=======
    borderRadius: borderRadius.lg,
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
<<<<<<< HEAD
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
=======
    minHeight: 200,
    textAlignVertical: 'top',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
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
<<<<<<< HEAD
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

  const loadAnalysis = useCallback(async () => {
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
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      console.error('Error loading analysis:', error);
      Alert.alert('Error', 'Failed to load analysis');
      router.back();
    } finally {
<<<<<<< HEAD
      setLoading(false);
=======
      setLoadingAnalysis(false);
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
    }
  }, [id]);

  useEffect(() => {
<<<<<<< HEAD
    if (id) {
      loadAnalysis();
    }
  }, [id, loadAnalysis]);
=======
    // Check if user has permission to edit analysis
    if (!userData?.isAdmin && userData?.role !== 'admin' && !userData?.isEditor && userData?.role !== 'editor') {
      Alert.alert('Access Denied', 'You do not have permission to edit analysis');
      router.back();
      return;
    }

    loadAnalysis();
  }, [userData, loadAnalysis]);
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return false;
    }
    if (!formData.content.trim()) {
<<<<<<< HEAD
      Alert.alert('Error', 'Please enter content');
=======
      Alert.alert('Error', 'Please enter the content');
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
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
<<<<<<< HEAD
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
=======
        setUploadingImage(false);
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to upload image');
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

<<<<<<< HEAD
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
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      
      Alert.alert('Success', 'Analysis updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error updating analysis:', error);
<<<<<<< HEAD
      
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
=======
      Alert.alert('Error', 'Failed to update analysis. Please try again.');
    } finally {
      setLoading(false);
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
    }
  };

  const handleBack = () => {
    router.back();
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

<<<<<<< HEAD
  if (loading) {
    return (
      <View style={commonStyles.loading}>
        <Text style={commonStyles.text}>Loading analysis...</Text>
=======
  if (loadingAnalysis) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Loading analysis...</Text>
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
<<<<<<< HEAD
=======
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
    >
      <View style={styles.header}>
        <Text style={styles.title}>Edit Analysis</Text>
        <Button
          text="Cancel"
          onPress={handleBack}
          variant="outline"
<<<<<<< HEAD
          style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
=======
          size="small"
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
        />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
<<<<<<< HEAD
=======
        showsVerticalScrollIndicator={false}
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
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
<<<<<<< HEAD
            placeholder="Enter detailed analysis content..."
=======
            placeholder="Enter the full analysis content..."
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
            placeholderTextColor={colors.textSecondary}
            value={formData.content}
            onChangeText={(value) => updateFormData('content', value)}
            multiline
<<<<<<< HEAD
            numberOfLines={6}
=======
            numberOfLines={10}
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
          />
        </View>

        <View style={styles.inputContainer}>
<<<<<<< HEAD
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
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
        </View>

        <View style={styles.buttonContainer}>
          <Button
            text="Update Analysis"
            onPress={handleSubmit}
<<<<<<< HEAD
            loading={saving}
            disabled={saving}
=======
            loading={loading}
            disabled={loading || uploadingImage}
            size="large"
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
