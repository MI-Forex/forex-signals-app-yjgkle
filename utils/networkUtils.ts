
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

export const checkInternetConnectivity = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') {
      // For web, check if navigator.onLine is available and true
      return typeof navigator !== 'undefined' ? navigator.onLine : true;
    }
    
    const netInfoState = await NetInfo.fetch();
    return netInfoState.isConnected === true && netInfoState.isInternetReachable !== false;
  } catch (error) {
    console.error('NetworkUtils: Error checking connectivity:', error);
    // Return true as fallback to avoid blocking the app
    return true;
  }
};

export const subscribeToNetworkChanges = (callback: (isConnected: boolean) => void) => {
  try {
    if (Platform.OS === 'web') {
      // For web, listen to online/offline events
      const handleOnline = () => callback(true);
      const handleOffline = () => callback(false);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
    
    return NetInfo.addEventListener(state => {
      const isConnected = state.isConnected === true && state.isInternetReachable !== false;
      callback(isConnected);
    });
  } catch (error) {
    console.error('NetworkUtils: Error subscribing to network changes:', error);
    // Return a no-op function as fallback
    return () => {};
  }
};
