<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { commonStyles, colors, spacing, borderRadius } from '../../../../styles/commonStyles';
import { db } from '../../../../firebase/config';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import Button from '../../../../components/Button';
import { useAuth } from '../../../../contexts/AuthContext';
import { Picker } from '@react-native-picker/picker';
=======

import { db } from '../../../../firebase/config';
import { commonStyles, colors, spacing, borderRadius } from '../../../../styles/commonStyles';
import { doc, getDoc, updateDoc, serverTimestamp } from '@firebase/firestore';
import { router, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import Button from '../../../../components/Button';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { View, Text, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62

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

<<<<<<< HEAD
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

=======
const SIGNAL_TYPES = ['BUY', 'SELL'];
const SEGMENTS = ['GOLD', 'FOREX', 'CRYPTO', 'INDICES'];
const STATUS_OPTIONS = ['active', 'closed', 'hit_tp', 'hit_sl', 'inprogress', 'pending'];
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
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
<<<<<<< HEAD
    padding: spacing.md,
=======
    padding: spacing.lg,
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
<<<<<<< HEAD
    fontSize: 20,
=======
    fontSize: 24,
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
    fontWeight: 'bold',
    color: colors.text,
  },
  scrollContainer: {
    flexGrow: 1,
<<<<<<< HEAD
    padding: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.md,
=======
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  inputContainer: {
    marginBottom: spacing.lg,
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
<<<<<<< HEAD
    borderRadius: borderRadius.md,
=======
    borderRadius: borderRadius.lg,
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
<<<<<<< HEAD
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 100,
    textAlignVertical: 'top',
  },
<<<<<<< HEAD
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
=======
  buttonContainer: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
});

export default function EditSignalScreen() {
  const { id } = useLocalSearchParams();
  const [formData, setFormData] = useState<SignalData>({
    pair: '',
    type: 'BUY',
<<<<<<< HEAD
    segment: 'forex',
=======
    segment: 'GOLD',
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
    status: 'active',
    entryPoint: '',
    stopLoss: '',
    takeProfit: '',
    notes: '',
    targetUsers: 'normal',
<<<<<<< HEAD
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { userData } = useAuth();

  const loadSignal = useCallback(async () => {
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
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      console.error('Error loading signal:', error);
      Alert.alert('Error', 'Failed to load signal');
      router.back();
    } finally {
<<<<<<< HEAD
      setInitialLoading(false);
=======
      setLoadingSignal(false);
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
    }
  }, [id]);

  useEffect(() => {
<<<<<<< HEAD
    if (id) {
      loadSignal();
    }
  }, [id, loadSignal]);
=======
    // Check if user has permission to edit signals
    if (!userData?.isAdmin && userData?.role !== 'admin' && !userData?.isEditor && userData?.role !== 'editor') {
      Alert.alert('Access Denied', 'You do not have permission to edit signals');
      router.back();
      return;
    }

    loadSignal();
  }, [userData, loadSignal]);
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62

  const validateForm = () => {
    if (!formData.pair.trim()) {
      Alert.alert('Error', 'Please enter a currency pair');
      return false;
    }
<<<<<<< HEAD
    if (!formData.entryPoint || isNaN(Number(formData.entryPoint))) {
      Alert.alert('Error', 'Please enter a valid entry point');
      return false;
    }
    if (!formData.stopLoss || isNaN(Number(formData.stopLoss))) {
      Alert.alert('Error', 'Please enter a valid stop loss');
      return false;
    }
    if (!formData.takeProfit || isNaN(Number(formData.takeProfit))) {
=======
    if (!formData.entryPoint || isNaN(parseFloat(formData.entryPoint))) {
      Alert.alert('Error', 'Please enter a valid entry point');
      return false;
    }
    if (!formData.stopLoss || isNaN(parseFloat(formData.stopLoss))) {
      Alert.alert('Error', 'Please enter a valid stop loss');
      return false;
    }
    if (!formData.takeProfit || isNaN(parseFloat(formData.takeProfit))) {
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      Alert.alert('Error', 'Please enter a valid take profit');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
<<<<<<< HEAD
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
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      
      Alert.alert('Success', 'Signal updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error updating signal:', error);
<<<<<<< HEAD
      
      // Generic error messages for security
      let errorMessage = 'Failed to update signal';
      if (error.message.includes('network')) {
        errorMessage = 'Please check internet connectivity';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Please check your credentials';
      }
      
      Alert.alert('Error', `${errorMessage}. Please try again.`);
=======
      Alert.alert('Error', 'Failed to update signal. Please try again.');
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
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

<<<<<<< HEAD
  if (initialLoading) {
    return (
      <View style={[commonStyles.container, commonStyles.centerContent]}>
        <Text style={commonStyles.text}>Loading signal...</Text>
=======
  if (loadingSignal) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Loading signal...</Text>
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
<<<<<<< HEAD
    >
      <View style={styles.header}>
        <Button text="← Back" onPress={handleBack} variant="outline" />
        <Text style={styles.title}>Edit Signal</Text>
        <View style={{ width: 60 }} />
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
<<<<<<< HEAD
      >
        {formData.signalId && (
          <View style={styles.signalIdContainer}>
            <Text style={styles.signalIdText}>Signal ID: #{formData.signalId}</Text>
          </View>
        )}
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Currency Pair *</Text>
          <TextInput
            style={styles.input}
<<<<<<< HEAD
            placeholder="e.g., EUR/USD, GBP/JPY"
=======
            placeholder="e.g., EUR/USD"
            placeholderTextColor={colors.textSecondary}
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
            value={formData.pair}
            onChangeText={(value) => updateFormData('pair', value)}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputContainer}>
<<<<<<< HEAD
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
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Segment *</Text>
<<<<<<< HEAD
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
=======
          <Picker
            selectedValue={formData.segment}
            onValueChange={(value) => updateFormData('segment', value)}
            style={styles.picker}
          >
            {SEGMENTS.map(segment => (
              <Picker.Item key={segment} label={segment} value={segment} />
            ))}
          </Picker>
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Status *</Text>
<<<<<<< HEAD
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
=======
          <Picker
            selectedValue={formData.status}
            onValueChange={(value) => updateFormData('status', value)}
            style={styles.picker}
          >
            {STATUS_OPTIONS.map(status => (
              <Picker.Item key={status} label={status.toUpperCase()} value={status} />
            ))}
          </Picker>
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Target Users *</Text>
<<<<<<< HEAD
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
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Take Profit *</Text>
          <TextInput
            style={styles.input}
<<<<<<< HEAD
            placeholder="0.0000"
=======
            placeholder="e.g., 1.2400"
            placeholderTextColor={colors.textSecondary}
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
            value={formData.takeProfit}
            onChangeText={(value) => updateFormData('takeProfit', value)}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputContainer}>
<<<<<<< HEAD
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Add any additional notes..."
=======
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Additional notes about this signal..."
            placeholderTextColor={colors.textSecondary}
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
            value={formData.notes}
            onChangeText={(value) => updateFormData('notes', value)}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
<<<<<<< HEAD
            text={loading ? "Updating..." : "Update Signal"}
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
=======
            text="Update Signal"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            size="large"
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
