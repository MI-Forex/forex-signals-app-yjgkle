import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';
import Button from '../../components/Button';
import ChatModal from '../../components/ChatModal';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface VIPSettings {
  monthlyPrice: number;
  features: string[];
}

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
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
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
    paddingVertical: spacing.xs,
  },
  featureText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  upgradeButton: {
    marginTop: spacing.md,
  },
  loadingText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 16,
  },
  adminMessage: {
    backgroundColor: colors.primary + '15',
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  adminMessageText: {
    fontSize: 16,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default function VIPScreen() {
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [vipSettings, setVipSettings] = useState<VIPSettings>({
    monthlyPrice: 99,
    features: [
      'Exclusive high-accuracy signals',
      'Priority customer support',
      'Advanced market analysis',
      'Real-time notifications',
      'Weekly market reports',
      '1-on-1 trading consultation',
      'Direct chat with admin'
    ]
  });
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();

  useEffect(() => {
    loadVIPSettings();
  }, []);

  const loadVIPSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'vip'));
      if (settingsDoc.exists()) {
        const settings = settingsDoc.data() as VIPSettings;
        setVipSettings(settings);
      }
    } catch (error) {
      console.error('Error loading VIP settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToVIP = () => {
    setChatModalVisible(true);
  };

  if (loading) {
    return (
      <View style={commonStyles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>VIP Membership</Text>
        </View>
        <View style={[commonStyles.centerContent, { flex: 1 }]}>
          <Text style={styles.loadingText}>Loading VIP information...</Text>
        </View>
      </View>
    );
  }

  // Don't show VIP membership for admin users
  if (userData?.isAdmin) {
    return (
      <View style={commonStyles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>VIP Membership</Text>
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.adminMessage}>
            <Text style={styles.adminMessageText}>
              🔑 Admin Access
            </Text>
            <Text style={[styles.adminMessageText, { marginTop: spacing.sm, fontSize: 14 }]}>
              As an admin, you already have full access to all features and premium content. VIP membership is not required for admin accounts.
            </Text>
          </View>
          
          <View style={styles.vipCard}>
            <Text style={styles.vipTitle}>🌟 VIP Premium Signals</Text>
            
            {vipSettings.features.map((feature, index) => (
              <View key={index} style={styles.feature}>
                <Text style={styles.featureText}>✓ {feature}</Text>
              </View>
            ))}

            <Text style={styles.price}>${vipSettings.monthlyPrice}/month</Text>
            
            <Text style={[styles.description, { fontSize: 14, color: colors.textMuted }]}>
              This pricing is displayed to regular users who want to upgrade to VIP membership.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

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
          
          {vipSettings.features.map((feature, index) => (
            <View key={index} style={styles.feature}>
              <Text style={styles.featureText}>✓ {feature}</Text>
            </View>
          ))}

          <Text style={styles.price}>${vipSettings.monthlyPrice}/month</Text>

          <Button
            text="Upgrade to VIP"
            onPress={handleUpgradeToVIP}
            variant="primary"
            style={styles.upgradeButton}
          />
        </View>
      </ScrollView>

      <ChatModal
        visible={chatModalVisible}
        onClose={() => setChatModalVisible(false)}
      />
    </View>
  );
}