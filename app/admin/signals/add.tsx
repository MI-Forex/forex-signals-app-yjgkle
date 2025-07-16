import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { Picker } from '@react-native-picker/picker';
import Button from '../../../components/Button';
import { commonStyles, colors, spacing, borderRadius } from '../../../styles/commonStyles';

const CURRENCY_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD',
  'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'CHF/JPY', 'EUR/CHF', 'AUD/JPY', 'GBP/CHF'
];

export default function AddSignalScreen() {
  const [formData, setFormData] = useState({
    pair: 'EUR/USD',
    type: 'BUY' as 'BUY' | 'SELL',
    entryPoint: '',
    stopLoss: '',
    takeProfit: '',
    notes: '',
    status: 'active' as 'active' | 'closed' | 'hit_tp' | 'hit_sl'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { user, userData } = useAuth();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.pair) {
      newErrors.pair = 'Currency pair is required';
    }

    if (!formData.entryPoint) {
      newErrors.entryPoint = 'Entry point is required';
    } else if (isNaN(Number(formData.entryPoint))) {
      newErrors.entryPoint = 'Entry point must be a valid number';
    }

    if (!formData.stopLoss) {
      newErrors.stopLoss = 'Stop loss is required';
    } else if (isNaN(Number(formData.stopLoss))) {
      newErrors.stopLoss = 'Stop loss must be a valid number';
    }

    if (!formData.takeProfit) {
      newErrors.takeProfit = 'Take profit is required';
    } else if (isNaN(Number(formData.takeProfit))) {
      newErrors.takeProfit = 'Take profit must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (userData?.role !== 'admin') {
      Alert.alert('Error', 'You do not have permission to add signals');
      return;
    }

    setLoading(true);
    try {
      const signalData = {
        pair: formData.pair,
        type: formData.type,
        entryPoint: Number(formData.entryPoint),
        stopLoss: Number(formData.stopLoss),
        takeProfit: Number(formData.takeProfit),
        notes: formData.notes.trim() || null,
        status: formData.status,
        createdAt: serverTimestamp(),
        createdBy: user?.uid
      };

      await addDoc(collection(db, 'signals'), signalData);
      console.log('Signal added successfully');
      Alert.alert('Success', 'Signal added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error adding signal:', error);
      Alert.alert('Error', error.message || 'Failed to add signal');
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
      style={commonStyles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[commonStyles.spaceBetween, { padding: spacing.md, paddingBottom: 0 }]}>
        <Text style={commonStyles.title}>Add New Signal</Text>
        <Button
          text="Back"
          onPress={handleBack}
          variant="outline"
          style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
        />
      </View>

      <ScrollView style={commonStyles.content}>
        <View style={commonStyles.card}>
          <View style={{ marginBottom: spacing.md }}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: spacing.sm }]}>
              Currency Pair
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.pair}
                onValueChange={(value) => updateFormData('pair', value)}
                style={styles.picker}
                dropdownIconColor={colors.text}
              >
                {CURRENCY_PAIRS.map(pair => (
                  <Picker.Item 
                    key={pair} 
                    label={pair} 
                    value={pair}
                    color={colors.text}
                  />
                ))}
              </Picker>
            </View>
            {errors.pair && <Text style={commonStyles.errorText}>{errors.pair}</Text>}
          </View>

          <View style={{ marginBottom: spacing.md }}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: spacing.sm }]}>
              Signal Type
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.type}
                onValueChange={(value) => updateFormData('type', value)}
                style={styles.picker}
                dropdownIconColor={colors.text}
              >
                <Picker.Item label="BUY" value="BUY" color={colors.text} />
                <Picker.Item label="SELL" value="SELL" color={colors.text} />
              </Picker>
            </View>
          </View>

          <View style={{ marginBottom: spacing.md }}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: spacing.sm }]}>
              Entry Point
            </Text>
            <TextInput
              style={[commonStyles.input, errors.entryPoint && commonStyles.inputError]}
              placeholder="1.12345"
              placeholderTextColor={colors.textMuted}
              value={formData.entryPoint}
              onChangeText={(value) => updateFormData('entryPoint', value)}
              keyboardType="decimal-pad"
            />
            {errors.entryPoint && <Text style={commonStyles.errorText}>{errors.entryPoint}</Text>}
          </View>

          <View style={{ marginBottom: spacing.md }}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: spacing.sm }]}>
              Stop Loss
            </Text>
            <TextInput
              style={[commonStyles.input, errors.stopLoss && commonStyles.inputError]}
              placeholder="1.12000"
              placeholderTextColor={colors.textMuted}
              value={formData.stopLoss}
              onChangeText={(value) => updateFormData('stopLoss', value)}
              keyboardType="decimal-pad"
            />
            {errors.stopLoss && <Text style={commonStyles.errorText}>{errors.stopLoss}</Text>}
          </View>

          <View style={{ marginBottom: spacing.md }}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: spacing.sm }]}>
              Take Profit
            </Text>
            <TextInput
              style={[commonStyles.input, errors.takeProfit && commonStyles.inputError]}
              placeholder="1.13000"
              placeholderTextColor={colors.textMuted}
              value={formData.takeProfit}
              onChangeText={(value) => updateFormData('takeProfit', value)}
              keyboardType="decimal-pad"
            />
            {errors.takeProfit && <Text style={commonStyles.errorText}>{errors.takeProfit}</Text>}
          </View>

          <View style={{ marginBottom: spacing.md }}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: spacing.sm }]}>
              Status
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.status}
                onValueChange={(value) => updateFormData('status', value)}
                style={styles.picker}
                dropdownIconColor={colors.text}
              >
                <Picker.Item label="Active" value="active" color={colors.text} />
                <Picker.Item label="Closed" value="closed" color={colors.text} />
                <Picker.Item label="Take Profit Hit" value="hit_tp" color={colors.text} />
                <Picker.Item label="Stop Loss Hit" value="hit_sl" color={colors.text} />
              </Picker>
            </View>
          </View>

          <View style={{ marginBottom: spacing.md }}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: spacing.sm }]}>
              Notes (Optional)
            </Text>
            <TextInput
              style={[commonStyles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholder="Additional notes about this signal..."
              placeholderTextColor={colors.textMuted}
              value={formData.notes}
              onChangeText={(value) => updateFormData('notes', value)}
              multiline
              numberOfLines={3}
            />
          </View>

          <Button
            text={loading ? "Adding Signal..." : "Add Signal"}
            onPress={handleSubmit}
            disabled={loading}
            variant="success"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  picker: {
    color: colors.text,
    backgroundColor: 'transparent',
  },
});