import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Image } from 'react-native';
import { commonStyles, colors, spacing, borderRadius } from '../../../styles/commonStyles';
import Button from '../../../components/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { db, storage } from '../../../firebase/config';
import { router } from 'expo-router';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';

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
    minHeight: 150,
    textAlignVertical: 'top',
  },
  imageContainer: {
    marginBottom: spacing.lg,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  buttonContainer: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
});

export default function AddAnalysisScreen() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { userData } = useAuth();

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
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
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

    setLoading(true);
    try {
      let imageUrl = '';
      
      if (selectedImage) {
        console.log('Uploading image...');
        imageUrl = await uploadImage(selectedImage);
      }

      const analysisData = {
        title: formData.title,
        content: formData.content,
        imageUrl: imageUrl || null,
        createdAt: serverTimestamp(),
        createdBy: userData?.uid || '',
      };

      await addDoc(collection(db, 'analysis'), analysisData);
      
      Alert.alert('Success', 'Analysis added successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error adding analysis:', error);
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

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Add Analysis</Text>
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
            autoCapitalize="sentences"
            autoCorrect={true}
          />
        </View>

        <View style={styles.imageContainer}>
          <Text style={styles.label}>Analysis Image (Optional)</Text>
          <Button
            text="Select Image"
            onPress={pickImage}
            variant="outline"
          />
          {selectedImage && (
            <Image 
              source={{ uri: selectedImage }} 
              style={styles.imagePreview}
              resizeMode="cover"
            />
          )}
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
            numberOfLines={8}
            autoCapitalize="sentences"
            autoCorrect={true}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            text="Add Analysis"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}