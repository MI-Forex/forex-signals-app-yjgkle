
import { useAuth } from '../../contexts/AuthContext';
import { checkInternetConnectivity } from '../../utils/networkUtils';
import { supabase } from '../../utils/supabaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { View, Text, ScrollView, StyleSheet, Dimensions, Linking, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../../components/Button';
import { router } from 'expo-router';
import { commonStyles, colors, spacing, borderRadius, shadows } from '../../styles/commonStyles';
import { logScreenView, logVIPUpgradeAttempt, logEvent, ANALYTICS_EVENTS } from '../../utils/analyticsUtils';

interface VIPSettings {
  monthlyPrice: number;
  features: string[];
}

interface WhatsAppSettings {
  url: string;
  enabled: boolean;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  premiumCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  premiumBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  premiumBadgeText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  price: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
  },
  priceSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  featuresContainer: {
    marginBottom: spacing.lg,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  featureIcon: {
    marginRight: spacing.md,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    fontWeight: '500',
  },
  upgradeButton: {
    marginTop: spacing.md,
  },
  currentPlanCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.success,
  },
  currentPlanTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.success,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  currentPlanText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  signalsButton: {
    marginTop: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
});

function VIPScreenContent() {
  const [vipSettings, setVipSettings] = useState<VIPSettings | null>(null);
  const [whatsAppSettings, setWhatsAppSettings] = useState<WhatsAppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectivityError, setConnectivityError] = useState<string | null>(null);
  const { userData, user } = useAuth();

  const isAdminOrEditor = userData?.isAdmin || userData?.isEditor;

  useEffect(() => {
    logScreenView('VIP Screen');
    loadVIPSettings();
    loadWhatsAppSettings();
  }, [userData, isAdminOrEditor]);

  const loadVIPSettings = async () => {
    try {
      const isConnected = await checkInternetConnectivity();
      if (!isConnected) {
        setConnectivityError('No internet connection. Please check your network and try again.');
        return;
      }

      const vipDoc = await getDoc(doc(db, 'settings', 'vip'));
      if (vipDoc.exists()) {
        setVipSettings(vipDoc.data() as VIPSettings);
      } else {
        setVipSettings({
          monthlyPrice: 50,
          features: [
            'Premium forex signals with higher accuracy',
            'Priority customer support',
            'Advanced market analysis',
            'Exclusive trading strategies',
            'Real-time notifications',
            'Access to VIP-only content'
          ]
        });
      }
    } catch (error) {
      console.error('Error loading VIP settings:', error);
      await logEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
        error_message: 'VIP settings load error',
        context: 'VIP Screen'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWhatsAppSettings = async () => {
    try {
      const whatsAppDoc = await getDoc(doc(db, 'settings', 'whatsapp'));
      if (whatsAppDoc.exists()) {
        setWhatsAppSettings(whatsAppDoc.data() as WhatsAppSettings);
      }
    } catch (error) {
      console.error('Error loading WhatsApp settings:', error);
      await logEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
        error_message: 'WhatsApp settings load error',
        context: 'VIP Screen'
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setConnectivityError(null);
    await loadVIPSettings();
    await loadWhatsAppSettings();
    setRefreshing(false);
  };

  const handleUpgradeToVIP = async () => {
    try {
      await logVIPUpgradeAttempt('vip_screen');
      
      if (!whatsAppSettings?.url || !whatsAppSettings?.enabled) {
        Alert.alert('Error', 'WhatsApp upgrade link is not available. Please contact support.');
        return;
      }

      await logEvent(ANALYTICS_EVENTS.VIP_WHATSAPP_OPEN, {
        source: 'vip_screen'
      });

      // Open WhatsApp directly without showing notification
      await Linking.openURL(whatsAppSettings.url);
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      await logEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
        error_message: 'WhatsApp open error',
        context: 'VIP Screen'
      });
      Alert.alert('Error', 'Unable to open WhatsApp. Please contact support.');
    }
  };

  const handleGoToSignals = () => {
    router.push('/(tabs)/signals');
  };

  const dismissConnectivityError = () => {
    setConnectivityError(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.text, { marginTop: spacing.md }]}>Loading VIP information...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {connectivityError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{connectivityError}</Text>
          <Button
            title="Dismiss"
            onPress={dismissConnectivityError}
            variant="secondary"
            style={{ marginTop: spacing.sm }}
          />
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>VIP Membership</Text>
        <Text style={styles.subtitle}>
          Unlock premium features and get access to exclusive forex signals
        </Text>
      </View>

      {userData?.isVIP ? (
        <View style={styles.currentPlanCard}>
          <Text style={styles.currentPlanTitle}>✨ VIP Member ✨</Text>
          <Text style={styles.currentPlanText}>
            You have access to all premium features and VIP signals.
          </Text>
          <Button
            title="View VIP Signals"
            onPress={handleGoToSignals}
            style={styles.signalsButton}
          />
        </View>
      ) : (
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.premiumCard}
        >
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>Premium Plan</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>${vipSettings?.monthlyPrice || 50}</Text>
            <Text style={styles.priceSubtext}>per month</Text>
          </View>

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>Premium Features</Text>
            {vipSettings?.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={24} 
                  color={colors.accent} 
                  style={styles.featureIcon}
                />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <Button
            title="Upgrade to VIP"
            onPress={handleUpgradeToVIP}
            variant="accent"
            style={styles.upgradeButton}
          />
        </LinearGradient>
      )}
    </ScrollView>
  );
}

export default function VIPScreen() {
  return <VIPScreenContent />;
}
