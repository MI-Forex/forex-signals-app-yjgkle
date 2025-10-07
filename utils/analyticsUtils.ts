
import { Platform } from 'react-native';

// Google Analytics 4 configuration with the correct measurement ID
const GA_MEASUREMENT_ID = 'G-N7VHTSM9QK';

console.log('📊 Analytics: Initializing with Measurement ID:', GA_MEASUREMENT_ID);
console.log('📊 Analytics: Platform:', Platform.OS);

// Analytics event types
export interface AnalyticsEvent {
  name: string;
  parameters?: { [key: string]: any };
}

// Common analytics events for the Forex app
export const ANALYTICS_EVENTS = {
  // User events
  USER_LOGIN: 'login',
  USER_REGISTER: 'sign_up',
  USER_LOGOUT: 'logout',
  
  // Signal events
  SIGNAL_VIEW: 'view_item',
  SIGNAL_FILTER: 'search',
  SIGNAL_REFRESH: 'refresh',
  
  // VIP events
  VIP_UPGRADE_ATTEMPT: 'begin_checkout',
  VIP_WHATSAPP_OPEN: 'contact_support',
  VIP_FEATURES_VIEW: 'view_promotion',
  
  // News events
  NEWS_VIEW: 'select_content',
  NEWS_READ: 'view_item',
  NEWS_REFRESH: 'refresh',
  
  // Analysis events
  ANALYSIS_VIEW: 'select_content',
  ANALYSIS_READ: 'view_item',
  ANALYSIS_REFRESH: 'refresh',
  
  // Admin events
  ADMIN_SIGNAL_CREATE: 'create_content',
  ADMIN_SIGNAL_EDIT: 'edit_content',
  ADMIN_SIGNAL_DELETE: 'delete_content',
  ADMIN_NEWS_CREATE: 'create_content',
  ADMIN_NEWS_EDIT: 'edit_content',
  ADMIN_NEWS_DELETE: 'delete_content',
  ADMIN_USER_MANAGE: 'manage_users',
  
  // Chat events
  CHAT_OPEN: 'open_chat',
  CHAT_MESSAGE_SEND: 'send_message',
  
  // App events
  APP_OPEN: 'app_open',
  SCREEN_VIEW: 'screen_view',
  ERROR_OCCURRED: 'exception'
};

// Global gtag function declaration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

class AnalyticsService {
  private isInitialized = false;
  private currentUserId: string | null = null;
  private userProperties: { [key: string]: string } = {};
  private eventQueue: Array<{ eventName: string; parameters?: any }>[] = [];

  constructor() {
    console.log('📊 Analytics: Creating AnalyticsService instance');
    this.initializeAnalytics();
  }

  private async initializeAnalytics() {
    console.log('📊 Analytics: Starting initialization for platform:', Platform.OS);
    
    if (Platform.OS === 'web') {
      try {
        console.log('📊 Analytics: Loading Google Analytics for web...');
        await this.loadGoogleAnalytics();
        this.isInitialized = true;
        console.log('✅ Analytics: Google Analytics 4 initialized successfully');
        console.log('📊 Analytics: Measurement ID:', GA_MEASUREMENT_ID);
        
        // Process queued events
        this.processEventQueue();
      } catch (error) {
        console.error('❌ Analytics: Failed to initialize Google Analytics:', error);
        this.fallbackToConsoleLogging();
      }
    } else {
      console.log('📊 Analytics: Using console logging for native platform');
      this.fallbackToConsoleLogging();
    }
  }

