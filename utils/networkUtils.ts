
import NetInfo from '@react-native-community/netinfo';

export const checkInternetConnectivity = async (): Promise<boolean> => {
  try {
    const netInfoState = await NetInfo.fetch();
    console.log('Network state:', netInfoState);
    
    // Check if we're connected and have internet access
    return netInfoState.isConnected === true && netInfoState.isInternetReachable === true;
  } catch (error) {
    console.error('Error checking network connectivity:', error);
    return false;
  }
};

export const subscribeToNetworkChanges = (callback: (isConnected: boolean) => void) => {
  return NetInfo.addEventListener(state => {
    const isConnected = state.isConnected === true && state.isInternetReachable === true;
    callback(isConnected);
  });
};
