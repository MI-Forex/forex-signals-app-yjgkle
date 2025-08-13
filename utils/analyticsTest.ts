
import { Platform } from 'react-native';
import { logEvent, logScreenView, setUserId, setUserProperties, ANALYTICS_EVENTS } from './analyticsUtils';

/**
 * Test function to verify Google Analytics 4 integration
 * Call this function to test if analytics are working correctly
 */
export const testAnalytics = async () => {
  console.log('Analytics Test: Starting analytics test...');
  
  try {
    // Test basic event logging
    await logEvent(ANALYTICS_EVENTS.APP_OPEN, {
      platform: Platform.OS,
      test_mode: true,
      timestamp: new Date().toISOString()
    });
    
    // Test screen view tracking
    await logScreenView('Analytics Test Screen');
    
    // Test user ID setting
    await setUserId('test_user_123');
    
    // Test user properties
    await setUserProperties({
      test_user: 'true',
      platform: Platform.OS
    });
    
    // Test custom event
    await logEvent('test_event', {
      test_parameter: 'test_value',
      event_time: new Date().toISOString()
    });
    
    console.log('Analytics Test: All tests completed successfully');
    
    if (Platform.OS === 'web') {
      console.log('Analytics Test: Check browser console and Google Analytics Real-time reports to verify events');
    } else {
      console.log('Analytics Test: Events logged to console (native platform)');
    }
    
    return true;
  } catch (error) {
    console.error('Analytics Test: Test failed:', error);
    return false;
  }
};

/**
 * Performance test to measure analytics impact
 */
export const testAnalyticsPerformance = async () => {
  console.log('Analytics Performance Test: Starting...');
  
  const startTime = performance.now();
  
  // Test multiple events
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(logEvent(`test_event_${i}`, { iteration: i }));
  }
  
  await Promise.all(promises);
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`Analytics Performance Test: Completed in ${duration.toFixed(2)}ms`);
  
  return duration;
};
