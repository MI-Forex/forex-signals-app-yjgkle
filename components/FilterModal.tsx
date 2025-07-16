import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Button from './Button';
import { commonStyles, colors, spacing, borderRadius } from '../styles/commonStyles';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: { pair: string; type: string; status: string }) => void;
  currentFilters: { pair: string; type: string; status: string };
}

const CURRENCY_PAIRS = [
  '', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD',
  'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'CHF/JPY', 'EUR/CHF', 'AUD/JPY', 'GBP/CHF'
];

const SIGNAL_TYPES = ['', 'BUY', 'SELL'];
const SIGNAL_STATUSES = ['', 'active', 'closed', 'hit_tp', 'hit_sl'];

export default function FilterModal({ visible, onClose, onApply, currentFilters }: FilterModalProps) {
  const [filters, setFilters] = useState(currentFilters);

  const handleApply = () => {
    onApply(filters);
  };

  const handleReset = () => {
    const resetFilters = { pair: '', type: '', status: '' };
    setFilters(resetFilters);
    onApply(resetFilters);
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
          <View style={commonStyles.spaceBetween}>
            <Text style={styles.modalTitle}>Filter Signals</Text>
            <TouchableOpacity onPress={onClose}>
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
            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                style={styles.picker}
                dropdownIconColor={colors.text}
              >
                {SIGNAL_STATUSES.map(status => (
                  <Picker.Item 
                    key={status} 
                    label={status || 'All Statuses'} 
                    value={status}
                    color={colors.text}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              text="Reset"
              onPress={handleReset}
              variant="outline"
              style={{ flex: 1, marginRight: spacing.sm }}
            />
            <Button
              text="Apply"
              onPress={handleApply}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    fontSize: 24,
    color: colors.textMuted,
    padding: spacing.xs,
  },
  filterSection: {
    marginTop: spacing.lg,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
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
  buttonContainer: {
    flexDirection: 'row',
    marginTop: spacing.xl,
  },
});