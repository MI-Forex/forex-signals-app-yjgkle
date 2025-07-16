import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';
import CountryPicker from 'react-native-country-picker-modal';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

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
  const [showCountryPicker, setShowCountryPicker] = useState(false);
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

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Mobile number is required';
    } else {
      try {
        const fullPhoneNumber = `+${callingCode}${formData.phoneNumber}`;
        if (!isValidPhoneNumber(fullPhoneNumber)) {
          newErrors.phoneNumber = 'Please enter a valid mobile number';
        }
      } catch (error) {
        newErrors.phoneNumber = 'Please enter a valid mobile number';
      }
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
      const fullPhoneNumber = `+${callingCode}${formData.phoneNumber}`;
      await signUp(
        formData.email.trim(), 
        formData.password, 
        formData.displayName.trim(),
        fullPhoneNumber
      );
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

  const onSelectCountry = (country: any) => {
    setCountryCode(country.cca2);
    setCallingCode(country.callingCode[0]);
    setShowCountryPicker(false);
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
          
          <Text style={commonStyles.title}>Create Account</Text>
          <Text style={[commonStyles.textSecondary, { textAlign: 'center', marginBottom: spacing.xl }]}>
            Join our forex signal community
          </Text>

          <View style={commonStyles.section}>
            <TextInput
              style={[commonStyles.input, errors.displayName && commonStyles.inputError]}
              placeholder="Full Name *"
              placeholderTextColor={colors.textMuted}
              value={formData.displayName}
              onChangeText={(value) => updateFormData('displayName', value)}
              autoCapitalize="words"
            />
            {errors.displayName && <Text style={commonStyles.errorText}>{errors.displayName}</Text>}

            <TextInput
              style={[commonStyles.input, errors.email && commonStyles.inputError]}
              placeholder="Email *"
              placeholderTextColor={colors.textMuted}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && <Text style={commonStyles.errorText}>{errors.email}</Text>}

            {/* Phone Number with Country Code */}
            <View style={styles.phoneContainer}>
              <Button
                text={`+${callingCode}`}
                onPress={() => setShowCountryPicker(true)}
                variant="outline"
                style={styles.countryCodeButton}
                textStyle={styles.countryCodeText}
              />
              <TextInput
                style={[
                  commonStyles.input, 
                  styles.phoneInput,
                  errors.phoneNumber && commonStyles.inputError
                ]}
                placeholder="Mobile Number *"
                placeholderTextColor={colors.textMuted}
                value={formData.phoneNumber}
                onChangeText={(value) => updateFormData('phoneNumber', value)}
                keyboardType="phone-pad"
              />
            </View>
            {errors.phoneNumber && <Text style={commonStyles.errorText}>{errors.phoneNumber}</Text>}

            <CountryPicker
              countryCode={countryCode as any}
              withFilter
              withFlag
              withCallingCode
              withEmoji
              onSelect={onSelectCountry}
              visible={showCountryPicker}
              onClose={() => setShowCountryPicker(false)}
            />

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

            <Text style={styles.requiredText}>* Required fields</Text>

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

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 120,
    height: 120,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  countryCodeButton: {
    minWidth: 80,
    paddingHorizontal: spacing.sm,
  },
  countryCodeText: {
    fontSize: 16,
  },
  phoneInput: {
    flex: 1,
    marginTop: 0,
  },
  requiredText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
});