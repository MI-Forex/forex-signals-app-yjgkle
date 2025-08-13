
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { logEvent, ANALYTICS_EVENTS, logScreenView } from '../utils/analyticsUtils';
import ErrorBoundary from '../components/ErrorBoundary';

export default function RootLayout() {
  useEffect(() => {
    // Log app open event
    try {
      logEvent(ANALYTICS_EVENTS.APP_OPEN, {
        platform: Platform.OS,
        timestamp: new Date().toISOString()
      });
      
      console.log('App: Root layout initialized with analytics');
    } catch (error) {
      console.error('App: Error logging app open event:', error);
    }
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
          screenListeners={{
            state: (e) => {
              try {
                // Track screen views
                const routeName = e.data?.state?.routes?.[e.data.state.index]?.name;
                if (routeName) {
                  logScreenView(routeName);
                }
              } catch (error) {
                console.error('App: Error tracking screen view:', error);
              }
            },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="auth/forgot-password" />
          <Stack.Screen name="admin" />
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="news" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="test" />
        </Stack>
      </AuthProvider>
    </ErrorBoundary>
  );
}
