import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { commonStyles, spacing } from '../../styles/commonStyles';
import Button from '../../components/Button';

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
      <View style={{ padding: spacing.lg }}>
        <Text style={commonStyles.title}>Admin Panel</Text>
        <Text style={commonStyles.textSecondary}>
          Welcome, {userData.displayName}. Manage your forex signals platform.
        </Text>
      </View>

      <ScrollView style={commonStyles.content}>
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
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
            text="Back to App"
            onPress={handleBack}
            variant="outline"
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </ScrollView>
    </View>
  );
}