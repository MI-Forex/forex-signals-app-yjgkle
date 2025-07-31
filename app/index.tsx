
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import { commonStyles, colors, spacing } from '../styles/commonStyles';

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const [initializing, setInitializing] = useState(true);
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('IndexScreen: Starting app initialization');
        
        // Show loading message after 2 seconds
        const loadingTimer = setTimeout(() => {
          setShowLoadingMessage(true);
        }, 2000);

        // Simple initialization without Supabase dependency
        console.log('IndexScreen: Skipping Supabase initialization to prevent hanging');
        
        // Clear the loading message timer
        clearTimeout(loadingTimer);
        
        // Minimal delay for auth to settle
        setTimeout(() => {
          console.log('IndexScreen: Initialization complete');
          setInitializing(false);
          setShowLoadingMessage(false);
        }, 500);
      } catch (error) {
        console.error('IndexScreen: Error initializing app:', error);
        setInitializing(false);
        setShowLoadingMessage(false);
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
      <View style={[commonStyles.container, commonStyles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        {showLoadingMessage && (
          <Text style={{
            fontSize: 16,
            color: colors.textMuted,
            marginTop: spacing.md,
            textAlign: 'center'
          }}>
            Loading App...
          </Text>
        )}
      </View>
    );
  }

  return null;
}
