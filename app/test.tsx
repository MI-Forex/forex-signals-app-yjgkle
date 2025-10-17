import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import Button from '../components/Button';
import { commonStyles } from '../styles/commonStyles';
import { useAuth } from '../contexts/AuthContext';

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

  return (
    <View style={commonStyles.centerContent}>
      <Text style={commonStyles.title}>Test Screen</Text>
      <Text style={commonStyles.text}>Create and test user accounts</Text>
      
      <View style={{ gap: 16, marginTop: 32, width: '100%', maxWidth: 300 }}>
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
    </View>
  );
}