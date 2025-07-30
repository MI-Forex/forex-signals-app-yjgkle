import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { commonStyles, colors, spacing, borderRadius, shadows } from '../../../styles/commonStyles';
import Button from '../../../components/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../firebase/config';
import { router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const SIGNAL_TYPES = [
  { label: 'BUY', value: 'BUY' },
  { label: 'SELL', value: 'SELL' },
  { label: 'BUY LIMIT', value: 'BUY_LIMIT' },
  { label: 'SELL LIMIT', value: 'SELL_LIMIT' },
  { label: 'BUY STOP', value: 'BUY_STOP' },
  { label: 'SELL STOP', value: 'SELL_STOP' },
  { label: 'BUY STOP LIMIT', value: 'BUY_STOP_LIMIT' },
  { label: 'SELL STOP LIMIT', value: 'SELL_STOP_LIMIT' }
];

const SEGMENTS = [
  { label: 'Forex', value: 'forex' },
  { label: 'Comex', value: 'comex' },
  { label: 'Crypto', value: 'crypto' },
  { label: 'Stocks & Indices', value: 'stocks_indices' }
];

const STATUS_OPTIONS = [
  { label: 'In Progress', value: 'inprogress' },
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' }
];

const USER_TYPES = [
  { label: 'Normal Users', value: 'normal' },
  { label: 'VIP Users', value: 'vip' }
];

// Function to generate unique signal ID
const generateSignalId = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.sm,
  },
  headerGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
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
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    ...shadows.md,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 120,
    textAlignVertical: 'top',
    ...shadows.sm,
  },
  pickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.sm,
  },
  picker: {
    color: colors.text,
    backgroundColor: colors.surface,
  },
  buttonContainer: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  compactButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 40,
    borderRadius: borderRadius.lg,
  },
  compactButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  signalIdContainer: {
    backgroundColor: colors.primary + '20',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  signalIdText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
  },
});

