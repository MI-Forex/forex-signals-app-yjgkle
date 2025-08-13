
import { Platform } from 'react-native';

// Google Analytics 4 Web Configuration
const GA_MEASUREMENT_ID = 'G-N7VHTSM9QK';

// Web Analytics State
let gtag: any = null;
let isWebAnalyticsLoaded = false;
let analyticsQueue: Array<() => void> = [];

// Optimized async initialization for better performance
const initializeWebAnalytics = async () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && !isWebAnalyticsLoaded) {
    try {
      // Initialize dataLayer first
      (window as any).dataLayer = (window as any).dataLayer || [];
      gtag = function(...args: any[]) {
        (window as any).dataLayer.push(args);
      };

      // Load script asynchronously without blocking
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      
      script.onload = () => {
        try {
          gtag('js', new Date());
          gtag('config', GA_MEASUREMENT_ID, {
            page_title: document.title,
            page_location: window.location.href,
            send_page_view: true,
            // Optimize for performance
            transport_type: 'beacon',
            custom_map: {},
            // Additional performance optimizations
            allow_google_signals: false,
            allow_ad_personalization_signals: false
          });
          
          isWebAnalyticsLoaded = true;
          console.log('Analytics: Google Analytics 4 loaded successfully with ID:', GA_MEASUREMENT_ID);
          
          // Process queued events
          analyticsQueue.forEach(fn => {
            try {
              fn();
            } catch (error) {
              console.warn('Analytics: Error processing queued event:', error);
            }
          });
          analyticsQueue = [];
        } catch (error) {
          console.error('Analytics: Error configuring Google Analytics:', error);
        }
      };

      script.onerror = () => {
        console.warn('Analytics: Failed to load Google Analytics script');
        // Clear the queue if script fails to load
        analyticsQueue = [];
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error('Analytics: Error initializing web analytics:', error);
    }
  }
};

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
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      if (Platform.OS === 'web') {
        // Initialize web analytics asynchronously
        initializeWebAnalytics();
        this.isInitialized = true; // Set to true immediately for web
        console.log('Analytics: Web analytics initialization started');
      } else {
        // For native platforms, disable analytics for better performance
        console.log('Analytics: Native analytics disabled for optimal performance');
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('Analytics: Initialization error:', error);
    }
  }

  // Log custom events
  async logEvent(eventName: string, parameters?: { [key: string]: any }) {
    if (!this.isInitialized) {
      console.warn('Analytics: Service not initialized, skipping event:', eventName);
      return;
    }

    try {
      const sanitizedParams = this.sanitizeParameters(parameters);
      
      if (Platform.OS === 'web') {
        const executeEvent = () => {
          if (gtag && isWebAnalyticsLoaded) {
            gtag('event', eventName, sanitizedParams);
            console.log('Analytics: Web event logged:', eventName, sanitizedParams);
          }
        };

        if (isWebAnalyticsLoaded) {
          executeEvent();
        } else {
          // Queue event if analytics not loaded yet
          analyticsQueue.push(executeEvent);
        }
      } else {
        // For native platforms, just log to console for debugging
        console.log('Analytics: Event (native - console only):', eventName, sanitizedParams);
      }
    } catch (error) {
      console.error('Analytics: Error logging event:', eventName, error);
    }
  }

  // Set user properties
  async setUserProperties(properties: { [key: string]: string }) {
    if (!this.isInitialized) {
      console.warn('Analytics: Service not initialized, skipping user properties');
      return;
    }

    try {
      if (Platform.OS === 'web') {
        const executeUserProperties = () => {
          if (gtag && isWebAnalyticsLoaded) {
            // Set user properties using gtag
            Object.entries(properties).forEach(([key, value]) => {
              gtag('config', GA_MEASUREMENT_ID, {
                [`custom_parameter_${key}`]: value
              });
            });
            console.log('Analytics: Web user properties set:', properties);
          }
        };

        if (isWebAnalyticsLoaded) {
          executeUserProperties();
        } else {
          analyticsQueue.push(executeUserProperties);
        }
      } else {
        console.log('Analytics: User properties (native - console only):', properties);
      }
    } catch (error) {
      console.error('Analytics: Error setting user properties:', error);
    }
  }

  // Set user ID
  async setUserId(userId: string | null) {
    if (!this.isInitialized) {
      console.warn('Analytics: Service not initialized, skipping user ID');
      return;
    }

    try {
      if (Platform.OS === 'web') {
        const executeUserId = () => {
          if (gtag && isWebAnalyticsLoaded) {
            gtag('config', GA_MEASUREMENT_ID, {
              user_id: userId
            });
            console.log('Analytics: Web user ID set:', userId);
          }
        };

        if (isWebAnalyticsLoaded) {
          executeUserId();
        } else {
          analyticsQueue.push(executeUserId);
        }
      } else {
        console.log('Analytics: User ID (native - console only):', userId);
      }
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

  // Sanitize parameters to ensure they meet Firebase requirements
  private sanitizeParameters(parameters?: { [key: string]: any }): { [key: string]: any } {
    if (!parameters) return {};

    const sanitized: { [key: string]: any } = {};
    
    for (const [key, value] of Object.entries(parameters)) {
      // Firebase Analytics parameter names must be 40 characters or fewer
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
