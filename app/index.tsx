import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { commonStyles, colors } from '../styles/commonStyles';

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    console.log('IndexScreen: Auth state changed', { user: !!user, loading });
    
    if (!loading) {
      setInitialLoad(false);
      
      if (user) {
        console.log('IndexScreen: User authenticated, AuthContext will handle navigation');
        // AuthContext will handle navigation based on user role
      } else {
        console.log('IndexScreen: No user, navigating to login');
        router.replace('/auth/login');
      }
    }
  }, [user, loading]);

  // Show loading screen while auth is initializing
  if (loading || initialLoad) {
    return (
      <View style={[commonStyles.container, commonStyles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.text, { marginTop: 16, color: colors.textMuted }]}>
          Loading...
        </Text>
      </View>
    );
  }

  // This should rarely be shown as navigation happens in useEffect
  return (
    <View style={[commonStyles.container, commonStyles.centered]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[commonStyles.text, { marginTop: 16, color: colors.textMuted }]}>
        Initializing...
      </Text>
    </View>
  );
}