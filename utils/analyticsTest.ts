
import { analyticsService, logEvent, logScreenView, ANALYTICS_EVENTS } from './analyticsUtils';

// Test function to verify analytics is working
export const testAnalytics = async () => {
  console.log('🧪 Testing Analytics Service...');
  
  try {
    // Test basic event logging
    await logEvent('test_event', { test_parameter: 'test_value' });
    
    // Test screen view logging
    await logScreenView('test_screen');
    
    // Test user ID setting
    await analyticsService.setUserId('test_user_123');
    
    // Test user properties
    await analyticsService.setUserProperties({
      user_type: 'test',
      app_version: '1.0.0'
    });
    
    // Test predefined events
    await logEvent(ANALYTICS_EVENTS.APP_OPEN);
    await logEvent(ANALYTICS_EVENTS.SIGNAL_VIEW, {
      signal_id: 'test_signal',
      signal_type: 'BUY',
      is_vip: false
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

// Export for use in development
export default testAnalytics;
