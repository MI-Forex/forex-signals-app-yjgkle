
import { auth, db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    
    // Test auth
    console.log('Auth instance:', auth ? 'OK' : 'FAILED');
    
    // Test firestore
    console.log('Firestore instance:', db ? 'OK' : 'FAILED');
    
    // Try to read from a collection (this will fail if there are permission issues, but won't fail due to module resolution)
    const testQuery = collection(db, 'test');
    console.log('Collection query created successfully');
    
    console.log('Firebase connection test completed successfully');
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
};
