
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import { commonStyles, colors, spacing } from '../styles/commonStyles';

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const [initializing, setInitializing] = useState(true);
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  const [hasStyleError, setHasStyleError] = useState(false);

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

    // Wrap initialization in try-catch to prevent crashes
    try {
      initialize();
    } catch (error) {
      console.error('IndexScreen: Error in initialization wrapper:', error);
      setInitializing(false);
      setShowLoadingMessage(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !initializing) {
      // Add a small delay to ensure proper navigation
      setTimeout(() => {
        try {
          if (user) {
            console.log('IndexScreen: User authenticated, navigating to tabs');
            router.replace('/(tabs)/signals');
          } else {
            console.log('IndexScreen: No user, navigating to login');
            router.replace('/auth/login');
          }
        } catch (navError) {
          console.error('IndexScreen: Navigation error:', navError);
          // Fallback navigation
          if (user) {
            router.push('/(tabs)/signals');
          } else {
            router.push('/auth/login');
          }
        }
      }, 100);
    }
  }, [user, loading, initializing]);

  if (loading || initializing) {
    try {
      const loadingStyle = {
        flex: 1,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        backgroundColor: colors.background,
      };

      const loadingTextStyle = {
        fontSize: 16,
        color: colors.textMuted,
        marginTop: spacing.md,
        textAlign: 'center' as const,
      };

      return (
        <View style={loadingStyle}>
          <ActivityIndicator size="large" color={colors.primary} />
          {showLoadingMessage && (
            <Text style={loadingTextStyle}>
              Loading App...
            </Text>
          )}
        </View>
      );
    } catch (styleError) {
      console.error('IndexScreen: Style error caught:', styleError);
      setHasStyleError(true);
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={{ fontSize: 16, color: '#64748b', marginTop: 16, textAlign: 'center' }}>
            Loading App...
          </Text>
        </View>
      );
    }
  }

  // Fallback for style errors
  if (hasStyleError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <Text style={{ fontSize: 18, color: '#1e293b', textAlign: 'center', marginBottom: 16 }}>
          Loading...
        </Text>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return null;
}
