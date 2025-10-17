import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import Button from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';

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
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    paddingRight: 50,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eyeIcon: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    padding: spacing.xs,
  },
  buttonContainer: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  linkContainer: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  signUpLink: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: colors.primary,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  resendContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  resendText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  resendTimer: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const { signIn, userData, resendVerificationEmail } = useAuth();

  // Check if user just registered and show resend option
  useEffect(() => {
    // Check localStorage for recent registration
    const checkRecentRegistration = () => {
      try {
        const registrationTime = localStorage.getItem('recentRegistration');
        if (registrationTime) {
          const timeDiff = Date.now() - parseInt(registrationTime);
          if (timeDiff < 300000) { // 5 minutes
            setShowResendOption(true);
            const remainingTime = Math.max(0, 60 - Math.floor(timeDiff / 1000));
            setResendTimer(remainingTime);
            setCanResend(remainingTime === 0);
          } else {
            localStorage.removeItem('recentRegistration');
          }
        }
      } catch (error) {
        // localStorage not available (mobile), ignore
      }
    };

    checkRecentRegistration();
  }, []);

  // Timer countdown for resend verification
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showResendOption && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showResendOption, resendTimer]);

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    console.log('Starting login process for:', email.trim());
    setLoading(true);
    
    try {
      console.log('Calling signIn function...');
      await signIn(email.trim(), password);
      console.log('Login successful, navigation will be handled by AuthContext');
      
      // Clear registration flag if login successful
      try {
        localStorage.removeItem('recentRegistration');
      } catch (error) {
        // Ignore localStorage errors on mobile
      }
      
      // Don't set loading to false here - let AuthContext handle navigation
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      Alert.alert('Login Failed', error.message);
      setLoading(false); // Only set loading to false on error
    }
  };

  const handleResendVerification = async () => {
    if (!canResend || !email.trim()) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    try {
      setLoading(true);
      await resendVerificationEmail();
      Alert.alert(
        'Verification Email Sent',
        'Please check your inbox and click the verification link to activate your account.',
        [{ text: 'OK' }]
      );
      
      // Reset timer
      setResendTimer(60);
      setCanResend(false);
    } catch (error: any) {
      Alert.alert('Error', error.message);
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            source={require('../../assets/images/00a46297-3f16-4e57-967e-c79ec0897b80.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={togglePasswordVisibility}
              disabled={loading}
            >
              <Ionicons 
                name={showPassword ? 'eye-off' : 'eye'} 
                size={24} 
                color={loading ? colors.textMuted : colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Resend Verification Section */}
        {showResendOption && (
          <View style={styles.resendContainer}>
            <Text style={styles.resendTitle}>Need to verify your email?</Text>
            <Text style={styles.resendText}>
              If you just registered, you need to verify your email address before signing in.
            </Text>
            <Button
              text={canResend ? "Resend Verification Link" : "Resend Verification Link"}
              onPress={handleResendVerification}
              disabled={!canResend || loading}
              variant="outline"
            />
            {!canResend && resendTimer > 0 && (
              <Text style={styles.resendTimer}>
                You can resend in {resendTimer} seconds
              </Text>
            )}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            text={loading ? "Signing In..." : "Sign In"}
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
          />
          
          {loading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Logging you in...</Text>
            </View>
          )}
        </View>

        <View style={styles.linkContainer}>
          <TouchableOpacity onPress={handleForgotPassword} disabled={loading}>
            <Text style={[styles.linkText, loading && { opacity: 0.5 }]}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <View style={styles.signUpContainer}>
            <Text style={[styles.signUpText, loading && { opacity: 0.5 }]}>Don't have an account?</Text>
            <TouchableOpacity onPress={handleSignUp} disabled={loading}>
              <Text style={[styles.signUpLink, loading && { opacity: 0.5 }]}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}