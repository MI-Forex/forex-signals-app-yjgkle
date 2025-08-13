
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
  appId: "1:940152361938:android:a72b610bdcb1e2459eee0b"
};

console.log('Firebase: Initializing Firebase app for platform:', Platform.OS);

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase: App initialized successfully');
} catch (error) {
  console.error('Firebase: Error initializing app:', error);
  throw error;
}

// Initialize Auth with platform-specific persistence
let auth;
try {
  if (Platform.OS === 'web') {
    console.log('Firebase: Initializing auth for web');
    auth = getAuth(app);
  } else {
    console.log('Firebase: Initializing auth for mobile with AsyncStorage persistence');
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
  console.log('Firebase: Auth initialized successfully');
} catch (error) {
  console.error('Firebase: Error initializing auth:', error);
  // Fallback to basic auth
  auth = getAuth(app);
  console.log('Firebase: Using fallback auth initialization');
}

// Initialize Firestore with error handling
let db;
try {
  db = getFirestore(app);
  console.log('Firebase: Firestore initialized successfully');
} catch (error) {
  console.error('Firebase: Error initializing Firestore:', error);
  throw error;
}

// Initialize Storage with error handling
let storage;
try {
  storage = getStorage(app);
  console.log('Firebase: Storage initialized successfully');
} catch (error) {
  console.error('Firebase: Error initializing Storage:', error);
  // Storage is optional, so we can continue without it
  storage = null;
}

export { auth, db, storage };
export default app;
