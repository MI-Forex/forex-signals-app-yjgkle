import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';
import Button from '../../components/Button';

const styles = StyleSheet.create({
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing.lg,
  },
  buttonContainer: {
    gap: spacing.md,
  },
  backButton: {
    marginTop: spacing.xl,
  },
});

export default function AdminScreen() {
  const { userData } = useAuth();

  const handleBack = () => {
    router.back();
  };

  const handleManageSignals = () => {
    router.push('/admin/signals');
  };

  const handleManageNews = () => {
    router.push('/admin/news');
  };

  const handleManageAnalysis = () => {
    router.push('/admin/analysis');
  };

  const handleManageUsers = () => {
    router.push('/admin/users');
  };

  const handleManageVIP = () => {
    router.push('/admin/vip');
  };

  if (!userData?.isAdmin) {
    return (
      <View style={commonStyles.centerContent}>
        <Text style={commonStyles.text}>Access denied. Admin privileges required.</Text>
        <Button text="Go Back" onPress={handleBack} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
        <Text style={styles.subtitle}>
          Welcome, {userData.displayName}. Manage your forex signals platform.
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.buttonContainer}>
          <Button
            text="Manage Signals"
            onPress={handleManageSignals}
            variant="primary"
          />
          
          <Button
            text="Manage Analysis"
            onPress={handleManageAnalysis}
            variant="primary"
          />
          
          <Button
            text="Manage News"
            onPress={handleManageNews}
            variant="primary"
          />
          
          <Button
            text="Manage Users"
            onPress={handleManageUsers}
            variant="primary"
          />
          
          <Button
            text="Manage VIP Settings"
            onPress={handleManageVIP}
            variant="success"
          />
          
          <Button
            text="Back to App"
            onPress={handleBack}
            variant="outline"
            style={styles.backButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}