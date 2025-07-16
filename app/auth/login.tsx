import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn, signInWithGoogle } = useAuth();

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

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      console.log('Google login successful');
      router.replace('/dashboard');
    } catch (error: any) {
      console.error('Google login error:', error);
      Alert.alert('Google Sign-In Failed', error.message || 'Please try again.');
    } finally {
      setGoogleLoading(false);
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
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/49726930-1960-4f49-bc71-d0712257518e.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
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
              disabled={loading || googleLoading}
              style={{ marginTop: spacing.md }}
            />

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            {/* Google Sign-In Button */}
            <Button
              text={googleLoading ? "Signing in with Google..." : "Continue with Google"}
              onPress={handleGoogleSignIn}
              disabled={loading || googleLoading}
              variant="outline"
              style={styles.googleButton}
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

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 120,
    height: 120,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: colors.textMuted,
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
});