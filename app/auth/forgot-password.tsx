import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { resetPassword } = useAuth();

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim());
      setEmailSent(true);
      console.log('Password reset email sent');
    } catch (error: any) {
      console.error('Password reset error:', error);
      Alert.alert('Error', error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  if (emailSent) {
    return (
      <ScrollView contentContainerStyle={commonStyles.centerContent}>
        <View style={{ width: '100%', maxWidth: 400, alignItems: 'center' }}>
          <Text style={commonStyles.title}>Check Your Email</Text>
          <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginBottom: spacing.xl }]}>
            We&apos;ve sent a password reset link to {email}
          </Text>
          <Text style={[commonStyles.textMuted, { textAlign: 'center', marginBottom: spacing.xl }]}>
            Please check your email and follow the instructions to reset your password.
          </Text>
          <Button
            text="Back to Login"
            onPress={handleBackToLogin}
            style={{ width: '100%' }}
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={commonStyles.centerContent}>
      <View style={{ width: '100%', maxWidth: 400 }}>
        <Text style={commonStyles.title}>Reset Password</Text>
        <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginBottom: spacing.xl }]}>
          Enter your email address and we&apos;ll send you a link to reset your password
        </Text>

        <View style={commonStyles.section}>
          <TextInput
            style={commonStyles.input}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Button
            text={loading ? "Sending..." : "Send Reset Link"}
            onPress={handleResetPassword}
            disabled={loading}
            style={{ marginTop: spacing.md }}
          />

          <Button
            text="Back to Login"
            onPress={handleBackToLogin}
            variant="outline"
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </View>
    </ScrollView>
  );
}