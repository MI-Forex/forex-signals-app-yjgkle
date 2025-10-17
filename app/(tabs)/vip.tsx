
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, Linking, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebase/config';
import { supabase } from '../../utils/supabaseConfig';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc } from 'firebase/firestore';
import { commonStyles, colors, spacing, borderRadius, shadows } from '../../styles/commonStyles';
import { checkInternetConnectivity } from '../../utils/networkUtils';

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
  header: {
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    ...shadows.sm,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  vipCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  vipTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    letterSpacing: -0.25,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingVertical: spacing.md,
  },
  price: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -1,
  },
  priceSubtext: {
    fontSize: 18,
    color: colors.textMuted,
    marginTop: spacing.sm,
    fontWeight: '500',
  },
  featuresContainer: {
    marginBottom: spacing.xl,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  featureText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.md,
    flex: 1,
    lineHeight: 24,
    fontWeight: '500',
  },
  upgradeButton: {
    marginTop: spacing.lg,
    ...shadows.md,
  },
  currentVipContainer: {
    backgroundColor: colors.success,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
    ...shadows.lg,
  },
  currentVipText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  currentVipSubtext: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.95,
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  signalsButton: {
    marginTop: spacing.xl,
    ...shadows.md,
  },
  connectivityError: {
    backgroundColor: colors.danger,
    padding: spacing.lg,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  connectivityErrorText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
});

