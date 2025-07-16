import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';
import Button from '../../components/Button';

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
  content: {
    padding: spacing.lg,
  },
  vipCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  vipTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  comingSoon: {
    backgroundColor: colors.warning + '20',
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  comingSoonText: {
    fontSize: 16,
    color: colors.warning,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default function VIPScreen() {
  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>VIP Membership</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.vipCard}>
          <Text style={styles.vipTitle}>🌟 VIP Premium Signals</Text>
          
          <View style={styles.feature}>
            <Text style={styles.featureText}>✓ Exclusive high-accuracy signals</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureText}>✓ Priority customer support</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureText}>✓ Advanced market analysis</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureText}>✓ Real-time notifications</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureText}>✓ Weekly market reports</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureText}>✓ 1-on-1 trading consultation</Text>
          </View>

          <Text style={styles.price}>$99/month</Text>

          <Button
            text="Upgrade to VIP"
            onPress={() => {}}
            variant="primary"
            disabled={true}
          />
        </View>

        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>
            VIP membership features are coming soon! 
            Stay tuned for premium trading signals and exclusive content.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}