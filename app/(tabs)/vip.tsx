
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, Linking, Alert, RefreshControl } from 'react-native';
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
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  vipCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  vipTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
  },
  priceSubtext: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  featuresContainer: {
    marginBottom: spacing.lg,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  featureText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  upgradeButton: {
    marginTop: spacing.md,
  },
  currentVipContainer: {
    backgroundColor: colors.success,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  currentVipText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.sm,
  },
  currentVipSubtext: {
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  signalsButton: {
    marginTop: spacing.lg,
  },
  connectivityError: {
    backgroundColor: colors.danger,
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: spacing.sm,
    alignItems: 'center',
  },
  connectivityErrorText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default function VIPScreen() {
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
        setTimeout(() => reject(new Error('WhatsApp settings timeout')), 5000);
      });

      const supabasePromise = supabase
        .from('settings')
        .select('value')
        .eq('id', 'whatsapp_link')
        .single();

      const { data, error } = await Promise.race([supabasePromise, timeoutPromise]) as any;

      if (error) {
        console.log('VIP: Error loading WhatsApp settings:', error.message);
        // Use default settings
        return;
      }

      if (data?.value) {
        const settings = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        setWhatsAppSettings(settings);
        console.log('VIP: WhatsApp settings loaded successfully');
      }
    } catch (error) {
      console.log('VIP: Error loading WhatsApp settings:', error);
      // Continue with default settings
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
      await Promise.all([
        loadVIPSettings(),
        loadWhatsAppSettings()
      ]);
    } catch (error) {
      console.error('VIP: Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpgradeToVIP = async () => {
    try {
      console.log('VIP: Attempting to open WhatsApp:', whatsAppSettings.url);
      
      if (whatsAppSettings.enabled && whatsAppSettings.url) {
        const supported = await Linking.canOpenURL(whatsAppSettings.url);
        if (supported) {
          await Linking.openURL(whatsAppSettings.url);
        } else {
          Alert.alert('Error', 'Unable to open WhatsApp. Please contact support.');
        }
      } else {
        Alert.alert('Error', 'Contact information not available. Please try again later.');
      }
    } catch (error) {
      console.error('VIP: Error opening WhatsApp:', error);
      Alert.alert('Error', 'Unable to open WhatsApp. Please contact support.');
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
        </View>
        <View style={commonStyles.loading}>
          <Text style={commonStyles.text}>Loading VIP information...</Text>
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
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.vipCard}
          >
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
              text="Upgrade to VIP"
              onPress={handleUpgradeToVIP}
              variant="secondary"
              style={styles.upgradeButton}
            />
          </LinearGradient>
        )}

        <Button
          text="View All Signals"
          onPress={handleGoToSignals}
          variant="primary"
          style={styles.signalsButton}
        />
      </ScrollView>
    </View>
  );
}