function VIPScreenContent() {
  const { userData } = useAuth();
  const [vipSettings, setVipSettings] = useState<VIPSettings>({
    monthlyPrice: 99,
    features: [
      'Premium forex signals',
      'Real-time market analysis',
      'Priority customer support',
      'Advanced trading strategies',
      'Risk management guidance'
    ]
  });
  const [whatsAppSettings, setWhatsAppSettings] = useState<WhatsAppSettings>({
    url: 'https://wa.me/+919343601863',
    enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showConnectivityError, setShowConnectivityError] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  // Check if user is admin or editor
  const isAdminOrEditor = userData?.isAdmin || userData?.isEditor;

  useEffect(() => {
    loadVIPSettings();
    loadWhatsAppSettings();
  }, [userData, isAdminOrEditor]);

  const loadVIPSettings = async () => {
    try {
      console.log('VIP: Loading VIP settings from Firebase');
      const settingsDoc = await getDoc(doc(db, 'settings', 'vip'));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setVipSettings({
          monthlyPrice: data.monthlyPrice || 99,
          features: data.features || vipSettings.features
        });
        console.log('VIP: Settings loaded successfully');
      } else {
        console.log('VIP: No settings found, using defaults');
      }
    } catch (error) {
      console.error('VIP: Error loading VIP settings:', error);
      // Continue with default settings
    } finally {
      setLoading(false);
    }
  };

  const loadWhatsAppSettings = async () => {
    try {
      console.log('VIP: Loading WhatsApp settings from Supabase');
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('WhatsApp settings timeout')), 8000);
      });

      const supabasePromise = supabase
        .from('settings')
        .select('value')
        .eq('id', 'whatsapp_link')
        .single();

      const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;

      if (error) {
        console.log('VIP: Error loading WhatsApp settings:', error.message);
        // Use default settings if loading fails
        setWhatsAppSettings({
          url: 'https://wa.me/+919343601863',
          enabled: true
        });
        return;
      }

      if (data?.value) {
        const settings = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        setWhatsAppSettings({
          url: settings.url || 'https://wa.me/+919343601863',
          enabled: settings.enabled !== false
        });
        console.log('VIP: WhatsApp settings loaded successfully:', settings);
      } else {
        console.log('VIP: No WhatsApp settings found, using defaults');
        setWhatsAppSettings({
          url: 'https://wa.me/+919343601863',
          enabled: true
        });
      }
    } catch (error) {
      console.log('VIP: Error loading WhatsApp settings:', error);
      // Continue with default settings
      setWhatsAppSettings({
        url: 'https://wa.me/+919343601863',
        enabled: true
      });
    }
  };

  const handleRefresh = async () => {
    console.log('VIP: Pull to refresh triggered');
    
    // Check internet connectivity first
    try {
      const isConnected = await checkInternetConnectivity();
      if (!isConnected) {
        console.log('VIP: No internet connectivity detected');
        setShowConnectivityError(true);
        Alert.alert('No Internet Connection', 'Please check your internet connectivity.');
        return;
      }
    } catch (error) {
      console.error('VIP: Error checking connectivity:', error);
      // Continue with refresh even if connectivity check fails
    }

    setRefreshing(true);
    setShowConnectivityError(false);
    
    try {
      // Add timeout to prevent infinite refresh
      const refreshTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Refresh timeout')), 15000);
      });

      const refreshPromise = Promise.all([
        loadVIPSettings(),
        loadWhatsAppSettings()
      ]);

      await Promise.race([refreshPromise, refreshTimeout]);
      console.log('VIP: Refresh completed successfully');
    } catch (error) {
      console.error('VIP: Error refreshing data:', error);
      if (error.message === 'Refresh timeout') {
        Alert.alert('Timeout', 'Refresh took too long. Please try again.');
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpgradeToVIP = async () => {
    if (upgradeLoading) return;
    
    setUpgradeLoading(true);
    
    try {
      console.log('VIP: Attempting to open WhatsApp:', whatsAppSettings.url);
      
      if (!whatsAppSettings.enabled) {
        Alert.alert('Service Unavailable', 'WhatsApp support is currently disabled. Please try again later.');
        return;
      }

      if (!whatsAppSettings.url || !whatsAppSettings.url.trim()) {
        Alert.alert('Error', 'Contact information not available. Please try again later.');
        return;
      }

      const url = whatsAppSettings.url.trim();
      
      // Validate URL format
      if (!url.startsWith('https://wa.me/') && !url.startsWith('https://api.whatsapp.com/')) {
        console.error('VIP: Invalid WhatsApp URL format:', url);
        Alert.alert('Configuration Error', 'Contact link is not properly configured. Please contact support.');
        return;
      }

      console.log('VIP: Checking if URL can be opened:', url);
      
      // Add timeout for URL checking
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('URL check timeout')), 3000);
      });

      const canOpenPromise = Linking.canOpenURL(url);
      const supported = await Promise.race([canOpenPromise, timeoutPromise]) as boolean;
      
      if (supported) {
        console.log('VIP: Opening WhatsApp URL');
        await Linking.openURL(url);
      } else {
        console.error('VIP: URL not supported by device');
        Alert.alert(
          'Unable to Open WhatsApp', 
          'Please make sure WhatsApp is installed on your device, or contact support directly at +919343601863.'
        );
      }
    } catch (error) {
      console.error('VIP: Error opening WhatsApp:', error);
      const errorMessage = error instanceof Error && error.message === 'URL check timeout' 
        ? 'Request timed out. Please try again.'
        : 'Unable to open WhatsApp. Please contact support.';
      Alert.alert('Error', errorMessage);
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleGoToSignals = () => {
    router.push('/(tabs)/signals');
  };

  const dismissConnectivityError = () => {
    setShowConnectivityError(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>VIP Membership</Text>
          <Text style={styles.subtitle}>Loading premium features...</Text>
        </View>
        <View style={commonStyles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[commonStyles.text, { marginTop: spacing.md }]}>
            Loading VIP information...
          </Text>
        </View>
      </View>
    );
  }

  // Don't show VIP tab for admin or editor
  if (isAdminOrEditor) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin/Editor Access</Text>
          <Text style={styles.subtitle}>You have full access to all features</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.currentVipContainer}>
            <Ionicons name="shield-checkmark" size={48} color={colors.white} />
            <Text style={styles.currentVipText}>Full Access Granted</Text>
            <Text style={styles.currentVipSubtext}>
              As an {userData?.isAdmin ? 'admin' : 'editor'}, you have access to all premium features and management tools.
            </Text>
          </View>
          
          <Button
            text="View All Signals"
            onPress={handleGoToSignals}
            variant="primary"
            style={styles.signalsButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>VIP Membership</Text>
        <Text style={styles.subtitle}>Unlock premium trading signals and analysis</Text>
      </View>

      {/* Connectivity Error Banner */}
      {showConnectivityError && (
        <View style={styles.connectivityError}>
          <Text style={styles.connectivityErrorText}>
            Please check your internet connectivity
          </Text>
          <Button
            text="Dismiss"
            onPress={dismissConnectivityError}
            variant="outline"
            style={{ 
              marginTop: spacing.sm, 
              paddingHorizontal: spacing.md, 
              paddingVertical: spacing.xs,
              borderColor: colors.white,
            }}
            textStyle={{ color: colors.white, fontSize: 12 }}
          />
        </View>
      )}

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            title="Pull to refresh VIP info"
            titleColor={colors.textMuted}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {userData?.isVIP ? (
          <View style={styles.currentVipContainer}>
            <Ionicons name="star" size={48} color={colors.white} />
            <Text style={styles.currentVipText}>VIP Member</Text>
            <Text style={styles.currentVipSubtext}>
              You have access to all premium signals and analysis. Enjoy exclusive trading insights!
            </Text>
          </View>
        ) : (
          <View style={[styles.vipCard, { backgroundColor: colors.primary }]}>
            <Text style={[styles.vipTitle, { color: colors.white }]}>
              Premium VIP Membership
            </Text>
            
            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: colors.white }]}>
                ${vipSettings.monthlyPrice}
              </Text>
              <Text style={[styles.priceSubtext, { color: colors.white, opacity: 0.9 }]}>
                per month
              </Text>
            </View>

            <View style={styles.featuresContainer}>
              <Text style={[styles.featuresTitle, { color: colors.white }]}>
                Premium Features
              </Text>
              {vipSettings.features.map((feature, index) => (
                <View key={index} style={styles.feature}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                  <Text style={[styles.featureText, { color: colors.white }]}>
                    {feature}
                  </Text>
                </View>
              ))}
            </View>

            <Button
              text={upgradeLoading ? "Opening WhatsApp..." : "Upgrade to VIP"}
              onPress={handleUpgradeToVIP}
              variant="secondary"
              style={styles.upgradeButton}
              loading={upgradeLoading}
              disabled={upgradeLoading}
            />
          </View>
        )}

        {/* Removed "View All Signals" button for regular users as requested */}
      </ScrollView>
    </View>
  );
}

export default function VIPScreen() {
  try {
    return <VIPScreenContent />;
  } catch (error) {
    console.error('VIP Screen Error:', error);
    return (
      <View style={[commonStyles.container, commonStyles.centerContent]}>
        <Text style={[commonStyles.text, { textAlign: 'center', marginBottom: spacing.lg }]}>
          Something went wrong loading the VIP screen.
        </Text>
        <Button
          text="Retry"
          onPress={() => {
            // Force re-render by navigating back and forth
            router.replace('/(tabs)/vip');
          }}
          variant="primary"
        />
      </View>
    );
  }
}
