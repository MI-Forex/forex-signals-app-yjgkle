
import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, Image, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../firebase/config';
import { Ionicons } from '@expo/vector-icons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';
import { checkInternetConnectivity } from '../../utils/networkUtils';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
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
    color: colors.textMuted,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  userInfo: {
    marginBottom: spacing.md,
  },
  userInfoLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  userInfoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.sm,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: spacing.md,
  },
  adminSection: {
    backgroundColor: colors.primary,
    borderRadius: spacing.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  adminTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  adminButtonsContainer: {
    gap: spacing.sm,
  },
  vipBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  vipBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  editorBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  editorBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  connectivityError: {
    backgroundColor: colors.error,
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: spacing.sm,
    alignItems: 'center',
  },
  connectivityErrorText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default function ProfileScreen() {
  const { user, userData, logout, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState(userData?.displayName || '');
  const [refreshing, setRefreshing] = useState(false);
  const [showConnectivityError, setShowConnectivityError] = useState(false);

  const handleRefresh = async () => {
    console.log('Pull to refresh triggered for profile');
    
    // Check internet connectivity first
    const isConnected = await checkInternetConnectivity();
    if (!isConnected) {
      console.log('No internet connectivity detected');
      setShowConnectivityError(true);
      Alert.alert('No Internet Connection', 'Please check your internet connectivity.');
      return;
    }

    setRefreshing(true);
    setShowConnectivityError(false);
    
    // Simulate refresh (in a real app, you might reload user data)
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Please enter a display name');
      return;
    }

    // Check connectivity before updating
    const isConnected = await checkInternetConnectivity();
    if (!isConnected) {
      Alert.alert('No Internet Connection', 'Please check your internet connectivity.');
      return;
    }

    try {
      await updateUserProfile(displayName.trim());
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleChangePassword = async () => {
    if (!user?.email) {
      Alert.alert('Error', 'No email address found');
      return;
    }

    // Check connectivity before sending reset email
    const isConnected = await checkInternetConnectivity();
    if (!isConnected) {
      Alert.alert('No Internet Connection', 'Please check your internet connectivity.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, user.email);
      Alert.alert(
        'Password Reset Email Sent',
        'Please check your email for instructions to reset your password.'
      );
    } catch (error) {
      console.error('Error sending password reset email:', error);
      Alert.alert('Error', 'Failed to send password reset email. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const dismissConnectivityError = () => {
    setShowConnectivityError(false);
  };

  // Admin/Editor management functions
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/00a46297-3f16-4e57-967e-c79ec0897b80.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account settings</Text>
      </View>

      {/* Connectivity Error Banner */}
      {showConnectivityError && (
        <View style={styles.connectivityError}>
          <Text style={styles.connectivityErrorText}>
            Please check your internet connectivity
          </Text>
          <Button
            text="Dismiss"
            onPress={dismissConnectivityError}
            variant="outline"
            style={StyleSheet.flatten({ 
              marginTop: spacing.sm, 
              paddingHorizontal: spacing.md, 
              paddingVertical: spacing.xs,
              borderColor: colors.white,
            })}
            textStyle={StyleSheet.flatten({ color: colors.white, fontSize: 12 })}
          />
        </View>
      )}

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            title="Pull to refresh profile"
            titleColor={colors.textMuted}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* User Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.userInfo}>
            <Text style={styles.userInfoLabel}>Email</Text>
            <Text style={styles.userInfoValue}>{user?.email}</Text>
            {userData?.isVIP && (
              <View style={styles.vipBadge}>
                <Text style={styles.vipBadgeText}>VIP MEMBER</Text>
              </View>
            )}
            {userData?.isEditor && !userData?.isAdmin && (
              <View style={styles.editorBadge}>
                <Text style={styles.editorBadgeText}>EDITOR</Text>
              </View>
            )}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Display Name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholderTextColor={colors.textMuted}
          />

          <Button
            text="Update Profile"
            onPress={handleUpdateProfile}
            variant="primary"
            style={StyleSheet.flatten({ marginBottom: spacing.md })}
          />

          <Button
            text="Change Password"
            onPress={handleChangePassword}
            variant="outline"
          />
        </View>

        {/* Admin/Editor Panel */}
        {(userData?.isAdmin || userData?.isEditor) && (
          <View style={styles.adminSection}>
            <Text style={styles.adminTitle}>
              {userData?.isAdmin ? 'Admin Panel' : 'Editor Panel'}
            </Text>
            <View style={styles.adminButtonsContainer}>
              <Button
                text="Manage Signals"
                onPress={handleManageSignals}
                variant="secondary"
              />
              <Button
                text="Manage News"
                onPress={handleManageNews}
                variant="secondary"
              />
              <Button
                text="Manage Analysis"
                onPress={handleManageAnalysis}
                variant="secondary"
              />
              {userData?.isAdmin && (
                <>
                  <Button
                    text="Manage Users"
                    onPress={handleManageUsers}
                    variant="secondary"
                  />
                  <Button
                    text="VIP Settings & Management"
                    onPress={handleManageVIP}
                    variant="secondary"
                  />
                </>
              )}
            </View>
          </View>
        )}

        {/* Logout */}
        <View style={styles.section}>
          <Button
            text="Logout"
            onPress={handleLogout}
            variant="danger"
          />
        </View>
      </ScrollView>
    </View>
  );
}
