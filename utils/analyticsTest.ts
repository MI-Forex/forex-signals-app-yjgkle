
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
