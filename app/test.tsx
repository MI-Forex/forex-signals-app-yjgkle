
import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Button from '../components/Button';
import { commonStyles } from '../styles/commonStyles';
import { useAuth } from '../contexts/AuthContext';
import { testAnalytics } from '../utils/analyticsTest';
import { logEvent, ANALYTICS_EVENTS, analyticsService } from '../utils/analyticsUtils';

export default function TestScreen() {
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();

  console.log('TestScreen rendered');

  const createTestAdmin = async () => {
    setLoading(true);
    try {
      console.log('Creating test admin user...');
      await signUp('admin@test.com', 'admin123', 'Test Admin', '+1234567890');
      Alert.alert('Success', 'Test admin created successfully!\nEmail: admin@test.com\nPassword: admin123');
    } catch (error: any) {
      console.error('Error creating test admin:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const createTestUser = async () => {
    setLoading(true);
    try {
      console.log('Creating test user...');
      await signUp('user@test.com', 'user123', 'Test User', '+1234567891');
      Alert.alert('Success', 'Test user created successfully!\nEmail: user@test.com\nPassword: user123');
    } catch (error: any) {
      console.error('Error creating test user:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testAdminLogin = async () => {
    setLoading(true);
    try {
      console.log('Testing admin login...');
      await signIn('admin@test.com', 'admin123');
      Alert.alert('Success', 'Admin login successful!');
    } catch (error: any) {
      console.error('Error testing admin login:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testUserLogin = async () => {
    setLoading(true);
    try {
      console.log('Testing user login...');
      await signIn('user@test.com', 'user123');
      Alert.alert('Success', 'User login successful!');
    } catch (error: any) {
      console.error('Error testing user login:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const runAnalyticsTest = async () => {
    setLoading(true);
    try {
      console.log('Running analytics test...');
      const success = await testAnalytics();
      if (success) {
        Alert.alert('Success', 'Analytics test completed successfully! Check console for details.');
      } else {
        Alert.alert('Error', 'Analytics test failed. Check console for details.');
      }
    } catch (error: any) {
      console.error('Error running analytics test:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testCustomEvent = async () => {
    try {
      await logEvent('test_custom_event', {
        test_param: 'custom_value',
        timestamp: new Date().toISOString(),
        screen: 'test_screen'
      });
      Alert.alert('Success', 'Custom event logged! Check console for details.');
    } catch (error: any) {
      console.error('Error logging custom event:', error);
      Alert.alert('Error', error.message);
    }
  };

  const showAnalyticsState = () => {
    const state = analyticsService.getAnalyticsState();
    Alert.alert('Analytics State', JSON.stringify(state, null, 2));
  };

  return (
    <ScrollView style={commonStyles.container} contentContainerStyle={commonStyles.centerContent}>
      <Text style={commonStyles.title}>Test Screen</Text>
      <Text style={commonStyles.text}>Create and test user accounts & analytics</Text>
      
      <View style={{ gap: 16, marginTop: 32, width: '100%', maxWidth: 300 }}>
        <Text style={[commonStyles.subtitle, { textAlign: 'center', marginBottom: 8 }]}>
          User Testing
        </Text>
        
        <Button
          text="Create Test Admin"
          onPress={createTestAdmin}
          loading={loading}
          disabled={loading}
        />
        
        <Button
          text="Create Test User"
          onPress={createTestUser}
          loading={loading}
          disabled={loading}
        />
        
        <Button
          text="Test Admin Login"
          onPress={testAdminLogin}
          loading={loading}
          disabled={loading}
          variant="success"
        />
        
        <Button
          text="Test User Login"
          onPress={testUserLogin}
          loading={loading}
          disabled={loading}
          variant="outline"
        />

        <Text style={[commonStyles.subtitle, { textAlign: 'center', marginTop: 24, marginBottom: 8 }]}>
          Analytics Testing
        </Text>
        
        <Button
          text="Run Analytics Test"
          onPress={runAnalyticsTest}
          loading={loading}
          disabled={loading}
          variant="success"
        />
        
        <Button
          text="Test Custom Event"
          onPress={testCustomEvent}
          disabled={loading}
          variant="outline"
        />
        
        <Button
          text="Show Analytics State"
          onPress={showAnalyticsState}
          disabled={loading}
          variant="outline"
        />

        <Text style={[commonStyles.subtitle, { textAlign: 'center', marginTop: 24, marginBottom: 8 }]}>
          Navigation
        </Text>
        
        <Button
          text="Go to Login"
          onPress={() => router.push('/auth/login')}
        />
        
        <Button
          text="Go Back"
          onPress={() => router.back()}
          variant="outline"
        />
      </View>
    </ScrollView>
  );
}
