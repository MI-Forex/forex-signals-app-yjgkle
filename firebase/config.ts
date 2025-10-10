
<<<<<<< HEAD
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Firebase configuration
=======
import { initializeApp } from '@firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from '@firebase/auth';
import { getFirestore, connectFirestoreEmulator } from '@firebase/firestore';
import { getStorage } from '@firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
const firebaseConfig = {
  apiKey: "AIzaSyBBFfFd1SFCrRxOpQ02TpAOFtMau1rECtg",
  authDomain: "forex-abd77.firebaseapp.com",
  projectId: "forex-abd77",
  storageBucket: "forex-abd77.firebasestorage.app",
  messagingSenderId: "940152361938",
<<<<<<< HEAD
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
=======
  appId: "1:940152361938:android:a72b610bdcb1e2459eee0b",
  measurementId: "G-N7VHTSM9QK"
};

console.log('🔥 Firebase: Initializing Firebase app for platform:', Platform.OS);
console.log('🔥 Firebase: Project ID:', firebaseConfig.projectId);
console.log('🔥 Firebase: Measurement ID:', firebaseConfig.measurementId);

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase: App initialized successfully');
} catch (error: any) {
  console.error('❌ Firebase: Error initializing app:', error);
  console.error('❌ Firebase: Error code:', error.code);
  console.error('❌ Firebase: Error message:', error.message);
  throw error;
}

// Initialize Auth with platform-specific persistence
let auth;
try {
  if (Platform.OS === 'web') {
    console.log('🔥 Firebase: Initializing auth for web');
    auth = getAuth(app);
  } else {
    console.log('🔥 Firebase: Initializing auth for mobile with AsyncStorage persistence');
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
  console.log('✅ Firebase: Auth initialized successfully');
  console.log('🔥 Firebase: Auth current user:', auth.currentUser ? 'Logged in' : 'Not logged in');
} catch (error: any) {
  console.error('❌ Firebase: Error initializing auth:', error);
  console.error('❌ Firebase: Error code:', error.code);
  // Fallback to basic auth
  auth = getAuth(app);
  console.log('⚠️ Firebase: Using fallback auth initialization');
}

// Initialize Firestore with error handling
let db;
try {
  db = getFirestore(app);
  console.log('✅ Firebase: Firestore initialized successfully');
  console.log('🔥 Firebase: Firestore app:', db.app.name);
} catch (error: any) {
  console.error('❌ Firebase: Error initializing Firestore:', error);
  console.error('❌ Firebase: Error code:', error.code);
  console.error('❌ Firebase: Error message:', error.message);
  throw error;
}

// Initialize Storage with error handling
let storage;
try {
  storage = getStorage(app);
  console.log('✅ Firebase: Storage initialized successfully');
  console.log('🔥 Firebase: Storage bucket:', firebaseConfig.storageBucket);
} catch (error: any) {
  console.error('❌ Firebase: Error initializing Storage:', error);
  console.error('❌ Firebase: Error code:', error.code);
  // Storage is optional, so we can continue without it
  storage = null;
  console.log('⚠️ Firebase: Continuing without Storage');
}

// Test Firebase connectivity
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔥 Firebase: Testing connection...');
    
    // Test auth
    if (auth) {
      console.log('✅ Firebase: Auth is available');
      console.log('🔥 Firebase: Current user:', auth.currentUser?.uid || 'None');
    } else {
      console.error('❌ Firebase: Auth is not available');
      return false;
    }
    
    // Test Firestore
    if (db) {
      console.log('✅ Firebase: Firestore is available');
      console.log('🔥 Firebase: Firestore type:', db.type);
    } else {
      console.error('❌ Firebase: Firestore is not available');
      return false;
    }
    
    // Test Storage
    if (storage) {
      console.log('✅ Firebase: Storage is available');
    } else {
      console.log('⚠️ Firebase: Storage is not available (optional)');
    }
    
    console.log('✅ Firebase: Connection test passed');
    return true;
  } catch (error: any) {
    console.error('❌ Firebase: Connection test failed:', error);
    console.error('❌ Firebase: Error code:', error.code);
    console.error('❌ Firebase: Error message:', error.message);
    return false;
  }
};

// Export Firebase instances
export { auth, db, storage };
export default app;

// Log final status
console.log('🔥 Firebase: Configuration complete');
console.log('🔥 Firebase: Auth available:', !!auth);
console.log('🔥 Firebase: Firestore available:', !!db);
console.log('🔥 Firebase: Storage available:', !!storage);
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
