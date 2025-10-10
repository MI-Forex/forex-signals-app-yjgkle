import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '../styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    margin: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  step: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
  },
  stepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  note: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  noteText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default function TroubleshootingGuide() {
  const [isExpanded, setIsExpanded] = useState(false);

  const troubleshootingSteps = [
    "Clear Metro bundler cache by running 'expo start --clear'",
    "Restart your development server completely",
    "If using Expo Go, try creating a development build instead",
    "Ensure all dependencies are properly installed",
    "Check that your Firebase configuration is correct",
    "For Google Sign-In, ensure you have the correct web client ID",
    "Try restarting your device/emulator",
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.toggleButton}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <Text style={styles.toggleText}>Troubleshooting Guide</Text>
        <Ionicons 
          name={isExpanded ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={colors.primary} 
        />
      </TouchableOpacity>

      {isExpanded && (
        <ScrollView>
          <View style={styles.header}>
            <Ionicons name="help-circle" size={24} color={colors.primary} />
            <Text style={styles.title}>Common Issues & Solutions</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TurboModule Registry Errors</Text>
            {troubleshootingSteps.map((step, index) => (
              <View key={index} style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={styles.note}>
            <Text style={styles.noteText}>
              <Text style={{ fontWeight: 'bold' }}>Note:</Text> Google Sign-In requires native code compilation and won't work in Expo Go. 
              You'll need to create a development build or use EAS Build to test Google authentication.
            </Text>
          </View>

          <View style={styles.note}>
            <Text style={styles.noteText}>
              <Text style={{ fontWeight: 'bold' }}>Alternative:</Text> For testing purposes, you can use email/password authentication 
              which works perfectly in Expo Go.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}