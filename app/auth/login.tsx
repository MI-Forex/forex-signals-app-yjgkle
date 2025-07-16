import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, Image, StyleSheet } from 'react-native';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';
import Button from '../../components/Button';
import DevelopmentNote from '../../components/DevelopmentNote';
import TroubleshootingGuide from '../../components/TroubleshootingGuide';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { isGoogleSignInAvailable } from '../../utils/googleSignInConfig';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.md,
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
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  linkText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: colors.textSecondary,
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  googleButtonText: {
    color: colors.text,
  },
});

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  
  const googleSignInAvailable = isGoogleSignInAvailable();

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signIn(email, password);
      console.log('Login successful');
      router.replace('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      console.log('Google sign in successful');
      router.replace('/dashboard');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      
      let errorMessage = error.message;
      let errorTitle = 'Google Sign-In Failed';
      
      if (error.message.includes('not available') || error.message.includes('not supported')) {
        errorTitle = 'Google Sign-In Unavailable';
        errorMessage = 'Google Sign-In is not available in Expo Go. Please use email/password login or create a development build to use Google Sign-In.';
      } else if (error.message.includes('cancelled')) {
        errorTitle = 'Sign-In Cancelled';
        errorMessage = 'Google Sign-In was cancelled by the user.';
      } else if (error.message.includes('Play Services')) {
        errorTitle = 'Google Play Services Required';
        errorMessage = 'Google Play Services is required for Google Sign-In. Please update Google Play Services and try again.';
      }
      
      Alert.alert(errorTitle, errorMessage);
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/79dba73d-dd79-4fc8-a354-4149cac3d408.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your Forex account</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            text="Sign In"
            onPress={handleLogin}
            loading={loading}
            disabled={loading || googleLoading}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {!googleSignInAvailable && (
            <DevelopmentNote 
              message="Google Sign-In is not available in Expo Go. Create a development build to enable Google authentication."
              type="warning"
            />
          )}

          <Button
            text="Continue with Google"
            onPress={handleGoogleSignIn}
            loading={googleLoading}
            disabled={loading || googleLoading || !googleSignInAvailable}
            style={[styles.googleButton, !googleSignInAvailable && { opacity: 0.5 }]}
            textStyle={styles.googleButtonText}
            variant="outline"
          />
        </View>

        <View style={styles.linkContainer}>
          <Button
            text="Forgot Password?"
            onPress={handleForgotPassword}
            variant="outline"
            style={{ backgroundColor: 'transparent', borderWidth: 0 }}
            textStyle={styles.linkText}
          />
        </View>

        <View style={styles.linkContainer}>
          <Text style={{ color: colors.textSecondary }}>
            Don't have an account?{' '}
          </Text>
          <Button
            text="Sign Up"
            onPress={handleSignUp}
            variant="outline"
            style={{ backgroundColor: 'transparent', borderWidth: 0 }}
            textStyle={styles.linkText}
          />
        </View>

        <TroubleshootingGuide />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}