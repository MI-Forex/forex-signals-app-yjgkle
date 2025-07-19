import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useAuth } from '../../../../contexts/AuthContext';
import { commonStyles, colors, spacing, borderRadius } from '../../../../styles/commonStyles';
import Button from '../../../../components/Button';
import { Picker } from '@react-native-picker/picker';
import { db } from '../../../../firebase/config';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { router, useLocalSearchParams } from 'expo-router';

interface SignalData {
  pair: string;
  type: string;
  entryPoint: string;
  stopLoss: string;
  takeProfit: string;
  notes: string;
  status: 'active' | 'closed' | 'hit_tp' | 'hit_sl';
  targetUsers: 'normal' | 'vip';
}

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

const USER_TYPES = [
  { label: 'Normal Users', value: 'normal' },
  { label: 'VIP Users', value: 'vip' }
];

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Closed', value: 'closed' },
  { label: 'Hit Take Profit', value: 'hit_tp' },
  { label: 'Hit Stop Loss', value: 'hit_sl' }
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

export default function EditSignalScreen() {
  const { id } = useLocalSearchParams();
  const [formData, setFormData] = useState<SignalData>({
    pair: '',
    type: 'BUY',
    entryPoint: '',
    stopLoss: '',
    takeProfit: '',
    notes: '',
    status: 'active',
    targetUsers: 'normal',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { userData } = useAuth();

  useEffect(() => {
    if (id) {
      loadSignal();
    }
  }, [id]);

  const loadSignal = async () => {
    try {
      console.log('Loading signal with ID:', id);
      const signalDoc = await getDoc(doc(db, 'signals', id as string));
      
      if (signalDoc.exists()) {
        const data = signalDoc.data();
        setFormData({
          pair: data.pair || '',
          type: data.type || 'BUY',
          entryPoint: data.entryPoint?.toString() || '',
          stopLoss: data.stopLoss?.toString() || '',
          takeProfit: data.takeProfit?.toString() || '',
          notes: data.notes || '',
          status: data.status || 'active',
          targetUsers: data.targetUsers || (data.isVip ? 'vip' : 'normal'),
        });
        console.log('Signal loaded successfully');
      } else {
        Alert.alert('Error', 'Signal not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading signal:', error);
      Alert.alert('Error', 'Failed to load signal');
      router.back();
    } finally {
      setLoading(false);
    }
  };

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
    if (!formData.status) {
      Alert.alert('Error', 'Please select signal status');
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

    setSaving(true);
    try {
      const updateData = {
        pair: formData.pair.toUpperCase(),
        type: formData.type,
        entryPoint: Number(formData.entryPoint),
        stopLoss: Number(formData.stopLoss),
        takeProfit: Number(formData.takeProfit),
        notes: formData.notes,
        status: formData.status,
        isVip: formData.targetUsers === 'vip',
        targetUsers: formData.targetUsers,
        updatedAt: serverTimestamp(),
        updatedBy: userData?.uid || '',
        updatedByName: userData?.displayName || 'Admin'
      };

      console.log('Updating signal with data:', updateData);
      await updateDoc(doc(db, 'signals', id as string), updateData);
      
      Alert.alert('Success', 'Signal updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error updating signal:', error);
      
      // Generic error messages for security
      let errorMessage = 'Failed to update signal. Please try again.';
      if (error.message.includes('network')) {
        errorMessage = 'Please check internet connectivity';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Please check your credentials';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <View style={commonStyles.loading}>
        <Text style={commonStyles.text}>Loading signal...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Edit Signal</Text>
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

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Target Users *</Text>
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

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Status *</Text>
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
            text="Update Signal"
            onPress={handleSubmit}
            loading={saving}
            disabled={saving}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}