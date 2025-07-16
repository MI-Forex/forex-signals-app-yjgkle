import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
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

console.log('Firebase: Initializing Firebase app');

// Initialize Firebase
const app = initializeApp(firebaseConfig);

console.log('Firebase: App initialized successfully');

// Initialize Auth with persistence for React Native
let auth;
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

// Initialize Firestore
export const db = getFirestore(app);
console.log('Firebase: Firestore initialized successfully');

// Initialize Storage
export const storage = getStorage(app);
console.log('Firebase: Storage initialized successfully');

export { auth };
export default app;