import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { signUp } = useAuth();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signUp(formData.email.trim(), formData.password, formData.displayName.trim());
      console.log('Registration successful');
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => router.replace('/dashboard') }
      ]);
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', error.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView 
      style={commonStyles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={commonStyles.centerContent}>
        <View style={{ width: '100%', maxWidth: 400 }}>
          <Text style={commonStyles.title}>Create Account</Text>
          <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginBottom: spacing.xl }]}>
            Join our forex signal community
          </Text>

          <View style={commonStyles.section}>
            <TextInput
              style={[commonStyles.input, errors.displayName && commonStyles.inputError]}
              placeholder="Full Name"
              placeholderTextColor={colors.textMuted}
              value={formData.displayName}
              onChangeText={(value) => updateFormData('displayName', value)}
              autoCapitalize="words"
            />
            {errors.displayName && <Text style={commonStyles.errorText}>{errors.displayName}</Text>}

            <TextInput
              style={[commonStyles.input, errors.email && commonStyles.inputError]}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && <Text style={commonStyles.errorText}>{errors.email}</Text>}

            <TextInput
              style={[commonStyles.input, errors.password && commonStyles.inputError]}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry
              autoCapitalize="none"
            />
            {errors.password && <Text style={commonStyles.errorText}>{errors.password}</Text>}

            <TextInput
              style={[commonStyles.input, errors.confirmPassword && commonStyles.inputError]}
              placeholder="Confirm Password"
              placeholderTextColor={colors.textMuted}
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              secureTextEntry
              autoCapitalize="none"
            />
            {errors.confirmPassword && <Text style={commonStyles.errorText}>{errors.confirmPassword}</Text>}

            <Button
              text={loading ? "Creating Account..." : "Create Account"}
              onPress={handleRegister}
              disabled={loading}
              style={{ marginTop: spacing.md }}
            />

            <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
              <Text style={commonStyles.textMuted}>Already have an account?</Text>
              <Button
                text="Sign In"
                onPress={handleLogin}
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