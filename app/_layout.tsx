
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { logEvent, ANALYTICS_EVENTS, logScreenView } from '../utils/analyticsUtils';

export default function RootLayout() {
  useEffect(() => {
    // Log app open event
    logEvent(ANALYTICS_EVENTS.APP_OPEN, {
      platform: Platform.OS,
      timestamp: new Date().toISOString()
    });
    
    console.log('App: Root layout initialized with analytics');
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
        screenListeners={{
          state: (e) => {
            // Track screen views
            const routeName = e.data?.state?.routes?.[e.data.state.index]?.name;
            if (routeName) {
              logScreenView(routeName);
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
  );
}
