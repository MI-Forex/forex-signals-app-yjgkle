import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Linking } from 'react-native';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';

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
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
});

export default function VIPScreen() {
  const { userData } = useAuth();

  const handleUpgradeToVIP = () => {
    // Open WhatsApp or Telegram to chat with admin
    const message = encodeURIComponent('Hi, I would like to upgrade to VIP membership. Please provide me with the payment details.');
    const whatsappUrl = `https://wa.me/1234567890?text=${message}`;
    
    Alert.alert(
      'Contact Admin',
      'You will be redirected to chat with our admin for VIP upgrade.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Chat Now',
          onPress: () => {
            Linking.openURL(whatsappUrl).catch(() => {
              Alert.alert('Error', 'Unable to open WhatsApp. Please contact admin directly.');
            });
          },
        },
      ]
    );
  };

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>VIP Membership</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Unlock premium trading signals and exclusive features with our VIP membership.
          Get access to high-accuracy signals and direct support from our trading experts.
        </Text>

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
          <View style={styles.feature}>
            <Text style={styles.featureText}>✓ Direct chat with admin</Text>
          </View>

          <Text style={styles.price}>$99/month</Text>

          <Button
            text="Upgrade to VIP"
            onPress={handleUpgradeToVIP}
            variant="primary"
          />
        </View>

        {userData?.role === 'admin' && (
          <View style={[styles.vipCard, { borderColor: colors.success }]}>
            <Text style={[styles.vipTitle, { color: colors.success }]}>👑 Admin Panel</Text>
            <Text style={styles.description}>
              As an admin, you can manage VIP memberships and pricing from the admin panel.
            </Text>
            <Button
              text="Manage VIP Settings"
              onPress={() => {
                Alert.alert('Admin Feature', 'VIP management features will be available in the admin panel.');
              }}
              variant="success"
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}