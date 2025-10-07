
import { initializeApp } from '@firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from '@firebase/auth';
import { getFirestore, connectFirestoreEmulator } from '@firebase/firestore';
import { getStorage } from '@firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyBBFfFd1SFCrRxOpQ02TpAOFtMau1rECtg",
  authDomain: "forex-abd77.firebaseapp.com",
  projectId: "forex-abd77",
  storageBucket: "forex-abd77.firebasestorage.app",
  messagingSenderId: "940152361938",
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
