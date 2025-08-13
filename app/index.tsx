
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';
import { colors, spacing } from '../styles/commonStyles';

export default function IndexScreen() {
  const { user, loading } = useAuth();
  const [initializing, setInitializing] = useState(true);
  const [showLoadingMessage, setShowLoadingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('IndexScreen: Starting app initialization');
        
        // Show loading message after 2 seconds
        const loadingTimer = setTimeout(() => {
          setShowLoadingMessage(true);
        }, 2000);

        // Simple initialization without complex dependencies
        console.log('IndexScreen: Basic initialization complete');
        
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
        setError('Failed to initialize app. Please try again.');
        setInitializing(false);
        setShowLoadingMessage(false);
      }
    };

    // Wrap initialization in try-catch to prevent crashes
    try {
      initialize();
    } catch (error) {
      console.error('IndexScreen: Error in initialization wrapper:', error);
      setError('App initialization failed');
      setInitializing(false);
      setShowLoadingMessage(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !initializing && !error) {
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
          try {
            if (user) {
              router.push('/(tabs)/signals');
            } else {
              router.push('/auth/login');
            }
          } catch (fallbackError) {
            console.error('IndexScreen: Fallback navigation also failed:', fallbackError);
            setError('Navigation failed. Please refresh the app.');
          }
        }
      }, 100);
    }
  }, [user, loading, initializing, error]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.subText}>Please refresh the app to try again.</Text>
      </View>
    );
  }

  if (loading || initializing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        {showLoadingMessage && (
          <Text style={styles.loadingText}>
            Loading App...
          </Text>
        )}
        <Text style={styles.subText}>
          Platform: {Platform.OS}
        </Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  subText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
