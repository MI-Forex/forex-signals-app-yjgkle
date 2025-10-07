
import { db } from '../../../../firebase/config';
import { commonStyles, colors, spacing, borderRadius } from '../../../../styles/commonStyles';
import { doc, getDoc, updateDoc, serverTimestamp } from '@firebase/firestore';
import { router, useLocalSearchParams } from 'expo-router';
import Button from '../../../../components/Button';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

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
    minHeight: 120,
    textAlignVertical: 'top',
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
      console.error('Error loading news:', error);
      Alert.alert('Error', 'Failed to load news article');
      router.back();
    } finally {
      setLoadingNews(false);
    }
  }, [id]);

  useEffect(() => {
    // Check if user has permission to edit news
    if (!userData?.isAdmin && userData?.role !== 'admin' && !userData?.isEditor && userData?.role !== 'editor') {
      Alert.alert('Access Denied', 'You do not have permission to edit news');
      router.back();
      return;
    }

    loadNews();
  }, [userData, loadNews]);

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
        updatedAt: serverTimestamp(),
        updatedBy: userData?.uid || '',
      };

      await updateDoc(doc(db, 'news', id as string), newsData);
      
      Alert.alert('Success', 'News article updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error updating news:', error);
      Alert.alert('Error', 'Failed to update news article. Please try again.');
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

  if (loadingNews) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Loading news article...</Text>
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
            style={styles.input}
            placeholder="Enter news title"
            placeholderTextColor={colors.textSecondary}
            value={formData.title}
            onChangeText={(value) => updateFormData('title', value)}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Summary *</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter a brief summary of the news..."
            placeholderTextColor={colors.textSecondary}
            value={formData.summary}
            onChangeText={(value) => updateFormData('summary', value)}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Content *</Text>
          <TextInput
            style={[styles.textArea, styles.contentArea]}
            placeholder="Enter the full news content..."
            placeholderTextColor={colors.textSecondary}
            value={formData.content}
            onChangeText={(value) => updateFormData('content', value)}
            multiline
            numberOfLines={8}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Image URL (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com/image.jpg"
            placeholderTextColor={colors.textSecondary}
            value={formData.imageUrl}
            onChangeText={(value) => updateFormData('imageUrl', value)}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            text="Update Article"
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
