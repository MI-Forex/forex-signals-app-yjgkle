
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
      </View>
    );
  }

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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
