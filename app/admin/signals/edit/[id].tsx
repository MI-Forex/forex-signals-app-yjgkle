
import { db } from '../../../../firebase/config';
import { commonStyles, colors, spacing, borderRadius } from '../../../../styles/commonStyles';
import { doc, getDoc, updateDoc, serverTimestamp } from '@firebase/firestore';
import { router, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import Button from '../../../../components/Button';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

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

const SIGNAL_TYPES = ['BUY', 'SELL'];
const SEGMENTS = ['GOLD', 'FOREX', 'CRYPTO', 'INDICES'];
const STATUS_OPTIONS = ['active', 'closed', 'hit_tp', 'hit_sl', 'inprogress', 'pending'];
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
    padding: spacing.lg,
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
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  picker: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
});

export default function EditSignalScreen() {
  const { id } = useLocalSearchParams();
  const [formData, setFormData] = useState<SignalData>({
    pair: '',
    type: 'BUY',
    segment: 'GOLD',
    status: 'active',
    entryPoint: '',
    stopLoss: '',
    takeProfit: '',
    notes: '',
    targetUsers: 'normal',
    signalId: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingSignal, setLoadingSignal] = useState(true);
  const { userData } = useAuth();

  const loadSignal = useCallback(async () => {
    if (!id || typeof id !== 'string') {
      Alert.alert('Error', 'Invalid signal ID');
      router.back();
      return;
    }

    try {
      const signalDoc = await getDoc(doc(db, 'signals', id));
      
      if (!signalDoc.exists()) {
        Alert.alert('Error', 'Signal not found');
        router.back();
        return;
      }

      const data = signalDoc.data();
      setFormData({
        pair: data.pair || '',
        type: data.type || 'BUY',
        segment: data.segment || 'GOLD',
        status: data.status || 'active',
        entryPoint: data.entryPoint?.toString() || '',
        stopLoss: data.stopLoss?.toString() || '',
        takeProfit: data.takeProfit?.toString() || '',
        notes: data.notes || '',
        targetUsers: data.targetUsers || 'normal',
        signalId: data.signalId || '',
      });
    } catch (error: any) {
      console.error('Error loading signal:', error);
      Alert.alert('Error', 'Failed to load signal');
      router.back();
    } finally {
      setLoadingSignal(false);
    }
  }, [id]);

  useEffect(() => {
    // Check if user has permission to edit signals
    if (!userData?.isAdmin && userData?.role !== 'admin' && !userData?.isEditor && userData?.role !== 'editor') {
      Alert.alert('Access Denied', 'You do not have permission to edit signals');
      router.back();
      return;
    }

    loadSignal();
  }, [userData, loadSignal]);

  const validateForm = () => {
    if (!formData.pair.trim()) {
      Alert.alert('Error', 'Please enter a currency pair');
      return false;
    }
    if (!formData.entryPoint || isNaN(parseFloat(formData.entryPoint))) {
      Alert.alert('Error', 'Please enter a valid entry point');
      return false;
    }
    if (!formData.stopLoss || isNaN(parseFloat(formData.stopLoss))) {
      Alert.alert('Error', 'Please enter a valid stop loss');
      return false;
    }
    if (!formData.takeProfit || isNaN(parseFloat(formData.takeProfit))) {
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
        pair: formData.pair.trim().toUpperCase(),
        type: formData.type,
        segment: formData.segment,
        status: formData.status,
        entryPoint: parseFloat(formData.entryPoint),
        stopLoss: parseFloat(formData.stopLoss),
        takeProfit: parseFloat(formData.takeProfit),
        notes: formData.notes.trim(),
        targetUsers: formData.targetUsers,
        isVip: formData.targetUsers === 'vip',
        signalId: formData.signalId?.trim() || '',
        updatedAt: serverTimestamp(),
        updatedBy: userData?.uid || '',
      };

      await updateDoc(doc(db, 'signals', id as string), signalData);
      
      Alert.alert('Success', 'Signal updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error updating signal:', error);
      Alert.alert('Error', 'Failed to update signal. Please try again.');
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

  if (loadingSignal) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Loading signal...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Edit Signal</Text>
        <Button
          text="Cancel"
          onPress={handleBack}
          variant="outline"
          size="small"
        />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Signal ID (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., SIG-001"
            placeholderTextColor={colors.textSecondary}
            value={formData.signalId}
            onChangeText={(value) => updateFormData('signalId', value)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Currency Pair *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., EUR/USD"
            placeholderTextColor={colors.textSecondary}
            value={formData.pair}
            onChangeText={(value) => updateFormData('pair', value)}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Type *</Text>
          <Picker
            selectedValue={formData.type}
            onValueChange={(value) => updateFormData('type', value)}
            style={styles.picker}
          >
            {SIGNAL_TYPES.map(type => (
              <Picker.Item key={type} label={type} value={type} />
            ))}
          </Picker>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Segment *</Text>
          <Picker
            selectedValue={formData.segment}
            onValueChange={(value) => updateFormData('segment', value)}
            style={styles.picker}
          >
            {SEGMENTS.map(segment => (
              <Picker.Item key={segment} label={segment} value={segment} />
            ))}
          </Picker>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Status *</Text>
          <Picker
            selectedValue={formData.status}
            onValueChange={(value) => updateFormData('status', value)}
            style={styles.picker}
          >
            {STATUS_OPTIONS.map(status => (
              <Picker.Item key={status} label={status.toUpperCase()} value={status} />
            ))}
          </Picker>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Target Users *</Text>
          <Picker
            selectedValue={formData.targetUsers}
            onValueChange={(value) => updateFormData('targetUsers', value)}
            style={styles.picker}
          >
            {USER_TYPES.map(type => (
              <Picker.Item key={type.value} label={type.label} value={type.value} />
            ))}
          </Picker>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Entry Point *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 1.2345"
            placeholderTextColor={colors.textSecondary}
            value={formData.entryPoint}
            onChangeText={(value) => updateFormData('entryPoint', value)}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Stop Loss *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 1.2300"
            placeholderTextColor={colors.textSecondary}
            value={formData.stopLoss}
            onChangeText={(value) => updateFormData('stopLoss', value)}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Take Profit *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 1.2400"
            placeholderTextColor={colors.textSecondary}
            value={formData.takeProfit}
            onChangeText={(value) => updateFormData('takeProfit', value)}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Additional notes about this signal..."
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
            loading={loading}
            disabled={loading}
            size="large"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
