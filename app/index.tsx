
<<<<<<< HEAD
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../styles/commonStyles';
import { logScreenView } from '../utils/analyticsUtils';

export default function Index() {
  const { user, userData, loading } = useAuth();

  useEffect(() => {
    console.log('📍 Index: Component mounted');
    logScreenView('IndexScreen');
  }, []);

  useEffect(() => {
    console.log('📍 Index: Auth state changed');
    console.log('📍 Index: Loading:', loading);
    console.log('📍 Index: User:', user?.email || 'none');
    console.log('📍 Index: UserData:', userData?.email || 'none');
  }, [loading, user, userData]);

  if (loading) {
    console.log('📍 Index: Showing loading indicator');
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
      </View>
    );
  }

<<<<<<< HEAD
  if (user && userData) {
    console.log('📍 Index: User authenticated, checking email verification');
    
    if (!user.emailVerified) {
      console.log('📍 Index: Email not verified, redirecting to login');
      return <Redirect href="/auth/login" />;
    }

    if (userData.isAdmin) {
      console.log('📍 Index: Admin user, redirecting to admin dashboard');
      return <Redirect href="/admin" />;
    }

    console.log('📍 Index: Regular user, redirecting to tabs');
    return <Redirect href="/(tabs)/signals" />;
  }

  console.log('📍 Index: No user, redirecting to login');
  return <Redirect href="/auth/login" />;
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
<<<<<<< HEAD
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
  },
});
