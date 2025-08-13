
import { Platform } from 'react-native';

// Simple analytics service that logs to console for debugging
// This avoids the Firebase Analytics import issues while maintaining the same API

// Analytics event types
export interface AnalyticsEvent {
  name: string;
  parameters?: { [key: string]: any };
}

// Common analytics events for the Forex app
export const ANALYTICS_EVENTS = {
  // User events
  USER_LOGIN: 'user_login',
  USER_REGISTER: 'user_register',
  USER_LOGOUT: 'user_logout',
  
  // Signal events
  SIGNAL_VIEW: 'signal_view',
  SIGNAL_FILTER: 'signal_filter',
  SIGNAL_REFRESH: 'signal_refresh',
  
  // VIP events
  VIP_UPGRADE_ATTEMPT: 'vip_upgrade_attempt',
  VIP_WHATSAPP_OPEN: 'vip_whatsapp_open',
  VIP_FEATURES_VIEW: 'vip_features_view',
  
  // News events
  NEWS_VIEW: 'news_view',
  NEWS_READ: 'news_read',
  NEWS_REFRESH: 'news_refresh',
  
  // Analysis events
  ANALYSIS_VIEW: 'analysis_view',
  ANALYSIS_READ: 'analysis_read',
  ANALYSIS_REFRESH: 'analysis_refresh',
  
  // Admin events
  ADMIN_SIGNAL_CREATE: 'admin_signal_create',
  ADMIN_SIGNAL_EDIT: 'admin_signal_edit',
  ADMIN_SIGNAL_DELETE: 'admin_signal_delete',
  ADMIN_NEWS_CREATE: 'admin_news_create',
  ADMIN_NEWS_EDIT: 'admin_news_edit',
  ADMIN_NEWS_DELETE: 'admin_news_delete',
  ADMIN_USER_MANAGE: 'admin_user_manage',
  
  // Chat events
  CHAT_OPEN: 'chat_open',
  CHAT_MESSAGE_SEND: 'chat_message_send',
  
  // App events
  APP_OPEN: 'app_open',
  SCREEN_VIEW: 'screen_view',
  ERROR_OCCURRED: 'error_occurred'
};

class AnalyticsService {
  private isInitialized = true; // Always initialized for console logging
  private currentUserId: string | null = null;
  private userProperties: { [key: string]: string } = {};

  constructor() {
    console.log('Analytics: Service initialized with console logging');
  }

  // Log custom events
  async logEvent(eventName: string, parameters?: { [key: string]: any }) {
    try {
      const sanitizedParams = this.sanitizeParameters(parameters);
      const timestamp = new Date().toISOString();
      
      console.log(`📊 Analytics Event [${timestamp}]:`, {
        event: eventName,
        parameters: sanitizedParams,
        platform: Platform.OS,
        userId: this.currentUserId
      });

      // In a production app, you could send this data to your own analytics service
      // or use a web-compatible analytics solution like Google Analytics 4
      
    } catch (error) {
      console.error('Analytics: Error logging event:', eventName, error);
    }
  }

  // Set user properties
  async setUserProperties(properties: { [key: string]: string }) {
    try {
      this.userProperties = { ...this.userProperties, ...properties };
      console.log('📊 Analytics User Properties:', this.userProperties);
    } catch (error) {
      console.error('Analytics: Error setting user properties:', error);
    }
  }

  // Set user ID
  async setUserId(userId: string | null) {
    try {
      this.currentUserId = userId;
      console.log('📊 Analytics User ID set:', userId);
    } catch (error) {
      console.error('Analytics: Error setting user ID:', error);
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
      source: source
    });
  }

  // Log signal interactions
  async logSignalView(signalId: string, signalType: string, isVip: boolean = false) {
    await this.logEvent(ANALYTICS_EVENTS.SIGNAL_VIEW, {
      signal_id: signalId,
      signal_type: signalType,
      is_vip: isVip
    });
  }

  // Log news interactions
  async logNewsView(newsId: string, newsTitle: string) {
    await this.logEvent(ANALYTICS_EVENTS.NEWS_VIEW, {
      news_id: newsId,
      news_title: newsTitle
    });
  }

  // Log errors
  async logError(error: string, context?: string) {
    await this.logEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
      error_message: error,
      context: context || 'unknown'
    });
  }

  // Sanitize parameters to ensure they meet analytics requirements
  private sanitizeParameters(parameters?: { [key: string]: any }): { [key: string]: any } {
    if (!parameters) return {};

    const sanitized: { [key: string]: any } = {};
    
    for (const [key, value] of Object.entries(parameters)) {
      // Limit parameter names to 40 characters
      const sanitizedKey = key.substring(0, 40);
      
      // Convert values to appropriate types
      if (typeof value === 'string') {
        sanitized[sanitizedKey] = value.substring(0, 100); // Limit string length
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[sanitizedKey] = value;
      } else {
        sanitized[sanitizedKey] = String(value).substring(0, 100);
      }
    }
    
    return sanitized;
  }

  // Get current analytics state for debugging
  getAnalyticsState() {
    return {
      isInitialized: this.isInitialized,
      currentUserId: this.currentUserId,
      userProperties: this.userProperties,
      platform: Platform.OS
    };
  }
}

// Create and export a singleton instance
export const analyticsService = new AnalyticsService();

// Export convenience functions
export const logEvent = (eventName: string, parameters?: { [key: string]: any }) => 
  analyticsService.logEvent(eventName, parameters);

export const setUserProperties = (properties: { [key: string]: string }) => 
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
