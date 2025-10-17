
import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from './Button';
import { commonStyles, colors, spacing, borderRadius } from '../styles/commonStyles';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: { pair: string; type: string; dateFrom?: Date; dateTo?: Date }) => void;
  currentFilters: { pair: string; type: string; dateFrom?: Date; dateTo?: Date };
}

const SIGNAL_TYPES = [
  { label: 'All Types', value: '' },
  { label: 'BUY', value: 'BUY' },
  { label: 'SELL', value: 'SELL' },
  { label: 'BUY LIMIT', value: 'BUY_LIMIT' },
  { label: 'SELL LIMIT', value: 'SELL_LIMIT' },
  { label: 'BUY STOP', value: 'BUY_STOP' },
  { label: 'SELL STOP', value: 'SELL_STOP' },
  { label: 'BUY STOP LIMIT', value: 'BUY_STOP_LIMIT' },
  { label: 'SELL STOP LIMIT', value: 'SELL_STOP_LIMIT' }
];

export default function FilterModal({ visible, onClose, onApply, currentFilters }: FilterModalProps) {
  const [filters, setFilters] = useState(currentFilters);
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = { pair: '', type: '', dateFrom: undefined, dateTo: undefined };
    setFilters(resetFilters);
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Select Date';
    return date.toLocaleDateString();
  };

  const onDateFromChange = (event: any, selectedDate?: Date) => {
    setShowDateFromPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFilters(prev => ({ ...prev, dateFrom: selectedDate }));
    }
  };

  const onDateToChange = (event: any, selectedDate?: Date) => {
    setShowDateToPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFilters(prev => ({ ...prev, dateTo: selectedDate }));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>Filter Signals</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButtonContainer}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Currency Pair</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter currency pair (e.g., EUR/USD)"
              placeholderTextColor={colors.textSecondary}
              value={filters.pair}
              onChangeText={(value) => setFilters(prev => ({ ...prev, pair: value }))}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <Text style={styles.helperText}>
              Leave empty to show all pairs
            </Text>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Signal Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                style={styles.picker}
                dropdownIconColor={colors.text}
                itemStyle={styles.pickerItem}
              >
                {SIGNAL_TYPES.map(type => (
                  <Picker.Item 
                    key={type.value} 
                    label={type.label} 
                    value={type.value}
                    color={colors.text}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Date Range</Text>
            <View style={styles.dateContainer}>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDateFromPicker(true)}
              >
                <Text style={styles.dateButtonText}>From: {formatDate(filters.dateFrom)}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDateToPicker(true)}
              >
                <Text style={styles.dateButtonText}>To: {formatDate(filters.dateTo)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              text="Reset"
              onPress={handleReset}
              variant="outline"
              style={styles.resetButton}
              textStyle={styles.resetButtonText}
            />
            <Button
              text="Apply"
              onPress={handleApply}
              style={styles.applyButton}
            />
          </View>
        </View>
      </View>

      {showDateFromPicker && (
        <DateTimePicker
          value={filters.dateFrom || new Date()}
          mode="date"
          display="default"
          onChange={onDateFromChange}
        />
      )}

      {showDateToPicker && (
        <DateTimePicker
          value={filters.dateTo || new Date()}
          mode="date"
          display="default"
          onChange={onDateToChange}
        />
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButtonContainer: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
  },
  closeButton: {
    fontSize: 20,
    color: colors.text,
    fontWeight: 'bold',
  },
  filterSection: {
    marginBottom: spacing.lg,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    height: 50,
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  pickerContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  picker: {
    color: colors.text,
    backgroundColor: colors.background,
    height: 50,
  },
  pickerItem: {
    color: colors.text,
    backgroundColor: colors.background,
    fontSize: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateButton: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
  },
  dateButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resetButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  resetButtonText: {
    color: colors.text,
  },
  applyButton: {
    flex: 1,
  },
});
