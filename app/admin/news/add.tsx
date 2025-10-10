import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { commonStyles, colors, spacing, borderRadius, shadows } from '../../../styles/commonStyles';
import Button from '../../../components/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../firebase/config';
import { router } from 'expo-router';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
    ...shadows.sm,
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
    ...shadows.sm,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
    textAlignVertical: 'top',
    ...shadows.sm,
  },
  contentArea: {
    minHeight: 200,
  },
  buttonContainer: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
});

export default function AddNewsScreen() {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const { userData } = useAuth();

  // Check if user has permission to add news
  React.useEffect(() => {
    if (!userData?.isAdmin && userData?.role !== 'admin' && !userData?.isEditor && userData?.role !== 'editor') {
      Alert.alert('Access Denied', 'You do not have permission to add news');
      router.back();
    }
  }, [userData]);

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return false;
    }
    if (!formData.summary.trim()) {
      Alert.alert('Error', 'Please enter a summary');
      return false;
    }
    if (!formData.content.trim()) {
      Alert.alert('Error', 'Please enter the full content');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newsData = {
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        content: formData.content.trim(),
        imageUrl: formData.imageUrl.trim() || null,
        createdAt: serverTimestamp(),
        createdBy: userData?.uid || '',
      };

      await addDoc(collection(db, 'news'), newsData);
      
      Alert.alert('Success', 'News article added successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error adding news:', error);
      Alert.alert('Error', 'Failed to add news article. Please try again.');
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
      <View style={styles.header}>
        <Text style={styles.title}>Add News Article</Text>
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
            style={[
              styles.input,
              focusedInput === 'title' && styles.inputFocused
            ]}
            placeholder="Enter news title"
            placeholderTextColor={colors.textSecondary}
            value={formData.title}
            onChangeText={(value) => updateFormData('title', value)}
            onFocus={() => handleInputFocus('title')}
            onBlur={handleInputBlur}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Summary *</Text>
          <TextInput
            style={[
              styles.textArea,
              focusedInput === 'summary' && styles.inputFocused
            ]}
            placeholder="Enter a brief summary of the news..."
            placeholderTextColor={colors.textSecondary}
            value={formData.summary}
            onChangeText={(value) => updateFormData('summary', value)}
            onFocus={() => handleInputFocus('summary')}
            onBlur={handleInputBlur}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Content *</Text>
          <TextInput
            style={[
              styles.textArea, 
              styles.contentArea,
              focusedInput === 'content' && styles.inputFocused
            ]}
            placeholder="Enter the full news content..."
            placeholderTextColor={colors.textSecondary}
            value={formData.content}
            onChangeText={(value) => updateFormData('content', value)}
            onFocus={() => handleInputFocus('content')}
            onBlur={handleInputBlur}
            multiline
            numberOfLines={8}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Image URL (Optional)</Text>
          <TextInput
            style={[
              styles.input,
              focusedInput === 'imageUrl' && styles.inputFocused
            ]}
            placeholder="https://example.com/image.jpg"
            placeholderTextColor={colors.textSecondary}
            value={formData.imageUrl}
            onChangeText={(value) => updateFormData('imageUrl', value)}
            onFocus={() => handleInputFocus('imageUrl')}
            onBlur={handleInputBlur}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            text="Publish Article"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            size="large"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}