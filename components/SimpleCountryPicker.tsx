
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../styles/commonStyles';

interface Country {
  code: string;
  name: string;
  callingCode: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', callingCode: '1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', callingCode: '44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', callingCode: '1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', callingCode: '61', flag: '🇦🇺' },
  { code: 'IN', name: 'India', callingCode: '91', flag: '🇮🇳' },
  { code: 'PK', name: 'Pakistan', callingCode: '92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', callingCode: '880', flag: '🇧🇩' },
  { code: 'NG', name: 'Nigeria', callingCode: '234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', callingCode: '254', flag: '🇰🇪' },
  { code: 'ZA', name: 'South Africa', callingCode: '27', flag: '🇿🇦' },
  { code: 'AE', name: 'United Arab Emirates', callingCode: '971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', callingCode: '966', flag: '🇸🇦' },
  { code: 'EG', name: 'Egypt', callingCode: '20', flag: '🇪🇬' },
  { code: 'DE', name: 'Germany', callingCode: '49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', callingCode: '33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', callingCode: '39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', callingCode: '34', flag: '🇪🇸' },
  { code: 'BR', name: 'Brazil', callingCode: '55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', callingCode: '52', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', callingCode: '54', flag: '🇦🇷' },
  { code: 'CN', name: 'China', callingCode: '86', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', callingCode: '81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', callingCode: '82', flag: '🇰🇷' },
  { code: 'SG', name: 'Singapore', callingCode: '65', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', callingCode: '60', flag: '🇲🇾' },
  { code: 'TH', name: 'Thailand', callingCode: '66', flag: '🇹🇭' },
  { code: 'PH', name: 'Philippines', callingCode: '63', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia', callingCode: '62', flag: '🇮🇩' },
  { code: 'VN', name: 'Vietnam', callingCode: '84', flag: '🇻🇳' },
  { code: 'TR', name: 'Turkey', callingCode: '90', flag: '🇹🇷' },
  { code: 'RU', name: 'Russia', callingCode: '7', flag: '🇷🇺' },
  { code: 'PL', name: 'Poland', callingCode: '48', flag: '🇵🇱' },
  { code: 'NL', name: 'Netherlands', callingCode: '31', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', callingCode: '32', flag: '🇧🇪' },
  { code: 'SE', name: 'Sweden', callingCode: '46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', callingCode: '47', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', callingCode: '45', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', callingCode: '358', flag: '🇫🇮' },
  { code: 'CH', name: 'Switzerland', callingCode: '41', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', callingCode: '43', flag: '🇦🇹' },
  { code: 'IE', name: 'Ireland', callingCode: '353', flag: '🇮🇪' },
  { code: 'NZ', name: 'New Zealand', callingCode: '64', flag: '🇳🇿' },
  { code: 'IL', name: 'Israel', callingCode: '972', flag: '🇮🇱' },
  { code: 'GR', name: 'Greece', callingCode: '30', flag: '🇬🇷' },
  { code: 'PT', name: 'Portugal', callingCode: '351', flag: '🇵🇹' },
];

interface SimpleCountryPickerProps {
  selectedCountryCode: string;
  onSelect: (country: Country) => void;
  disabled?: boolean;
}

export default function SimpleCountryPicker({ 
  selectedCountryCode, 
  onSelect,
  disabled = false 
}: SimpleCountryPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedCountry = COUNTRIES.find(c => c.code === selectedCountryCode) || COUNTRIES[0];

  const filteredCountries = COUNTRIES.filter(country => 
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.callingCode.includes(searchQuery) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (country: Country) => {
    onSelect(country);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.trigger}
        onPress={() => setModalVisible(true)}
        disabled={disabled}
      >
        <Text style={styles.flag}>{selectedCountry.flag}</Text>
        <Text style={styles.callingCode}>+{selectedCountry.callingCode}</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select Country</Text>
            <TouchableOpacity 
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search countries..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.countryItem,
                  item.code === selectedCountryCode && styles.selectedCountryItem
                ]}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <View style={styles.countryInfo}>
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.countryCallingCode}>+{item.callingCode}</Text>
                </View>
                {item.code === selectedCountryCode && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  flag: {
    fontSize: 24,
  },
  callingCode: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  modalContainer: {
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.textMuted,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  selectedCountryItem: {
    backgroundColor: colors.primaryLight || colors.surface,
  },
  countryFlag: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  countryCallingCode: {
    fontSize: 14,
    color: colors.textMuted,
  },
  checkmark: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
});