export default function AddSignalScreen() {
  const [formData, setFormData] = useState({
    pair: '',
    type: 'BUY',
    segment: 'forex',
    status: 'active',
    entryPoint: '',
    stopLoss: '',
    takeProfit: '',
    notes: '',
    targetUsers: 'normal',
  });
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [signalId] = useState(generateSignalId());
  const { userData } = useAuth();

  // Check if user has permission to add signals
  React.useEffect(() => {
    if (!userData?.isAdmin && userData?.role !== 'admin' && !userData?.isEditor && userData?.role !== 'editor') {
      Alert.alert('Access Denied', 'You do not have permission to add signals');
      router.back();
    }
  }, [userData]);

  const validateForm = () => {
    if (!formData.pair.trim()) {
      Alert.alert('Error', 'Please enter a currency pair');
      return false;
    }
    if (!formData.type) {
      Alert.alert('Error', 'Please select signal type');
      return false;
    }
    if (!formData.segment) {
      Alert.alert('Error', 'Please select segment');
      return false;
    }
    if (!formData.status) {
      Alert.alert('Error', 'Please select status');
      return false;
    }
    if (!formData.entryPoint || isNaN(Number(formData.entryPoint))) {
      Alert.alert('Error', 'Please enter a valid entry point');
      return false;
    }
    if (!formData.stopLoss || isNaN(Number(formData.stopLoss))) {
      Alert.alert('Error', 'Please enter a valid stop loss');
      return false;
    }
    if (!formData.takeProfit || isNaN(Number(formData.takeProfit))) {
      Alert.alert('Error', 'Please enter a valid take profit');
      return false;
    }
    if (!formData.targetUsers) {
      Alert.alert('Error', 'Please select target user type');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const signalData = {
        signalId: signalId,
        pair: formData.pair.toUpperCase(),
        type: formData.type,
        segment: formData.segment,
        status: formData.status,
        entryPoint: Number(formData.entryPoint),
        stopLoss: Number(formData.stopLoss),
        takeProfit: Number(formData.takeProfit),
        notes: formData.notes,
        isVip: formData.targetUsers === 'vip',
        targetUsers: formData.targetUsers,
        createdAt: serverTimestamp(),
        createdBy: userData?.uid || '',
        createdByName: userData?.displayName || 'Admin',
        updatedAt: serverTimestamp(),
        updatedBy: userData?.uid || ''
      };

      console.log('Adding signal with data:', signalData);
      await addDoc(collection(db, 'signals'), signalData);
      
      Alert.alert('Success', `Signal #${signalId} added successfully`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error adding signal:', error);
      
      let errorMessage = 'Failed to add signal. Please try again.';
      if (error.message.includes('network')) {
        errorMessage = 'Please check internet connectivity';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Please check your credentials';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInputFocus = (inputName: string) => {
    setFocusedInput(inputName);
  };

  const handleInputBlur = () => {
    setFocusedInput(null);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.headerGradient}
      >
        <Button
          text="← Back"
          onPress={handleBack}
          variant="outline"
          style={[styles.compactButton, { backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)' }]}
          textStyle={[styles.compactButtonText, { color: colors.white }]}
        />
        <Text style={styles.title}>Add Signal</Text>
        <View style={{ width: 80 }} />
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <View style={styles.signalIdContainer}>
            <Text style={styles.signalIdText}>Signal ID: #{signalId}</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              <Ionicons name="trending-up" size={16} color={colors.primary} /> Currency Pair *
            </Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'pair' && styles.inputFocused
              ]}
              placeholder="e.g., EUR/USD, GBP/JPY, BTC/USD"
              placeholderTextColor={colors.textSecondary}
              value={formData.pair}
              onChangeText={(value) => updateFormData('pair', value)}
              onFocus={() => handleInputFocus('pair')}
              onBlur={handleInputBlur}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              <Ionicons name="swap-horizontal" size={16} color={colors.primary} /> Signal Type *
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.type}
                onValueChange={(value) => updateFormData('type', value)}
                style={styles.picker}
              >
                {SIGNAL_TYPES.map((signalType) => (
                  <Picker.Item 
                    key={signalType.value} 
                    label={signalType.label} 
                    value={signalType.value} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              <Ionicons name="layers" size={16} color={colors.primary} /> Segment *
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.segment}
                onValueChange={(value) => updateFormData('segment', value)}
                style={styles.picker}
              >
                {SEGMENTS.map((segment) => (
                  <Picker.Item 
                    key={segment.value} 
                    label={segment.label} 
                    value={segment.value} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} /> Status *
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.status}
                onValueChange={(value) => updateFormData('status', value)}
                style={styles.picker}
              >
                {STATUS_OPTIONS.map((status) => (
                  <Picker.Item 
                    key={status.value} 
                    label={status.label} 
                    value={status.value} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              <Ionicons name="people" size={16} color={colors.primary} /> Target Users *
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.targetUsers}
                onValueChange={(value) => updateFormData('targetUsers', value)}
                style={styles.picker}
              >
                {USER_TYPES.map((userType) => (
                  <Picker.Item 
                    key={userType.value} 
                    label={userType.label} 
                    value={userType.value} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.flex1]}>
              <Text style={styles.label}>
                <Ionicons name="enter" size={16} color={colors.success} /> Entry Point *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'entryPoint' && styles.inputFocused
                ]}
                placeholder="0.0000"
                placeholderTextColor={colors.textSecondary}
                value={formData.entryPoint}
                onChangeText={(value) => updateFormData('entryPoint', value)}
                onFocus={() => handleInputFocus('entryPoint')}
                onBlur={handleInputBlur}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.inputContainer, styles.flex1]}>
              <Text style={styles.label}>
                <Ionicons name="stop" size={16} color={colors.danger} /> Stop Loss *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'stopLoss' && styles.inputFocused
                ]}
                placeholder="0.0000"
                placeholderTextColor={colors.textSecondary}
                value={formData.stopLoss}
                onChangeText={(value) => updateFormData('stopLoss', value)}
                onFocus={() => handleInputFocus('stopLoss')}
                onBlur={handleInputBlur}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              <Ionicons name="flag" size={16} color={colors.success} /> Take Profit *
            </Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'takeProfit' && styles.inputFocused
              ]}
              placeholder="0.0000"
              placeholderTextColor={colors.textSecondary}
              value={formData.takeProfit}
              onChangeText={(value) => updateFormData('takeProfit', value)}
              onFocus={() => handleInputFocus('takeProfit')}
              onBlur={handleInputBlur}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              <Ionicons name="document-text" size={16} color={colors.primary} /> Notes
            </Text>
            <TextInput
              style={[
                styles.textArea,
                focusedInput === 'notes' && styles.inputFocused
              ]}
              placeholder="Add any additional notes or analysis..."
              placeholderTextColor={colors.textSecondary}
              value={formData.notes}
              onChangeText={(value) => updateFormData('notes', value)}
              onFocus={() => handleInputFocus('notes')}
              onBlur={handleInputBlur}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              text={loading ? "Adding Signal..." : "✨ Add Signal"}
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              size="large"
              style={{ borderRadius: borderRadius.xl }}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}