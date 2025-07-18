import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform } from 'react-native';
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

const CURRENCY_PAIRS = [
  '', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD',
  'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'CHF/JPY', 'EUR/CHF', 'AUD/JPY', 'GBP/CHF'
];

const SIGNAL_TYPES = ['', 'BUY', 'SELL'];

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
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.pair}
                onValueChange={(value) => setFilters(prev => ({ ...prev, pair: value }))}
                style={styles.picker}
                dropdownIconColor={colors.text}
              >
                {CURRENCY_PAIRS.map(pair => (
                  <Picker.Item 
                    key={pair} 
                    label={pair || 'All Pairs'} 
                    value={pair}
                    color={colors.text}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Signal Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                style={styles.picker}
                dropdownIconColor={colors.text}
              >
                {SIGNAL_TYPES.map(type => (
                  <Picker.Item 
                    key={type} 
                    label={type || 'All Types'} 
                    value={type}
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
    color: colors.textMuted,
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
  pickerContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  picker: {
    color: colors.text,
    backgroundColor: 'transparent',
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
  applyButton: {
    flex: 1,
  },
});