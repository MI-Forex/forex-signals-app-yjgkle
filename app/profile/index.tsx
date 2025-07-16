import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';

export default function ProfileScreen() {
  const { user, userData, updateUserProfile, logout } = useAuth();
  const [displayName, setDisplayName] = useState(userData?.displayName || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile(displayName.trim());
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/auth/login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        }
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={commonStyles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={commonStyles.content}>
        <View style={[commonStyles.spaceBetween, { marginBottom: spacing.xl }]}>
          <Text style={commonStyles.title}>Profile</Text>
          <Button
            text="Back"
            onPress={handleBack}
            variant="outline"
            style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
          />
        </View>

        <View style={commonStyles.card}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: spacing.md }]}>
            Account Information
          </Text>

          <View style={{ marginBottom: spacing.md }}>
            <Text style={commonStyles.textMuted}>Email</Text>
            <Text style={[commonStyles.text, { fontSize: 16, marginTop: spacing.xs }]}>
              {user?.email}
            </Text>
          </View>

          <View style={{ marginBottom: spacing.md }}>
            <Text style={commonStyles.textMuted}>Role</Text>
            <Text style={[commonStyles.text, { fontSize: 16, marginTop: spacing.xs }]}>
              {userData?.role === 'admin' ? 'Administrator' : 'User'}
            </Text>
          </View>

          <View style={{ marginBottom: spacing.md }}>
            <Text style={commonStyles.textMuted}>Member Since</Text>
            <Text style={[commonStyles.text, { fontSize: 16, marginTop: spacing.xs }]}>
              {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>

        <View style={commonStyles.card}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: spacing.md }]}>
            Update Profile
          </Text>

          <TextInput
            style={commonStyles.input}
            placeholder="Full Name"
            placeholderTextColor={colors.textMuted}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />

          <Button
            text={loading ? "Updating..." : "Update Profile"}
            onPress={handleUpdateProfile}
            disabled={loading}
            style={{ marginTop: spacing.sm }}
          />
        </View>

        <View style={commonStyles.card}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: spacing.md }]}>
            Account Actions
          </Text>

          <Button
            text="Logout"
            onPress={handleLogout}
            variant="danger"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}