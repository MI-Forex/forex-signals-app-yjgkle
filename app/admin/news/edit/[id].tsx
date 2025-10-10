<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { commonStyles, colors, spacing, borderRadius, shadows } from '../../../../styles/commonStyles';
import Button from '../../../../components/Button';
import { useAuth } from '../../../../contexts/AuthContext';
import { db } from '../../../../firebase/config';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
=======

import { db } from '../../../../firebase/config';
import { commonStyles, colors, spacing, borderRadius } from '../../../../styles/commonStyles';
import { doc, getDoc, updateDoc, serverTimestamp } from '@firebase/firestore';
import { router, useLocalSearchParams } from 'expo-router';
import Button from '../../../../components/Button';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62

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
<<<<<<< HEAD
    ...shadows.sm,
=======
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
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
<<<<<<< HEAD
    ...shadows.sm,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
=======
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
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
<<<<<<< HEAD
    ...shadows.sm,
=======
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
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
<<<<<<< HEAD
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const { userData } = useAuth();

  const loadNews = useCallback(async () => {
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
=======
  const [loading, setLoading] = useState(false);
  const [loadingNews, setLoadingNews] = useState(true);
  const { userData } = useAuth();

  const loadNews = useCallback(async () => {
    if (!id || typeof id !== 'string') {
      Alert.alert('Error', 'Invalid news ID');
      router.back();
      return;
    }

    try {
      const newsDoc = await getDoc(doc(db, 'news', id));
      
      if (!newsDoc.exists()) {
        Alert.alert('Error', 'News article not found');
        router.back();
        return;
      }

      const data = newsDoc.data();
      setFormData({
        title: data.title || '',
        summary: data.summary || '',
        content: data.content || '',
        imageUrl: data.imageUrl || '',
      });
    } catch (error: any) {
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      console.error('Error loading news:', error);
      Alert.alert('Error', 'Failed to load news article');
      router.back();
    } finally {
<<<<<<< HEAD
      setLoading(false);
=======
      setLoadingNews(false);
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
    }
  }, [id]);

  useEffect(() => {
<<<<<<< HEAD
    if (id) {
      loadNews();
    }
  }, [id, loadNews]);
=======
    // Check if user has permission to edit news
    if (!userData?.isAdmin && userData?.role !== 'admin' && !userData?.isEditor && userData?.role !== 'editor') {
      Alert.alert('Access Denied', 'You do not have permission to edit news');
      router.back();
      return;
    }

    loadNews();
  }, [userData, loadNews]);
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62

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

<<<<<<< HEAD
    setSaving(true);
    try {
      const updateData = {
=======
    setLoading(true);
    try {
      const newsData = {
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        content: formData.content.trim(),
        imageUrl: formData.imageUrl.trim() || null,
        updatedAt: serverTimestamp(),
        updatedBy: userData?.uid || '',
<<<<<<< HEAD
        updatedByName: userData?.displayName || 'Admin'
      };

      console.log('Updating news with data:', updateData);
      await updateDoc(doc(db, 'news', id as string), updateData);
=======
      };

      await updateDoc(doc(db, 'news', id as string), newsData);
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      
      Alert.alert('Success', 'News article updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error updating news:', error);
<<<<<<< HEAD
      
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
=======
      Alert.alert('Error', 'Failed to update news article. Please try again.');
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
=======
  if (loadingNews) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Loading news article...</Text>
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
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
<<<<<<< HEAD
            style={[
              styles.input,
              focusedInput === 'title' && styles.inputFocused
            ]}
=======
            style={styles.input}
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
            placeholder="Enter news title"
            placeholderTextColor={colors.textSecondary}
            value={formData.title}
            onChangeText={(value) => updateFormData('title', value)}
<<<<<<< HEAD
            onFocus={() => handleInputFocus('title')}
            onBlur={handleInputBlur}
=======
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Summary *</Text>
          <TextInput
<<<<<<< HEAD
            style={[
              styles.textArea,
              focusedInput === 'summary' && styles.inputFocused
            ]}
=======
            style={styles.textArea}
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
            placeholder="Enter a brief summary of the news..."
            placeholderTextColor={colors.textSecondary}
            value={formData.summary}
            onChangeText={(value) => updateFormData('summary', value)}
<<<<<<< HEAD
            onFocus={() => handleInputFocus('summary')}
            onBlur={handleInputBlur}
=======
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Content *</Text>
          <TextInput
<<<<<<< HEAD
            style={[
              styles.textArea, 
              styles.contentArea,
              focusedInput === 'content' && styles.inputFocused
            ]}
=======
            style={[styles.textArea, styles.contentArea]}
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
            placeholder="Enter the full news content..."
            placeholderTextColor={colors.textSecondary}
            value={formData.content}
            onChangeText={(value) => updateFormData('content', value)}
<<<<<<< HEAD
            onFocus={() => handleInputFocus('content')}
            onBlur={handleInputBlur}
=======
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
            multiline
            numberOfLines={8}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Image URL (Optional)</Text>
          <TextInput
<<<<<<< HEAD
            style={[
              styles.input,
              focusedInput === 'imageUrl' && styles.inputFocused
            ]}
=======
            style={styles.input}
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
            placeholder="https://example.com/image.jpg"
            placeholderTextColor={colors.textSecondary}
            value={formData.imageUrl}
            onChangeText={(value) => updateFormData('imageUrl', value)}
<<<<<<< HEAD
            onFocus={() => handleInputFocus('imageUrl')}
            onBlur={handleInputBlur}
=======
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            text="Update Article"
            onPress={handleSubmit}
<<<<<<< HEAD
            loading={saving}
            disabled={saving}
=======
            loading={loading}
            disabled={loading}
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
            size="large"
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
