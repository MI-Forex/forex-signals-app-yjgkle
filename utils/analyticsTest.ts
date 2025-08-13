
import { analyticsService, logEvent, logScreenView, logLogin, logSignUp, logVIPUpgradeAttempt, logSignalView, logNewsView, logError, ANALYTICS_EVENTS } from './analyticsUtils';

// Test function to verify analytics implementation
export const testAnalytics = async () => {
  console.log('🧪 Testing Google Analytics implementation...');
  
  try {
    // Test basic event logging
    await logEvent('test_event', { test_parameter: 'test_value' });
    
    // Test screen view
    await logScreenView('test_screen');
    
    // Test user events
    await logLogin('email');
    await logSignUp('email');
    
    // Test VIP events
    await logVIPUpgradeAttempt('test_screen');
    
    // Test signal events
    await logSignalView('test_signal_123', 'BUY', false);
    
    // Test news events
    await logNewsView('test_news_456', 'Test News Article');
    
    // Test error logging
    await logError('Test error message', 'test_context');
    
    // Test user properties and ID
    await analyticsService.setUserId('test_user_123');
    await analyticsService.setUserProperties({
      user_type: 'test_user',
      subscription_status: 'free'
    });
    
    // Get analytics state
    const state = analyticsService.getAnalyticsState();
    console.log('📊 Analytics State:', state);
    
    console.log('✅ Analytics test completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Analytics test failed:', error);
    return false;
  }
};

// Function to test specific analytics events
export const testSpecificEvent = async (eventName: string, parameters?: any) => {
  console.log(`🧪 Testing specific event: ${eventName}`);
  try {
    await logEvent(eventName, parameters);
    console.log(`✅ Event ${eventName} logged successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to log event ${eventName}:`, error);
    return false;
  }
};

// Function to validate analytics configuration
export const validateAnalyticsConfig = () => {
  console.log('🔍 Validating analytics configuration...');
  
  const state = analyticsService.getAnalyticsState();
  const isValid = state.measurementId === 'G-N7VHTSM9QK';
  
  if (isValid) {
    console.log('✅ Analytics configuration is valid');
    console.log('📊 Measurement ID:', state.measurementId);
    console.log('📱 Platform:', state.platform);
    console.log('🔧 Initialized:', state.isInitialized);
  } else {
    console.error('❌ Analytics configuration is invalid');
  }
  
  return isValid;
};

export default {
  testAnalytics,
  testSpecificEvent,
  validateAnalyticsConfig
};
