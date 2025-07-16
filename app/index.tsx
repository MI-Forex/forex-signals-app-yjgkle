import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { commonStyles, colors } from '../styles/commonStyles';

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState('Initializing...');

  console.log('IndexScreen render - user:', user?.email, 'loading:', loading);

  useEffect(() => {
    console.log('IndexScreen useEffect - user:', user?.email, 'loading:', loading);
    
    setDebugInfo(`Loading: ${loading}, User: ${user?.email || 'None'}`);
    
    if (!loading) {
      if (user) {
        console.log('User authenticated, redirecting to dashboard');
        setDebugInfo('Redirecting to dashboard...');
        setTimeout(() => {
          router.replace('/dashboard');
        }, 100);
      } else {
        console.log('User not authenticated, redirecting to login');
        setDebugInfo('Redirecting to login...');
        setTimeout(() => {
          router.replace('/auth/login');
        }, 100);
      }
    }
  }, [user, loading]);

  console.log('IndexScreen rendering loading screen');

  return (
    <View style={commonStyles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
        Loading Forex Signals...
      </Text>
      <Text style={[commonStyles.textMuted, { marginTop: 8, textAlign: 'center' }]}>
        {debugInfo}
      </Text>
    </View>
  );
}