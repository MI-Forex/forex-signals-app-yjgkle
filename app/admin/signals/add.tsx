import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { commonStyles, colors, spacing, borderRadius } from '../../../styles/commonStyles';
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.lg,
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
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
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
});

export default function AddSignalScreen() {
  const [formData, setFormData] = useState({
    pair: '',
    type: 'BUY',
    entryPoint: '',
    stopLoss: '',
    takeProfit: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const { userData } = useAuth();

  const validateForm = () => {
    if (!formData.pair.trim()) {
      Alert.alert('Error', 'Please enter a currency pair');
      return false;
    }
    if (!formData.type) {
      Alert.alert('Error', 'Please select signal type');
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
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const signalData = {
        pair: formData.pair.toUpperCase(),
        type: formData.type,
        entryPoint: Number(formData.entryPoint),
        stopLoss: Number(formData.stopLoss),
        takeProfit: Number(formData.takeProfit),
        notes: formData.notes,
        status: 'active',
        createdAt: serverTimestamp(),
        createdBy: userData?.uid || '',
        createdByName: userData?.displayName || 'Admin',
        updatedAt: serverTimestamp(),
        updatedBy: userData?.uid || ''
      };

      console.log('Adding signal with data:', signalData);
      await addDoc(collection(db, 'signals'), signalData);
      
      Alert.alert('Success', 'Signal added successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error adding signal:', error);
      Alert.alert('Error', 'Failed to add signal. Please try again.');
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

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Add New Signal</Text>
        <Button
          text="Cancel"
          onPress={handleBack}
          variant="outline"
          style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
        />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Currency Pair *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., EUR/USD, GBP/JPY, BTC/USD"
            placeholderTextColor={colors.textSecondary}
            value={formData.pair}
            onChangeText={(value) => updateFormData('pair', value)}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Signal Type *</Text>
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

        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.flex1]}>
            <Text style={styles.label}>Entry Point *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.0000"
              placeholderTextColor={colors.textSecondary}
              value={formData.entryPoint}
              onChangeText={(value) => updateFormData('entryPoint', value)}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={[styles.inputContainer, styles.flex1]}>
            <Text style={styles.label}>Stop Loss *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.0000"
              placeholderTextColor={colors.textSecondary}
              value={formData.stopLoss}
              onChangeText={(value) => updateFormData('stopLoss', value)}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Take Profit *</Text>
          <TextInput
            style={styles.input}
            placeholder="0.0000"
            placeholderTextColor={colors.textSecondary}
            value={formData.takeProfit}
            onChangeText={(value) => updateFormData('takeProfit', value)}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Add any additional notes or analysis..."
            placeholderTextColor={colors.textSecondary}
            value={formData.notes}
            onChangeText={(value) => updateFormData('notes', value)}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            text="Add Signal"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}