  private async loadGoogleAnalytics(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('📊 Analytics: Setting up dataLayer and gtag...');
        
        // Initialize dataLayer
        window.dataLayer = window.dataLayer || [];
        
        // Define gtag function
        window.gtag = function(...args: any[]) {
          window.dataLayer.push(arguments);
        };
        
        // Configure GA4
        window.gtag('js', new Date());
        window.gtag('config', GA_MEASUREMENT_ID, {
          send_page_view: false, // We'll handle page views manually
          transport_type: 'beacon',
          anonymize_ip: true
        });

        console.log('📊 Analytics: Loading GA4 script...');
        
        // Load GA4 script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
        
        script.onload = () => {
          console.log('✅ Analytics: Google Analytics script loaded successfully');
          resolve();
        };
        
        script.onerror = (error) => {
          console.error('❌ Analytics: Failed to load Google Analytics script:', error);
          reject(new Error('Failed to load Google Analytics script'));
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.error('❌ Analytics: Error in loadGoogleAnalytics:', error);
        reject(error);
      }
    });
  }

  private fallbackToConsoleLogging() {
    this.isInitialized = true;
    console.log('📊 Analytics: Using console logging fallback');
    this.processEventQueue();
  }

  private processEventQueue() {
    console.log('📊 Analytics: Processing event queue, items:', this.eventQueue.length);
    
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        this.logEvent(event.eventName, event.parameters);
      }
    }
  }

  // Log custom events
  async logEvent(eventName: string, ...params: any[]) {
    const parameters = params.length > 0 ? params[0] : undefined;
    
    if (!this.isInitialized) {
      console.log('📊 Analytics: Queueing event (not initialized yet):', eventName);
      this.eventQueue.push({ eventName, parameters });
      return;
    }

    try {
      const sanitizedParams = this.sanitizeParameters(parameters);
      const timestamp = new Date().toISOString();
      
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.gtag) {
        // Send to Google Analytics
        window.gtag('event', eventName, {
          ...sanitizedParams,
          custom_parameter_user_id: this.currentUserId,
          custom_parameter_platform: Platform.OS
        });
        
        console.log(`✅ GA4 Event [${timestamp}]:`, {
          event: eventName,
          parameters: sanitizedParams,
          measurementId: GA_MEASUREMENT_ID
        });
      } else {
        // Console logging for native platforms
        console.log(`📊 Analytics Event [${timestamp}]:`, {
          event: eventName,
          parameters: sanitizedParams,
          platform: Platform.OS,
          userId: this.currentUserId
        });
      }
    } catch (error) {
      console.error('❌ Analytics: Error logging event:', eventName, error);
    }
  }

  // Set user properties
  async setUserProperties(properties: { [key: string]: string }) {
    try {
      this.userProperties = { ...this.userProperties, ...properties };
      
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', GA_MEASUREMENT_ID, {
          custom_map: properties
        });
      }
      
      console.log('✅ Analytics: User Properties set:', this.userProperties);
    } catch (error) {
      console.error('❌ Analytics: Error setting user properties:', error);
    }
  }

  // Set user ID
  async setUserId(userId: string | null) {
    try {
      this.currentUserId = userId;
      
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', GA_MEASUREMENT_ID, {
          user_id: userId
        });
      }
      
      console.log('✅ Analytics: User ID set:', userId);
    } catch (error) {
      console.error('❌ Analytics: Error setting user ID:', error);
    }
  }

  // Log screen view
  async logScreenView(screenName: string, screenClass?: string) {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_title: screenName,
        page_location: window.location.href
      });
    }
    
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
      value: 0, // Will be set based on VIP pricing
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
  private sanitizeParameters(parameters?: { [key: string]: any }): { [key: string]: any } {
    if (!parameters) return {};

    const sanitized: { [key: string]: any } = {};
    
    for (const [key, value] of Object.entries(parameters)) {
      // Limit parameter names to 40 characters and ensure valid format
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 40);
      
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
      platform: Platform.OS,
      measurementId: GA_MEASUREMENT_ID,
      queuedEvents: this.eventQueue.length
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

// Log initialization complete
console.log('📊 Analytics: Module loaded successfully');
console.log('📊 Analytics: Measurement ID:', GA_MEASUREMENT_ID);
