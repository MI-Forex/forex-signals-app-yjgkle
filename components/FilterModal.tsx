
import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from './Button';
import { commonStyles, colors, spacing, borderRadius } from '../styles/commonStyles';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: { pair: string; type: string; status: string; segment: string }) => void;
  currentFilters: { pair: string; type: string; status: string; segment: string };
}

const CURRENCY_PAIRS = [
  '', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD',
  'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'CHF/JPY', 'EUR/CHF', 'AUD/JPY', 'GBP/CHF'
];

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

const STATUS_OPTIONS = [
  { label: 'All Status', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Closed', value: 'closed' },
  { label: 'Hit TP', value: 'hit_tp' },
  { label: 'Hit SL', value: 'hit_sl' },
  { label: 'In Progress', value: 'inprogress' },
  { label: 'Pending', value: 'pending' }
];

const SEGMENTS = [
  { label: 'All Segments', value: '' },
  { label: 'Scalping', value: 'scalping' },
  { label: 'Day Trading', value: 'day_trading' },
  { label: 'Swing Trading', value: 'swing_trading' },
  { label: 'Position Trading', value: 'position_trading' }
];

export default function FilterModal({ visible, onClose, onApply, currentFilters }: FilterModalProps) {
  const [filters, setFilters] = useState(currentFilters);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = { pair: '', type: '', status: '', segment: '' };
    setFilters(resetFilters);
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
                itemStyle={styles.pickerItem}
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
            <Text style={styles.filterLabel}>Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                style={styles.picker}
                dropdownIconColor={colors.text}
                itemStyle={styles.pickerItem}
              >
                {STATUS_OPTIONS.map(status => (
                  <Picker.Item 
                    key={status.value} 
                    label={status.label} 
                    value={status.value}
                    color={colors.text}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Segment</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={filters.segment}
                onValueChange={(value) => setFilters(prev => ({ ...prev, segment: value }))}
                style={styles.picker}
                dropdownIconColor={colors.text}
                itemStyle={styles.pickerItem}
              >
                {SEGMENTS.map(segment => (
                  <Picker.Item 
                    key={segment.value} 
                    label={segment.label} 
                    value={segment.value}
                    color={colors.text}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Reset"
              onPress={handleReset}
              variant="outline"
              style={styles.resetButton}
              textStyle={styles.resetButtonText}
            />
            <Button
              title="Apply"
              onPress={handleApply}
              style={styles.applyButton}
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
