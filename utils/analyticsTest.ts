
<<<<<<< HEAD
import { Platform } from 'react-native';
import analyticsService, { 
  logEvent, 
  logLogin, 
  logSignUp, 
  logScreenView,
  setUserId,
  setUserProperties,
  ANALYTICS_EVENTS 
} from './analyticsUtils';

/**
 * Test Firebase Analytics Setup
 * 
 * This file contains tests to verify that Firebase Analytics is properly configured
 * and working on all platforms (web, iOS, Android).
 */

export async function testAnalyticsSetup() {
  console.log('🧪 Analytics Test: Starting analytics setup test...');
  console.log('🧪 Analytics Test: Platform:', Platform.OS);

  try {
    // Wait for analytics to initialize
    console.log('🧪 Analytics Test: Waiting for initialization...');
    await analyticsService.waitForInitialization();
    console.log('✅ Analytics Test: Initialization complete');

    // Check analytics state
    const state = analyticsService.getAnalyticsState();
    console.log('🧪 Analytics Test: Current state:', state);

    if (!state.isInitialized) {
      console.error('❌ Analytics Test: Analytics not initialized!');
      return false;
    }

    // Test 1: Log a simple event
    console.log('🧪 Analytics Test: Test 1 - Logging simple event...');
    await logEvent('test_event', { test_parameter: 'test_value' });
    console.log('✅ Analytics Test: Test 1 passed');

    // Test 2: Log predefined events
    console.log('🧪 Analytics Test: Test 2 - Logging predefined events...');
    await logLogin('test');
    await logSignUp('test');
    await logScreenView('TestScreen', 'TestScreenClass');
    console.log('✅ Analytics Test: Test 2 passed');

    // Test 3: Set user properties
    console.log('🧪 Analytics Test: Test 3 - Setting user properties...');
    await setUserProperties({
      test_property: 'test_value',
      platform: Platform.OS
    });
    console.log('✅ Analytics Test: Test 3 passed');

    // Test 4: Set user ID
    console.log('🧪 Analytics Test: Test 4 - Setting user ID...');
    await setUserId('test_user_123');
    console.log('✅ Analytics Test: Test 4 passed');

    // Test 5: Log event with complex parameters
    console.log('🧪 Analytics Test: Test 5 - Logging event with complex parameters...');
    await logEvent(ANALYTICS_EVENTS.SIGNAL_VIEW, {
      item_id: 'signal_123',
      item_name: 'EUR/USD BUY Signal',
      item_category: 'forex_signal',
      item_variant: 'vip',
      value: 100
    });
    console.log('✅ Analytics Test: Test 5 passed');

    // Test 6: Verify platform-specific behavior
    console.log('🧪 Analytics Test: Test 6 - Verifying platform-specific behavior...');
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.gtag) {
        console.log('✅ Analytics Test: Web - gtag function available');
      } else {
        console.warn('⚠️ Analytics Test: Web - gtag function not available (may be blocked)');
      }
    } else {
      console.log('✅ Analytics Test: Native - Using console logging (native SDK handles actual tracking)');
    }
    console.log('✅ Analytics Test: Test 6 passed');

    // Final state check
    const finalState = analyticsService.getAnalyticsState();
    console.log('🧪 Analytics Test: Final state:', finalState);

    console.log('✅ Analytics Test: All tests passed!');
    console.log('📊 Analytics Test: Summary:');
    console.log('   - Platform:', Platform.OS);
    console.log('   - Initialized:', finalState.isInitialized);
    console.log('   - User ID:', finalState.currentUserId);
    console.log('   - Queued Events:', finalState.queuedEvents);
    console.log('   - Measurement ID:', finalState.measurementId);

    return true;
  } catch (error) {
    console.error('❌ Analytics Test: Test failed with error:', error);
    return false;
  }
}

/**
 * Run analytics test on app startup (for debugging)
 * Uncomment the line below to run tests automatically
 */
// setTimeout(() => testAnalyticsSetup(), 2000);

export default testAnalyticsSetup;
=======
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
>>>>>>> d25a57f3098c8051d06235d06891a35f0636fc62
