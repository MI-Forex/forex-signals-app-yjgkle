import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { router } from 'expo-router';
import Button from '../../components/Button';
import { commonStyles, colors, spacing } from '../../styles/commonStyles';

export default function AdminScreen() {
  const { userData } = useAuth();

  const handleBack = () => {
    router.back();
  };

  const handleManageSignals = () => {
    router.push('/admin/signals');
  };

  const handleManageNews = () => {
    router.push('/admin/news');
  };

  const handleManageAnalysis = () => {
    router.push('/admin/analysis');
  };

  const handleManageUsers = () => {
    router.push('/admin/users');
  };

  const handleManageVIP = () => {
    router.push('/admin/vip');
  };

  const handleManageChats = () => {
    router.push('/admin/chats');
  };

  if (!userData?.isAdmin) {
    return (
      <View style={commonStyles.centerContent}>
        <Text style={commonStyles.text}>Access denied. Admin privileges required.</Text>
        <Button text="Go Back" onPress={handleBack} />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
        <Button
          text="Back"
          onPress={handleBack}
          variant="outline"
          style={styles.backButton}
        />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Management</Text>
          
          <Button
            text="Manage Forex Signals"
            onPress={handleManageSignals}
            style={styles.menuButton}
          />
          
          <Button
            text="Manage Analysis"
            onPress={handleManageAnalysis}
            style={styles.menuButton}
          />
          
          <Button
            text="Manage News Articles"
            onPress={handleManageNews}
            style={styles.menuButton}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Management</Text>
          
          <Button
            text="Manage Users"
            onPress={handleManageUsers}
            style={styles.menuButton}
          />
          
          <Button
            text="VIP Settings & Data Export"
            onPress={handleManageVIP}
            style={styles.menuButton}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Communication</Text>
          
          <Button
            text="User Chats & Support"
            onPress={handleManageChats}
            style={styles.menuButton}
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Admin Panel Features</Text>
          <Text style={styles.infoText}>
            • Create, edit, and delete forex signals
          </Text>
          <Text style={styles.infoText}>
            • Manage market analysis with images
          </Text>
          <Text style={styles.infoText}>
            • Publish and manage news articles
          </Text>
          <Text style={styles.infoText}>
            • User management and VIP upgrades
          </Text>
          <Text style={styles.infoText}>
            • Export user and signal data (CSV)
          </Text>
          <Text style={styles.infoText}>
            • Chat support and user communication
          </Text>
          <Text style={styles.infoText}>
            • VIP pricing management
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  backButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  menuButton: {
    marginBottom: spacing.md,
  },
  infoSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
});