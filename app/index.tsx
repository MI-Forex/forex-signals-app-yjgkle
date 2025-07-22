import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { initializeSupabaseTables } from '../utils/supabaseConfig';

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize Supabase tables
        await initializeSupabaseTables();
        
        // Wait a bit for auth to settle
        setTimeout(() => {
          setInitializing(false);
        }, 1000);
      } catch (error) {
        console.error('Error initializing app:', error);
        setInitializing(false);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    if (!loading && !initializing) {
      if (user) {
        console.log('IndexScreen: User authenticated, navigating to tabs');
        router.replace('/(tabs)/signals');
      } else {
        console.log('IndexScreen: No user, navigating to login');
        router.replace('/auth/login');
      }
    }
  }, [user, loading, initializing]);

  if (loading || initializing) {
    return (
      <View style={[commonStyles.container, commonStyles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[commonStyles.text, { marginTop: 16, textAlign: 'center' }]}>
          {initializing ? 'Initializing CNC Forex Signals...' : 'Loading...'}
        </Text>
      </View>
    );
  }

  return null;
}