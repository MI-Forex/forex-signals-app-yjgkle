import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, Image, StyleSheet } from 'react-native';
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
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView 
      style={commonStyles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={commonStyles.centerContent}>
        <View style={{ width: '100%', maxWidth: 400 }}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/6bb0a24c-a5eb-4848-9fe8-1ae1ebfe9b27.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={commonStyles.title}>Profile Settings</Text>

          <View style={commonStyles.section}>
            <Text style={commonStyles.label}>Full Name</Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textMuted}
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
            />

            <Text style={commonStyles.label}>Email</Text>
            <TextInput
              style={[commonStyles.input, { backgroundColor: colors.surfaceDisabled }]}
              value={user?.email || ''}
              editable={false}
            />

            {userData?.phoneNumber && (
              <>
                <Text style={commonStyles.label}>Phone Number</Text>
                <TextInput
                  style={[commonStyles.input, { backgroundColor: colors.surfaceDisabled }]}
                  value={userData.phoneNumber}
                  editable={false}
                />
              </>
            )}

            <Text style={commonStyles.label}>Role</Text>
            <TextInput
              style={[commonStyles.input, { backgroundColor: colors.surfaceDisabled }]}
              value={userData?.role || 'user'}
              editable={false}
            />

            <Button
              text={loading ? "Updating..." : "Update Profile"}
              onPress={handleUpdateProfile}
              disabled={loading}
              style={{ marginTop: spacing.lg }}
            />

            <View style={{ marginTop: spacing.xl }}>
              <Button
                text="Back to Dashboard"
                onPress={handleBack}
                variant="outline"
              />
              
              <Button
                text="Logout"
                onPress={handleLogout}
                variant="danger"
                style={{ marginTop: spacing.md }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 80,
    height: 80,
  },
});