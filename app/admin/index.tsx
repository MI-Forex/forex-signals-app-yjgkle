import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import { commonStyles, spacing } from '../../styles/commonStyles';

export default function AdminScreen() {
  const { userData } = useAuth();

  if (userData?.role !== 'admin') {
    return (
      <View style={commonStyles.centerContent}>
        <Text style={commonStyles.text}>Access Denied</Text>
        <Text style={commonStyles.textMuted}>You don&apos;t have admin privileges</Text>
        <Button
          text="Back to Dashboard"
          onPress={() => router.replace('/dashboard')}
          style={{ marginTop: spacing.md }}
        />
      </View>
    );
  }

  const handleBack = () => {
    router.back();
  };

  const handleManageSignals = () => {
    router.push('/admin/signals');
  };

  const handleManageNews = () => {
    router.push('/admin/news');
  };

  const handleManageUsers = () => {
    router.push('/admin/users');
  };

  return (
    <View style={commonStyles.container}>
      <View style={[commonStyles.spaceBetween, { padding: spacing.md, paddingBottom: 0 }]}>
        <Text style={commonStyles.title}>Admin Panel</Text>
        <Button
          text="Back"
          onPress={handleBack}
          variant="outline"
          style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
        />
      </View>

      <ScrollView style={commonStyles.content}>
        <View style={commonStyles.card}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: spacing.md }]}>
            Content Management
          </Text>

          <Button
            text="Manage Signals"
            onPress={handleManageSignals}
            style={{ marginBottom: spacing.sm }}
          />

          <Button
            text="Manage News"
            onPress={handleManageNews}
            variant="secondary"
            style={{ marginBottom: spacing.sm }}
          />
        </View>

        <View style={commonStyles.card}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: spacing.md }]}>
            User Management
          </Text>

          <Button
            text="Manage Users"
            onPress={handleManageUsers}
            variant="success"
          />
        </View>
      </ScrollView>
    </View>
  );
}