import { Platform } from 'react-native';

// Google Sign-In configuration utility
export const configureGoogleSignIn = async () => {
  try {
    // Only configure on native platforms
    if (Platform.OS === 'web') {
      console.log('Google Sign-In not supported on web platform');
      return false;
    }

    // Dynamic import to avoid module resolution issues
    const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
    
    await GoogleSignin.configure({
      webClientId: '940152361938-7j8k9l0m1n2o3p4q5r6s7t8u9v0w1x2y.apps.googleusercontent.com', // Replace with your actual web client ID
      offlineAccess: true,
      hostedDomain: '', // Optional
      forceCodeForRefreshToken: true,
    });

    console.log('Google Sign-In configured successfully');
    return true;
  } catch (error) {
    console.error('Failed to configure Google Sign-In:', error);
    return false;
  }
};

export const isGoogleSignInAvailable = () => {
  try {
    if (Platform.OS === 'web') {
      return false;
    }
    
    // Try to require the module
    require('@react-native-google-signin/google-signin');
    return true;
  } catch (error) {
    console.log('Google Sign-In module not available:', error);
    return false;
  }
};

export const performGoogleSignIn = async () => {
  try {
    if (!isGoogleSignInAvailable()) {
      throw new Error('Google Sign-In is not available on this platform');
    }

    const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
    
    // Check if device has Google Play Services
    await GoogleSignin.hasPlayServices();
    
    // Perform sign in
    const result = await GoogleSignin.signIn();
    
    if (!result.idToken) {
      throw new Error('No ID token received from Google');
    }

    return result;
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    
    if (error.code === 'sign_in_cancelled') {
      throw new Error('Sign in was cancelled');
    } else if (error.code === 'in_progress') {
      throw new Error('Sign in is already in progress');
    } else if (error.code === 'play_services_not_available') {
      throw new Error('Google Play Services not available');
    } else {
      throw new Error(error.message || 'Google sign in failed');
    }
  }
};

export const signOutFromGoogle = async () => {
  try {
    if (!isGoogleSignInAvailable()) {
      return;
    }

    const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
    await GoogleSignin.signOut();
  } catch (error) {
    console.log('Google sign out error (non-critical):', error);
  }
};