
import { Platform } from 'react-native';

// Analytics event names for consistent tracking
export const ANALYTICS_EVENTS = {
  // User events
  USER_LOGIN: 'login',
  USER_REGISTER: 'sign_up',
  USER_LOGOUT: 'logout',
  
  // Screen views
  SCREEN_VIEW: 'screen_view',
  
  // Signal events
  SIGNAL_VIEW: 'view_item',
  SIGNAL_FILTER: 'filter_signals',
  
  // VIP events
  VIP_UPGRADE_ATTEMPT: 'begin_checkout',
  VIP_UPGRADE_SUCCESS: 'purchase',
  
  // News events
  NEWS_VIEW: 'select_content',
  
  // Admin events
  ADMIN_ACTION: 'admin_action',
  
  // Chat events
  CHAT_OPEN: 'chat_open',
  CHAT_MESSAGE_SENT: 'chat_message_sent',
  
  // Error events
  ERROR_OCCURRED: 'exception'
};

interface AnalyticsEvent {
  eventName: string;
  parameters?: Record<string, any>;
}

class AnalyticsService {
  private currentUserId: string | null = null;
  private userProperties: Record<string, string> = {};

  constructor() {
    console.log('📊 Analytics: Creating mobile-safe AnalyticsService for platform:', Platform.OS);
    console.log('📊 Analytics: Using console logging for event tracking');
  }

  // Log custom events - mobile-safe implementation
  async logEvent(eventName: string, parameters?: Record<string, any>) {
    try {
      const sanitizedParams = this.sanitizeParameters(parameters);
      const timestamp = new Date().toISOString();
      
      // Console logging for all platforms - mobile-safe
      console.log(`📊 Analytics Event [${timestamp}]:`, {
        event: eventName,
        parameters: sanitizedParams,
        platform: Platform.OS,
        userId: this.currentUserId
      });
    } catch (error) {
      console.error('❌ Analytics: Error logging event:', eventName, error);
    }
  }

  // Set user properties
  async setUserProperties(properties: Record<string, string>) {
    try {
      this.userProperties = { ...this.userProperties, ...properties };
      console.log('✅ Analytics: User Properties set:', this.userProperties);
    } catch (error) {
      console.error('❌ Analytics: Error setting user properties:', error);
    }
  }

  // Set user ID
  async setUserId(userId: string | null) {
    try {
      this.currentUserId = userId;
      console.log('✅ Analytics: User ID set:', userId);
    } catch (error) {
      console.error('❌ Analytics: Error setting user ID:', error);
    }
  }

  // Log screen view
  async logScreenView(screenName: string, screenClass?: string) {
    await this.logEvent(ANALYTICS_EVENTS.SCREEN_VIEW, {
      screen_name: screenName,
      screen_class: screenClass || screenName
    });
  }

  // Log user login
  async logLogin(method: string = 'email') {
    await this.logEvent(ANALYTICS_EVENTS.USER_LOGIN, {
      method: method
    });
  }

  // Log user registration
  async logSignUp(method: string = 'email') {
    await this.logEvent(ANALYTICS_EVENTS.USER_REGISTER, {
      method: method
    });
  }

  // Log VIP upgrade attempt
  async logVIPUpgradeAttempt(source: string = 'vip_screen') {
    await this.logEvent(ANALYTICS_EVENTS.VIP_UPGRADE_ATTEMPT, {
      currency: 'USD',
      value: 0,
      source: source
    });
  }

  // Log signal interactions
  async logSignalView(signalId: string, signalType: string, isVip: boolean = false) {
    await this.logEvent(ANALYTICS_EVENTS.SIGNAL_VIEW, {
      item_id: signalId,
      item_name: `${signalType} Signal`,
      item_category: 'forex_signal',
      item_variant: isVip ? 'vip' : 'normal'
    });
  }

  // Log news interactions
  async logNewsView(newsId: string, newsTitle: string) {
    await this.logEvent(ANALYTICS_EVENTS.NEWS_VIEW, {
      content_type: 'news',
      content_id: newsId,
      content_title: newsTitle
    });
  }

  // Log errors
  async logError(error: string, context?: string) {
    await this.logEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
      description: error,
      fatal: false,
      context: context || 'unknown'
    });
  }

  // Sanitize parameters to ensure they meet analytics requirements
  private sanitizeParameters(parameters?: Record<string, any>): Record<string, any> {
    if (!parameters) return {};

    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(parameters)) {
      // Limit parameter names to 40 characters and ensure valid format
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 40);
      
      // Convert values to appropriate types
      if (typeof value === 'string') {
        sanitized[sanitizedKey] = value.substring(0, 100);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[sanitizedKey] = value;
      } else if (value !== null && value !== undefined) {
        sanitized[sanitizedKey] = String(value).substring(0, 100);
      }
    }
    
    return sanitized;
  }

  // Get current analytics state for debugging
  getAnalyticsState() {
    return {
      currentUserId: this.currentUserId,
      userProperties: this.userProperties,
      platform: Platform.OS
    };
  }
}

// Create and export a singleton instance
export const analyticsService = new AnalyticsService();

// Export convenience functions
export const logEvent = (eventName: string, parameters?: Record<string, any>) => 
  analyticsService.logEvent(eventName, parameters);

export const setUserProperties = (properties: Record<string, string>) => 
  analyticsService.setUserProperties(properties);

export const setUserId = (userId: string | null) => 
  analyticsService.setUserId(userId);

export const logScreenView = (screenName: string, screenClass?: string) => 
  analyticsService.logScreenView(screenName, screenClass);

export const logLogin = (method?: string) => 
  analyticsService.logLogin(method);

export const logSignUp = (method?: string) => 
  analyticsService.logSignUp(method);

export const logVIPUpgradeAttempt = (source?: string) => 
  analyticsService.logVIPUpgradeAttempt(source);

export const logSignalView = (signalId: string, signalType: string, isVip?: boolean) => 
  analyticsService.logSignalView(signalId, signalType, isVip);

export const logNewsView = (newsId: string, newsTitle: string) => 
  analyticsService.logNewsView(newsId, newsTitle);

export const logError = (error: string, context?: string) => 
  analyticsService.logError(error, context);

export default analyticsService;

console.log('📊 Analytics: Mobile-safe module loaded successfully');
console.log('📊 Analytics: Platform:', Platform.OS);
