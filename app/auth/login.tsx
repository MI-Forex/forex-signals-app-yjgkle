import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn } = useAuth();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signIn(email.trim(), password);
      console.log('Login successful');
      router.replace('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message || 'Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/auth/register');
  };

  return (
    <KeyboardAvoidingView 
      style={commonStyles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={commonStyles.centerContent}>
        <View style={{ width: '100%', maxWidth: 400 }}>
          <Text style={commonStyles.title}>Welcome Back</Text>
          <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginBottom: spacing.xl }]}>
            Sign in to access your forex signals
          </Text>

          <View style={commonStyles.section}>
            <TextInput
              style={[commonStyles.input, errors.email && commonStyles.inputError]}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && <Text style={commonStyles.errorText}>{errors.email}</Text>}

            <TextInput
              style={[commonStyles.input, errors.password && commonStyles.inputError]}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
            {errors.password && <Text style={commonStyles.errorText}>{errors.password}</Text>}

            <Button
              text={loading ? "Signing In..." : "Sign In"}
              onPress={handleLogin}
              disabled={loading}
              style={{ marginTop: spacing.md }}
            />

            <Button
              text="Forgot Password?"
              onPress={handleForgotPassword}
              variant="outline"
              style={{ marginTop: spacing.sm }}
            />

            <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
              <Text style={commonStyles.textMuted}>Don&apos;t have an account?</Text>
              <Button
                text="Create Account"
                onPress={handleSignUp}
                variant="outline"
                style={{ marginTop: spacing.sm }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}