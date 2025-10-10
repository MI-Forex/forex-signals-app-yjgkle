
import NetInfo from '@react-native-community/netinfo';
<<<<<<< HEAD

export const checkInternetConnectivity = async (): Promise<boolean> => {
  try {
    console.log('NetworkUtils: Checking internet connectivity...');
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => reject(new Error('Network check timeout')), 5000);
    });
    
    const netInfoPromise = NetInfo.fetch().then(netInfoState => {
      console.log('NetworkUtils: Network state:', {
        isConnected: netInfoState.isConnected,
        isInternetReachable: netInfoState.isInternetReachable,
        type: netInfoState.type
      });
      
      // Check if we're connected and have internet access
      // If isInternetReachable is null, we'll assume connection is available if isConnected is true
      const isConnected = netInfoState.isConnected === true && 
        (netInfoState.isInternetReachable === true || netInfoState.isInternetReachable === null);
      
      console.log('NetworkUtils: Internet connectivity result:', isConnected);
      
      return isConnected;
    });
    
    return await Promise.race([netInfoPromise, timeoutPromise]);
  } catch (error) {
    console.error('NetworkUtils: Error checking network connectivity:', error);
    // Return true by default to avoid blocking the app
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
    return true;
  }
};

export const subscribeToNetworkChanges = (callback: (isConnected: boolean) => void) => {
<<<<<<< HEAD
  console.log('NetworkUtils: Subscribing to network changes');
  
  return NetInfo.addEventListener(state => {
    const isConnected = state.isConnected === true && 
      (state.isInternetReachable === true || state.isInternetReachable === null);
    
    console.log('NetworkUtils: Network state changed:', {
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      result: isConnected
    });
    callback(isConnected);
  });
};

// Utility function to check if device is online with fallback
export const isDeviceOnline = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected === true;
  } catch (error) {
    console.error('NetworkUtils: Error checking device online status:', error);
    return true; // Assume online if check fails
  }
};

// Export default for backward compatibility
export default {
  checkInternetConnectivity,
  subscribeToNetworkChanges,
  isDeviceOnline
};
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
