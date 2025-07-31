
import NetInfo from '@react-native-community/netinfo';

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
      const isConnected = netInfoState.isConnected === true && netInfoState.isInternetReachable === true;
      console.log('NetworkUtils: Internet connectivity result:', isConnected);
      
      return isConnected;
    });
    
    return await Promise.race([netInfoPromise, timeoutPromise]);
  } catch (error) {
    console.error('NetworkUtils: Error checking network connectivity:', error);
    // Return true by default to avoid blocking the app
    return true;
  }
};

export const subscribeToNetworkChanges = (callback: (isConnected: boolean) => void) => {
  console.log('NetworkUtils: Subscribing to network changes');
  
  return NetInfo.addEventListener(state => {
    const isConnected = state.isConnected === true && state.isInternetReachable === true;
    console.log('NetworkUtils: Network state changed:', {
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      result: isConnected
    });
    callback(isConnected);
  });
};

// Export default for backward compatibility
export default {
  checkInternetConnectivity,
  subscribeToNetworkChanges
};
