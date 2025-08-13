
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { commonStyles, colors, spacing } from '../styles/commonStyles';
import Button from '../components/Button';
import { 
  testAnalytics, 
  validateAnalyticsConfig, 
  testSpecificEvent 
} from '../utils/analyticsTest';
import { 
  logEvent, 
  logScreenView, 
  setUserId, 
  setUserProperties,
  analyticsService,
  ANALYTICS_EVENTS 
} from '../utils/analyticsUtils';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  testButton: {
    marginBottom: spacing.sm,
  },
  resultText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontFamily: 'monospace',
  },
  successText: {
    color: colors.success,
  },
  errorText: {
    color: colors.error,
  },
});

export default function TestScreen() {
  useEffect(() => {
    logScreenView('Analytics Test Screen');
  }, []);

  const handleBasicTest = async () => {
    console.log('🧪 Running basic analytics test...');
    const result = await testAnalytics();
    console.log(result ? '✅ Basic test passed' : '❌ Basic test failed');
  };

  const handleConfigValidation = () => {
    console.log('🔍 Validating analytics configuration...');
    const isValid = validateAnalyticsConfig();
    console.log(isValid ? '✅ Configuration valid' : '❌ Configuration invalid');
  };

  const handleCustomEvent = async () => {
    console.log('📊 Testing custom event...');
    await logEvent('test_custom_event', {
      test_parameter: 'custom_value',
      timestamp: new Date().toISOString(),
      screen: 'test_screen'
    });
    console.log('✅ Custom event logged');
  };

  const handleUserTracking = async () => {
    console.log('👤 Testing user tracking...');
    await setUserId('test_user_12345');
    await setUserProperties({
      user_type: 'test',
      platform: 'mobile',
      test_session: 'true'
    });
    console.log('✅ User tracking configured');
  };

  const handleSignalEvent = async () => {
    console.log('📈 Testing signal event...');
    await testSpecificEvent(ANALYTICS_EVENTS.SIGNAL_VIEW, {
      signal_id: 'test_signal_123',
      signal_type: 'BUY',
      pair: 'EUR/USD',
      is_vip: false
    });
    console.log('✅ Signal event logged');
  };

  const handleVIPEvent = async () => {
    console.log('💎 Testing VIP event...');
    await testSpecificEvent(ANALYTICS_EVENTS.VIP_UPGRADE_ATTEMPT, {
      source: 'test_screen',
      user_type: 'free',
      upgrade_reason: 'test'
    });
    console.log('✅ VIP event logged');
  };

  const handleErrorEvent = async () => {
    console.log('❌ Testing error event...');
    await testSpecificEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
      error_message: 'Test error for analytics',
      context: 'test_screen',
      severity: 'low'
    });
    console.log('✅ Error event logged');
  };

  const handleGetAnalyticsState = () => {
    console.log('📊 Getting analytics state...');
    const state = analyticsService.getAnalyticsState();
    console.log('Analytics State:', JSON.stringify(state, null, 2));
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Google Analytics Test</Text>
        <Text style={[styles.resultText, { textAlign: 'center', marginBottom: spacing.lg }]}>
          Measurement ID: G-N7VHTSM9QK
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Tests</Text>
          
          <Button
            title="Run Full Analytics Test"
            onPress={handleBasicTest}
            style={styles.testButton}
            variant="primary"
          />
          
          <Button
            title="Validate Configuration"
            onPress={handleConfigValidation}
            style={styles.testButton}
            variant="secondary"
          />
          
          <Button
            title="Get Analytics State"
            onPress={handleGetAnalyticsState}
            style={styles.testButton}
            variant="secondary"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Tests</Text>
          
          <Button
            title="Test Custom Event"
            onPress={handleCustomEvent}
            style={styles.testButton}
            variant="primary"
          />
          
          <Button
            title="Test Signal Event"
            onPress={handleSignalEvent}
            style={styles.testButton}
            variant="primary"
          />
          
          <Button
            title="Test VIP Event"
            onPress={handleVIPEvent}
            style={styles.testButton}
            variant="primary"
          />
          
          <Button
            title="Test Error Event"
            onPress={handleErrorEvent}
            style={styles.testButton}
            variant="primary"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Tracking</Text>
          
          <Button
            title="Test User Tracking"
            onPress={handleUserTracking}
            style={styles.testButton}
            variant="primary"
          />
        </View>

        <Text style={styles.resultText}>
          Check the console logs to see analytics events being tracked.
          {'\n\n'}
          📊 Web: Events sent to Google Analytics
          {'\n'}
          📱 Mobile: Events logged to console
          {'\n\n'}
          All events use the measurement ID: G-N7VHTSM9QK
        </Text>
      </ScrollView>
    </View>
  );
}
