import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { commonStyles, colors, spacing, borderRadius, shadows } from '../../../../styles/commonStyles';
import Button from '../../../../components/Button';
import { useAuth } from '../../../../contexts/AuthContext';
import { db } from '../../../../firebase/config';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface NewsData {
  title: string;
  summary: string;
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

export default function EditNewsScreen() {
  const { id } = useLocalSearchParams();
  const [formData, setFormData] = useState<NewsData>({
    title: '',
    summary: '',
    content: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const { userData } = useAuth();

  useEffect(() => {
    if (id) {
      loadNews();
    }
  }, [id]);

  const loadNews = async () => {
    try {
      console.log('Loading news with ID:', id);
      const newsDoc = await getDoc(doc(db, 'news', id as string));
      
      if (newsDoc.exists()) {
        const data = newsDoc.data();
        setFormData({
          title: data.title || '',
          summary: data.summary || '',
          content: data.content || '',
          imageUrl: data.imageUrl || '',
        });
        console.log('News loaded successfully');
      } else {
        Alert.alert('Error', 'News article not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading news:', error);
      Alert.alert('Error', 'Failed to load news article');
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

    setSaving(true);
    try {
      const updateData = {
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        content: formData.content.trim(),
        imageUrl: formData.imageUrl.trim() || null,
        updatedAt: serverTimestamp(),
        updatedBy: userData?.uid || '',
        updatedByName: userData?.displayName || 'Admin'
      };

      console.log('Updating news with data:', updateData);
      await updateDoc(doc(db, 'news', id as string), updateData);
      
      Alert.alert('Success', 'News article updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error updating news:', error);
      
      // Generic error messages for security
      let errorMessage = 'Failed to update news article. Please try again.';
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

  const handleInputFocus = (inputName: string) => {
    setFocusedInput(inputName);
  };

  const handleInputBlur = () => {
    setFocusedInput(null);
  };

  if (loading) {
    return (
      <View style={commonStyles.loading}>
        <Text style={commonStyles.text}>Loading news article...</Text>
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
        <Text style={styles.title}>Edit News Article</Text>
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
            text="Update Article"
            onPress={handleSubmit}
            loading={saving}
            disabled={saving}
            size="large"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}