
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBFfFd1SFCrRxOpQ02TpAOFtMau1rECtg",
  authDomain: "forex-abd77.firebaseapp.com",
  projectId: "forex-abd77",
  storageBucket: "forex-abd77.firebasestorage.app",
  messagingSenderId: "940152361938",
  appId: Platform.OS === 'ios' 
    ? "1:940152361938:ios:31a68add22dd613a9eee0b"
    : "1:940152361938:android:a72b610bdcb1e2459eee0b"
};

console.log('🔥 Firebase: Initializing Firebase app for platform:', Platform.OS);

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
console.log('✅ Firebase: App initialized successfully');

// Initialize Auth with mobile-specific persistence
let auth;
try {
  console.log('🔥 Firebase: Initializing auth for mobile with AsyncStorage persistence');
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  console.log('✅ Firebase: Auth initialized successfully');
} catch (error) {
  console.error('❌ Firebase: Error initializing auth:', error);
  // Fallback to default auth if initialization fails
  auth = getAuth(app);
}

// Initialize Firestore
export const db = getFirestore(app);
console.log('✅ Firebase: Firestore initialized successfully');

// Initialize Storage
export const storage = getStorage(app);
console.log('✅ Firebase: Storage initialized successfully');

// NO ANALYTICS INITIALIZATION FOR MOBILE
// Firebase Analytics for React Native is handled automatically by the native SDKs
// via GoogleService-Info.plist (iOS) and google-services.json (Android)
console.log('📱 Firebase: Analytics handled by native SDK for', Platform.OS);
console.log('📱 Firebase: Make sure GoogleService-Info.plist (iOS) or google-services.json (Android) is configured');

export { auth };
export default app;

console.log('✅ Firebase: Configuration module loaded successfully');
