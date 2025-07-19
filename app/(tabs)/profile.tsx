import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
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
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonContainer: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  adminBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginTop: spacing.sm,
  },
  adminText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  passwordSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passwordTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  passwordDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
});

export default function ProfileScreen() {
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const { user, userData, updateUserProfile, logout } = useAuth();

  React.useEffect(() => {
    if (userData?.displayName) {
      setDisplayName(userData.displayName);
    }
  }, [userData]);

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Please enter your display name');
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile(displayName);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.email) {
      Alert.alert('Error', 'No email found for password reset');
      return;
    }

    Alert.alert(
      'Change Password',
      `A password reset link will be sent to ${user.email}. Do you want to continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Reset Link', 
          onPress: async () => {
            setPasswordResetLoading(true);
            try {
              await sendPasswordResetEmail(auth, user.email);
              Alert.alert(
                'Password Reset Sent',
                'Please check your email for password reset instructions.'
              );
            } catch (error: any) {
              console.error('Password reset error:', error);
              let errorMessage = 'Failed to send password reset email. Please try again.';
              
              if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Please check internet connectivity';
              } else if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email address.';
              } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Please enter a valid email address.';
              }
              
              Alert.alert('Error', errorMessage);
            } finally {
              setPasswordResetLoading(false);
            }
          }
        }
      ]
    );
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

  const handleAdminPanel = () => {
    router.push('/admin');
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

  const handleManageChats = () => {
    router.push('/admin/chats');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/6bb0a24c-a5eb-4848-9fe8-1ae1ebfe9b27.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>
          {user?.email}
        </Text>
        {(userData?.role === 'admin' || userData?.isAdmin) && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminText}>ADMIN</Text>
          </View>
        )}
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your display name"
            placeholderTextColor={colors.textSecondary}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        <View style={styles.passwordSection}>
          <Text style={styles.passwordTitle}>🔐 Password Settings</Text>
          <Text style={styles.passwordDescription}>
            Change your account password by receiving a reset link via email.
          </Text>
          <Button
            text={passwordResetLoading ? "Sending..." : "Change Password"}
            onPress={handleChangePassword}
            variant="outline"
            loading={passwordResetLoading}
            disabled={passwordResetLoading}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            text="Update Profile"
            onPress={handleUpdateProfile}
            loading={loading}
            disabled={loading}
          />

          {(userData?.role === 'admin' || userData?.isAdmin) && (
            <>
              <Text style={[styles.label, { marginTop: spacing.lg, marginBottom: spacing.md }]}>
                Admin Panel
              </Text>
              
              <Button
                text="🎯 Admin Panel"
                onPress={handleAdminPanel}
                variant="success"
                style={{ marginBottom: spacing.sm }}
              />
              
              <Button
                text="📊 Manage Forex Signals"
                onPress={handleManageSignals}
                variant="primary"
                style={{ marginBottom: spacing.sm }}
              />
              
              <Button
                text="📈 Manage Analysis"
                onPress={handleManageAnalysis}
                variant="primary"
                style={{ marginBottom: spacing.sm }}
              />
              
              <Button
                text="📰 Manage News Articles"
                onPress={handleManageNews}
                variant="primary"
                style={{ marginBottom: spacing.sm }}
              />
              
              <Button
                text="👥 Manage Users"
                onPress={handleManageUsers}
                variant="primary"
                style={{ marginBottom: spacing.sm }}
              />
              
              <Button
                text="💎 VIP Settings & Data Export"
                onPress={handleManageVIP}
                variant="primary"
                style={{ marginBottom: spacing.sm }}
              />
              
              <Button
                text="💬 User Chats & Support"
                onPress={handleManageChats}
                variant="success"
                style={{ marginBottom: spacing.sm }}
              />
            </>
          )}
          
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