import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { commonStyles, colors, spacing, borderRadius, shadows } from '../../styles/commonStyles';
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

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadows.sm,
  },
  headerGradient: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  content: {
    padding: spacing.lg,
  },
  vipCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    ...shadows.xl,
    overflow: 'hidden',
  },
  vipCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    opacity: 0.1,
  },
  vipTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  featureIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
    fontWeight: '500',
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginVertical: spacing.xl,
    letterSpacing: -1,
  },
  priceContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.primaryLight + '20',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  upgradeButton: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 16,
    marginTop: spacing.md,
  },
  glassmorphism: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    ...shadows.xl,
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: -width,
    width: width,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
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
    // Redirect admin and editor users away from VIP page
    if (userData?.isAdmin || userData?.role === 'admin' || userData?.isEditor || userData?.role === 'editor') {
      console.log('Admin/Editor user accessing VIP page, redirecting to signals');
      router.replace('/(tabs)/signals');
      return;
    }
    
    loadVIPSettings();
  }, [userData]);

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
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.headerGradient}
        >
          <Text style={styles.title}>VIP Membership</Text>
        </LinearGradient>
        
        <View style={styles.loadingContainer}>
          <Ionicons name="diamond-outline" size={48} color={colors.primary} />
          <Text style={styles.loadingText}>Loading VIP information...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.headerGradient}
      >
        <Text style={styles.title}>VIP Membership</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Unlock premium trading signals and exclusive features with our VIP membership.
          Get access to high-accuracy signals and direct support from our trading experts.
        </Text>

        <View style={[styles.vipCard, styles.glassmorphism]}>
          <LinearGradient
            colors={[colors.primary + '10', colors.primaryLight + '10']}
            style={styles.vipCardGradient}
          />
          
          <Text style={styles.vipTitle}>💎 VIP Premium Signals</Text>
          
          {vipSettings.features.map((feature, index) => (
            <View key={index} style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name="checkmark" size={14} color={colors.white} />
              </View>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}

          <View style={styles.priceContainer}>
            <Text style={styles.price}>${vipSettings.monthlyPrice}/month</Text>
          </View>

          <Button
            text="Upgrade to VIP ✨"
            onPress={handleUpgradeToVIP}
            variant="primary"
            style={styles.upgradeButton}
            size="large"
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