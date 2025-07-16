import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';

const styles = StyleSheet.create({
  header: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  comingSoonSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default function AnalysisScreen() {
  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Market Analysis</Text>
      </View>

      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonText}>Coming Soon</Text>
        <Text style={styles.comingSoonSubtext}>
          Advanced market analysis and insights will be available here soon.
          Stay tuned for detailed technical analysis, market trends, and expert commentary.
        </Text>
      </View>
    </View>
  );
}