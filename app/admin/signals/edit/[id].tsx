import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useAuth } from '../../../../contexts/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../firebase/config';
import { Picker } from '@react-native-picker/picker';
import Button from '../../../../components/Button';
import { commonStyles, colors, spacing, borderRadius } from '../../../../styles/commonStyles';

interface SignalData {
  pair: string;
  type: 'BUY' | 'SELL';
  entryPoint: string;
  stopLoss: string;
  takeProfit: string;
  notes: string;
  status: 'active' | 'closed' | 'hit_tp' | 'hit_sl';
}

export default function EditSignalScreen() {
  const { id } = useLocalSearchParams();
  const [formData, setFormData] = useState<SignalData>({
    pair: '',
    type: 'BUY',
    entryPoint: '',
    stopLoss: '',
    takeProfit: '',
    notes: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { userData } = useAuth();

  useEffect(() => {
    loadSignal();
  }, [id]);

  const loadSignal = async () => {
    try {
      if (typeof id === 'string') {
        const signalDoc = await getDoc(doc(db, 'signals', id));
        if (signalDoc.exists()) {
          const data = signalDoc.data();
          setFormData({
            pair: data.pair || '',
            type: data.type || 'BUY',
            entryPoint: data.entryPoint?.toString() || '',
            stopLoss: data.stopLoss?.toString() || '',
            takeProfit: data.takeProfit?.toString() || '',
            notes: data.notes || '',
            status: data.status || 'active'
          });
        } else {
          Alert.alert('Error', 'Signal not found');
          router.back();
        }
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
      Alert.alert('Error', 'Please enter currency pair');
      return false;
    }
    if (!formData.entryPoint.trim()) {
      Alert.alert('Error', 'Please enter entry point');
      return false;
    }
    if (!formData.stopLoss.trim()) {
      Alert.alert('Error', 'Please enter stop loss');
      return false;
    }
    if (!formData.takeProfit.trim()) {
      Alert.alert('Error', 'Please enter take profit');
      return false;
    }

    const entryPoint = parseFloat(formData.entryPoint);
    const stopLoss = parseFloat(formData.stopLoss);
    const takeProfit = parseFloat(formData.takeProfit);

    if (isNaN(entryPoint) || isNaN(stopLoss) || isNaN(takeProfit)) {
      Alert.alert('Error', 'Please enter valid numbers for entry point, stop loss, and take profit');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const signalData = {
        pair: formData.pair.trim().toUpperCase(),
        type: formData.type,
        entryPoint: parseFloat(formData.entryPoint),
        stopLoss: parseFloat(formData.stopLoss),
        takeProfit: parseFloat(formData.takeProfit),
        notes: formData.notes.trim(),
        status: formData.status,
        updatedAt: new Date(),
        updatedBy: userData?.uid || 'unknown' // Ensure updatedBy is never undefined
      };

      console.log('Updating signal with data:', signalData);

      if (typeof id === 'string') {
        await updateDoc(doc(db, 'signals', id), signalData);
        Alert.alert('Success', 'Signal updated successfully');
        router.back();
      }
    } catch (error) {
      console.error('Error updating signal:', error);
      Alert.alert('Error', 'Failed to update signal. Please try again.');
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

  if (!userData?.isAdmin) {
    return (
      <View style={commonStyles.centerContent}>
        <Text style={commonStyles.text}>Access denied. Admin privileges required.</Text>
        <Button text="Go Back" onPress={handleBack} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={commonStyles.loading}>
        <Text style={commonStyles.text}>Loading signal...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={commonStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Edit Signal</Text>
        <Button
          text="Cancel"
          onPress={handleBack}
          variant="outline"
          style={styles.cancelButton}
        />
      </View>

      <ScrollView 
        style={commonStyles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={commonStyles.label}>Currency Pair *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.pair}
            onChangeText={(value) => updateFormData('pair', value)}
            placeholder="e.g., EUR/USD"
            autoCapitalize="characters"
          />

          <Text style={commonStyles.label}>Signal Type *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.type}
              onValueChange={(value) => updateFormData('type', value)}
              style={styles.picker}
            >
              <Picker.Item label="BUY" value="BUY" />
              <Picker.Item label="SELL" value="SELL" />
            </Picker>
          </View>

          <Text style={commonStyles.label}>Entry Point *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.entryPoint}
            onChangeText={(value) => updateFormData('entryPoint', value)}
            placeholder="e.g., 1.2345"
            keyboardType="decimal-pad"
          />

          <Text style={commonStyles.label}>Stop Loss *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.stopLoss}
            onChangeText={(value) => updateFormData('stopLoss', value)}
            placeholder="e.g., 1.2300"
            keyboardType="decimal-pad"
          />

          <Text style={commonStyles.label}>Take Profit *</Text>
          <TextInput
            style={commonStyles.input}
            value={formData.takeProfit}
            onChangeText={(value) => updateFormData('takeProfit', value)}
            placeholder="e.g., 1.2400"
            keyboardType="decimal-pad"
          />

          <Text style={commonStyles.label}>Status *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.status}
              onValueChange={(value) => updateFormData('status', value)}
              style={styles.picker}
            >
              <Picker.Item label="Active" value="active" />
              <Picker.Item label="Closed" value="closed" />
              <Picker.Item label="Hit Take Profit" value="hit_tp" />
              <Picker.Item label="Hit Stop Loss" value="hit_sl" />
            </Picker>
          </View>

          <Text style={commonStyles.label}>Notes</Text>
          <TextInput
            style={[commonStyles.input, styles.notesInput]}
            value={formData.notes}
            onChangeText={(value) => updateFormData('notes', value)}
            placeholder="Additional notes or analysis..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Button
            text="Update Signal"
            onPress={handleSubmit}
            loading={saving}
            disabled={saving}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  cancelButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  form: {
    padding: spacing.lg,
  },
  pickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  picker: {
    color: colors.text,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: spacing.xl,
  },
});