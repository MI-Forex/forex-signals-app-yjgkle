
import { Platform } from 'react-native';

// Analytics event names for consistent tracking
export const ANALYTICS_EVENTS = {
  USER_LOGIN: 'login',
  USER_REGISTER: 'sign_up',
  USER_LOGOUT: 'logout',
  SCREEN_VIEW: 'screen_view',
  SIGNAL_VIEW: 'view_item',
  SIGNAL_FILTER: 'filter_signals',
  VIP_UPGRADE_ATTEMPT: 'begin_checkout',
  VIP_UPGRADE_SUCCESS: 'purchase',
  NEWS_VIEW: 'select_content',
  ADMIN_ACTION: 'admin_action',
  CHAT_OPEN: 'chat_open',
  CHAT_MESSAGE_SENT: 'chat_message_sent',
  ERROR_OCCURRED: 'exception'
};

class AnalyticsService {
  private currentUserId: string | null = null;
  private isInitialized: boolean = false;

  constructor() {
    console.log('📊 Analytics: Creating mobile-safe AnalyticsService for platform:', Platform.OS);
    this.initialize();
  }

  private async initialize() {
    try {
      // Simple initialization without external dependencies
      this.isInitialized = true;
      console.log('✅ Analytics: Service initialized successfully');
    } catch (error) {
      console.error('❌ Analytics: Initialization error:', error);
      this.isInitialized = false;
    }
  }

  async logEvent(eventName: string, parameters?: Record<string, any>) {
    try {
      if (!this.isInitialized) {
        console.warn('⚠️ Analytics: Service not initialized, skipping event:', eventName);
        return;
      }

      const timestamp = new Date().toISOString();
      const eventData = {
        event: eventName,
        parameters: parameters || {},
        platform: Platform.OS,
        userId: this.currentUserId,
        timestamp
      };

      console.log(`📊 Analytics Event [${timestamp}]:`, eventData);

      // In a real implementation, you would send this to your analytics service
      // For now, we just log it to prevent any crashes
      
    } catch (error) {
      console.error('❌ Analytics: Error logging event:', eventName, error);
    }
  }

  async setUserId(userId: string | null) {
    try {
      this.currentUserId = userId;
      console.log('✅ Analytics: User ID set:', userId);
    } catch (error) {
      console.error('❌ Analytics: Error setting user ID:', error);
    }
  }

  async logScreenView(screenName: string) {
    await this.logEvent(ANALYTICS_EVENTS.SCREEN_VIEW, {
      screen_name: screenName
    });
  }

  async logLogin(method: string = 'email') {
    await this.logEvent(ANALYTICS_EVENTS.USER_LOGIN, { method });
  }

  async logSignUp(method: string = 'email') {
    await this.logEvent(ANALYTICS_EVENTS.USER_REGISTER, { method });
  }

  async logError(error: string, context?: string) {
    await this.logEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
      description: error,
      context: context || 'unknown'
    });
  }
}

// Create and export a singleton instance
export const analyticsService = new AnalyticsService();

// Export convenience functions with error handling
export const logEvent = async (eventName: string, parameters?: Record<string, any>) => {
  try {
    await analyticsService.logEvent(eventName, parameters);
  } catch (error) {
    console.error('❌ Analytics: Error in logEvent wrapper:', error);
  }
};

export const setUserId = async (userId: string | null) => {
  try {
    await analyticsService.setUserId(userId);
  } catch (error) {
    console.error('❌ Analytics: Error in setUserId wrapper:', error);
  }
};

export const logScreenView = async (screenName: string) => {
  try {
    await analyticsService.logScreenView(screenName);
  } catch (error) {
    console.error('❌ Analytics: Error in logScreenView wrapper:', error);
  }
};

export const logLogin = async (method?: string) => {
  try {
    await analyticsService.logLogin(method);
  } catch (error) {
    console.error('❌ Analytics: Error in logLogin wrapper:', error);
  }
};

export const logSignUp = async (method?: string) => {
  try {
    await analyticsService.logSignUp(method);
  } catch (error) {
    console.error('❌ Analytics: Error in logSignUp wrapper:', error);
  }
};

export const logError = async (error: string, context?: string) => {
  try {
    await analyticsService.logError(error, context);
  } catch (error) {
    console.error('❌ Analytics: Error in logError wrapper:', error);
  }
};

export default analyticsService;

console.log('📊 Analytics: Mobile-safe module loaded successfully');
