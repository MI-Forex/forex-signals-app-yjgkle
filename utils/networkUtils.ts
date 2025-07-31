
import NetInfo from '@react-native-community/netinfo';

export const checkInternetConnectivity = async (): Promise<boolean> => {
  try {
    console.log('NetworkUtils: Checking internet connectivity...');
    const netInfoState = await NetInfo.fetch();
    console.log('NetworkUtils: Network state:', {
      isConnected: netInfoState.isConnected,
      isInternetReachable: netInfoState.isInternetReachable,
      type: netInfoState.type
    });
    
    // Check if we're connected and have internet access
    const isConnected = netInfoState.isConnected === true && netInfoState.isInternetReachable === true;
    console.log('NetworkUtils: Internet connectivity result:', isConnected);
    
    return isConnected;
  } catch (error) {
    console.error('NetworkUtils: Error checking network connectivity:', error);
    return false;
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
