import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import Button from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';
import CountryPicker from 'react-native-country-picker-modal';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

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
  requiredLabel: {
    color: colors.error,
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
  phoneContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  countryPickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  phoneInput: {
    flex: 1,
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
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  signInLink: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [countryCode, setCountryCode] = useState('US');
  const [callingCode, setCallingCode] = useState('1');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const { signUp } = useAuth();

  const validateForm = () => {
    if (!formData.displayName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    if (!formData.password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    // Validate phone number
    try {
      const fullPhoneNumber = `+${callingCode}${formData.phoneNumber}`;
      if (!isValidPhoneNumber(fullPhoneNumber)) {
        Alert.alert('Error', 'Please enter a valid phone number');
        return false;
      }
    } catch (error) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const fullPhoneNumber = `+${callingCode}${formData.phoneNumber}`;
      await signUp(
        formData.email.trim(),
        formData.password,
        formData.displayName.trim(),
        fullPhoneNumber
      );
      console.log('Registration successful');
      
      // Show email verification alert
      Alert.alert(
        'Registration Successful!',
        'Please check your email and click the verification link to activate your account. You must verify your email before you can sign in.',
        [{ text: 'OK' }]
      );
      
      // Navigate to login
      router.replace('/auth/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', error.message);
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

  const onSelectCountry = (country: any) => {
    console.log('Country selected:', country);
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0]);
    setShowCountryPicker(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const openCountryPicker = () => {
    setShowCountryPicker(true);
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
            source={require('../../assets/images/abeba35d-8bd7-489c-b663-a8996a997091.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our trading community</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Full Name <Text style={styles.requiredLabel}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor={colors.textSecondary}
            value={formData.displayName}
            onChangeText={(value) => updateFormData('displayName', value)}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Email Address <Text style={styles.requiredLabel}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={colors.textSecondary}
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Phone Number <Text style={styles.requiredLabel}>*</Text>
          </Text>
          <View style={styles.phoneContainer}>
            <TouchableOpacity 
              style={styles.countryPickerContainer}
              onPress={openCountryPicker}
              activeOpacity={0.7}
            >
              <CountryPicker
                countryCode={countryCode as any}
                withFilter
                withFlag
                withCallingCode
                withEmoji
                visible={showCountryPicker}
                onSelect={onSelectCountry}
                onClose={() => setShowCountryPicker(false)}
              />
              <Text style={{ color: colors.text, marginLeft: 4 }}>
                +{callingCode}
              </Text>
            </TouchableOpacity>
            <TextInput
              style={styles.phoneInput}
              placeholder="Phone number"
              placeholderTextColor={colors.textSecondary}
              value={formData.phoneNumber}
              onChangeText={(value) => updateFormData('phoneNumber', value)}
              keyboardType="phone-pad"
              autoCorrect={false}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Password <Text style={styles.requiredLabel}>*</Text>
          </Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor={colors.textSecondary}
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={togglePasswordVisibility}
            >
              <Ionicons 
                name={showPassword ? 'eye-off' : 'eye'} 
                size={24} 
                color={colors.textMuted} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Confirm Password <Text style={styles.requiredLabel}>*</Text>
          </Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm your password"
              placeholderTextColor={colors.textSecondary}
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity 
              style={styles.eyeIcon}
              onPress={toggleConfirmPasswordVisibility}
            >
              <Ionicons 
                name={showConfirmPassword ? 'eye-off' : 'eye'} 
                size={24} 
                color={colors.textMuted} 
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            text="Create Account"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
          />
        </View>

        <View style={styles.linkContainer}>
          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account?</Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}