import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { commonStyles } from '../styles/commonStyles';

export default function IndexScreen() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        console.log('User authenticated, redirecting to dashboard');
        router.replace('/dashboard');
      } else {
        console.log('User not authenticated, redirecting to login');
        router.replace('/auth/login');
      }
    }
  }, [user, loading]);

  return (
    <View style={commonStyles.loading}>
      <ActivityIndicator size="large" color="#40916C" />
      <Text style={[commonStyles.text, { marginTop: 16 }]}>
        Loading Forex Signals...
      </Text>
    </View>
  );
}