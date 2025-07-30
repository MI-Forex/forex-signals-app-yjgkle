import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors, spacing, borderRadius } from '../../../../styles/commonStyles';
import { db } from '../../../../firebase/config';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import Button from '../../../../components/Button';
import { useAuth } from '../../../../contexts/AuthContext';
import { Picker } from '@react-native-picker/picker';

interface SignalData {
  pair: string;
  type: string;
  segment: string;
  status: string;
  entryPoint: string;
  stopLoss: string;
  takeProfit: string;
  notes: string;
  targetUsers: 'normal' | 'vip';
  signalId?: string;
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

const SEGMENTS = [
  { label: 'Forex', value: 'forex' },
  { label: 'Comex', value: 'comex' },
  { label: 'Crypto', value: 'crypto' },
  { label: 'Stocks & Indices', value: 'stocks_indices' }
];

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'inprogress' },
  { label: 'Closed', value: 'closed' }
];

const USER_TYPES = [
  { label: 'Normal Users', value: 'normal' },
  { label: 'VIP Users', value: 'vip' }
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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.md,
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
  },
  picker: {
    color: colors.text,
  },
  buttonContainer: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex1: {
    flex: 1,
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

export default function EditSignalScreen() {
  const { id } = useLocalSearchParams();
  const [formData, setFormData] = useState<SignalData>({
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
  const [initialLoading, setInitialLoading] = useState(true);
  const { userData } = useAuth();

  useEffect(() => {
    if (id) {
      loadSignal();
    }
  }, [id]);

  const loadSignal = async () => {
    try {
      const signalDoc = await getDoc(doc(db, 'signals', id as string));
      if (signalDoc.exists()) {
        const data = signalDoc.data();
        setFormData({
          pair: data.pair || '',
          type: data.type || 'BUY',
          segment: data.segment || 'forex',
          status: data.status || 'active',
          entryPoint: data.entryPoint?.toString() || '',
          stopLoss: data.stopLoss?.toString() || '',
          takeProfit: data.takeProfit?.toString() || '',
          notes: data.notes || '',
          targetUsers: data.targetUsers || 'normal',
          signalId: data.signalId || '',
        });
      } else {
        Alert.alert('Error', 'Signal not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading signal:', error);
      Alert.alert('Error', 'Failed to load signal');
      router.back();
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.pair.trim()) {
      Alert.alert('Error', 'Please enter a currency pair');
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
      const updateData = {
        pair: formData.pair.toUpperCase(),
        type: formData.type,
        segment: formData.segment,
        status: formData.status,
        entryPoint: Number(formData.entryPoint),
        stopLoss: Number(formData.stopLoss),
        takeProfit: Number(formData.takeProfit),
        notes: formData.notes,
        targetUsers: formData.targetUsers,
        isVip: formData.targetUsers === 'vip',
        updatedAt: serverTimestamp(),
        updatedBy: userData?.uid || 'unknown'
      };

      console.log('Updating signal with data:', updateData);
      await updateDoc(doc(db, 'signals', id as string), updateData);
      
      Alert.alert('Success', 'Signal updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error updating signal:', error);
      
      // Generic error messages for security
      let errorMessage = 'Failed to update signal';
      if (error.message.includes('network')) {
        errorMessage = 'Please check internet connectivity';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Please check your credentials';
      }
      
      Alert.alert('Error', `${errorMessage}. Please try again.`);
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

  if (initialLoading) {
    return (
      <View style={[commonStyles.container, commonStyles.centerContent]}>
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
        <Button text="← Back" onPress={handleBack} variant="outline" />
        <Text style={styles.title}>Edit Signal</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {formData.signalId && (
          <View style={styles.signalIdContainer}>
            <Text style={styles.signalIdText}>Signal ID: #{formData.signalId}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Currency Pair *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., EUR/USD, GBP/JPY"
            value={formData.pair}
            onChangeText={(value) => updateFormData('pair', value)}
            autoCapitalize="characters"
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
          <Text style={styles.label}>Segment *</Text>
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

        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.flex1]}>
            <Text style={styles.label}>Entry Point *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.0000"
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
            value={formData.takeProfit}
            onChangeText={(value) => updateFormData('takeProfit', value)}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Add any additional notes..."
            value={formData.notes}
            onChangeText={(value) => updateFormData('notes', value)}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            text={loading ? "Updating..." : "Update Signal"}
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}