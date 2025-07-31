import { Stack, useGlobalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, SafeAreaView, StyleSheet } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { useEffect, useState } from 'react';
import { setupErrorLogging } from '../utils/errorLogger';
import { AuthProvider } from '../contexts/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';

const STORAGE_KEY = 'emulated_device';

export default function RootLayout() {
  const actualInsets = useSafeAreaInsets();
  const { emulate } = useGlobalSearchParams<{ emulate?: string }>();
  const [storedEmulate, setStoredEmulate] = useState<string | null>(null);

  console.log('RootLayout rendering');

  useEffect(() => {
    console.log('RootLayout useEffect - setting up error logging');
    // Set up global error logging
    setupErrorLogging();

    if (Platform.OS === 'web') {
      // If there's a new emulate parameter, store it
      if (emulate) {
        localStorage.setItem(STORAGE_KEY, emulate);
        setStoredEmulate(emulate);
      } else {
        // If no emulate parameter, try to get from localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setStoredEmulate(stored);
        }
      }
    }
  }, [emulate]);

  let insetsToUse = actualInsets;

  if (Platform.OS === 'web') {
    const simulatedInsets = {
      ios: { top: 47, bottom: 20, left: 0, right: 0 },
      android: { top: 40, bottom: 0, left: 0, right: 0 },
    };

    // Use stored emulate value if available, otherwise use the current emulate parameter
    const deviceToEmulate = storedEmulate || emulate;
    insetsToUse = deviceToEmulate ? simulatedInsets[deviceToEmulate as keyof typeof simulatedInsets] || actualInsets : actualInsets;
  }

  console.log('RootLayout rendering with insets:', insetsToUse);

  const safeAreaStyle = {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: insetsToUse.top,
    paddingBottom: insetsToUse.bottom,
    paddingLeft: insetsToUse.left,
    paddingRight: insetsToUse.right,
  };

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <SafeAreaView style={safeAreaStyle}>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'default',
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="auth/login" />
              <Stack.Screen name="auth/register" />
              <Stack.Screen name="auth/forgot-password" />
              <Stack.Screen name="admin/index" />
              <Stack.Screen name="admin/signals/index" />
              <Stack.Screen name="admin/signals/add" />
              <Stack.Screen name="admin/news/index" />
              <Stack.Screen name="admin/news/add" />
              <Stack.Screen name="admin/analysis/index" />
              <Stack.Screen name="admin/analysis/add" />
              <Stack.Screen name="admin/users/index" />
            </Stack>
          </SafeAreaView>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}