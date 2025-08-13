
# Google Analytics 4 Web Integration Guide

This guide explains how Google Analytics 4 (GA4) has been integrated into your React Native + Expo 53 app for web analytics with optimal performance.

## What's Been Implemented

### 1. Web-Only Analytics
- **Measurement ID**: `G-N7VHTSM9QK`
- **Platform**: Web only (native platforms use console logging for debugging)
- **Performance**: Optimized async loading to prevent blocking app startup

### 2. Code Implementation

#### Analytics Utility (`utils/analyticsUtils.ts`)
- Lightweight Google Analytics 4 integration
- Asynchronous script loading for optimal performance
- Event queuing system for events triggered before GA4 loads
- Cross-platform support with web-only tracking

#### Key Features
- **Async Loading**: GA4 script loads asynchronously without blocking app startup
- **Event Queuing**: Events are queued if triggered before GA4 is ready
- **Performance Optimized**: Uses `transport_type: 'beacon'` for better performance
- **Error Handling**: Graceful fallbacks if GA4 fails to load

### 3. Removed Dependencies
- Removed `@react-native-firebase/analytics` for better performance
- Removed `@react-native-firebase/app` dependency
- Removed Firebase Analytics plugins from app.json
- Cleaned up Firebase config to remove analytics imports

## Event Tracking

The app tracks the following events on web:
- User authentication (login, register, logout)
- Screen views and navigation
- Signal interactions (view, filter, refresh)
- VIP upgrade attempts and WhatsApp interactions
- News and analysis interactions
- Admin actions
- Chat interactions
- Error occurrences

## Usage Examples

### Track Custom Events
```typescript
import { logEvent, ANALYTICS_EVENTS } from '../utils/analyticsUtils';

// Track a custom event
await logEvent(ANALYTICS_EVENTS.SIGNAL_VIEW, {
  signal_id: 'signal_123',
  signal_type: 'BUY',
  is_vip: true
});
```

### Track Screen Views
```typescript
import { logScreenView } from '../utils/analyticsUtils';

// Track screen view
await logScreenView('Settings Screen');
```

### Set User Properties
```typescript
import { setUserProperties } from '../utils/analyticsUtils';

// Set user properties
await setUserProperties({
  user_role: 'vip',
  subscription_type: 'premium'
});
```

### Set User ID
```typescript
import { setUserId } from '../utils/analyticsUtils';

// Set user ID for tracking
await setUserId('user_123');
```

## Performance Optimizations

### 1. Async Script Loading
- GA4 script loads asynchronously with `defer` attribute
- No blocking of app startup or initial render

### 2. Event Queuing
- Events triggered before GA4 loads are queued
- Queued events are processed once GA4 is ready

### 3. Native Platform Optimization
- Analytics disabled on native platforms for better performance
- Console logging available for debugging on native platforms

### 4. Transport Optimization
- Uses `transport_type: 'beacon'` for better performance
- Optimized for minimal impact on user experience

## Testing Analytics

### Web Testing
1. **Real-time Reports**: Check Google Analytics Real-time reports
2. **DebugView**: Enable debug mode in GA4 for detailed event tracking
3. **Browser Console**: Check console logs for analytics events

### Debug Mode
Add `?debug_mode=true` to your URL or use browser developer tools to enable debug logging.

## Google Analytics 4 Setup

### 1. Google Analytics Account
1. Create or access your Google Analytics 4 property
2. Verify the measurement ID `G-N7VHTSM9QK` is correct
3. Configure data streams for your web app

### 2. Event Configuration
1. Set up custom events in GA4 interface
2. Configure conversions for important actions
3. Set up audiences based on user behavior

### 3. Data Retention
1. Configure data retention settings
2. Set up data export if needed
3. Configure privacy settings as required

## Privacy Compliance

### GDPR/CCPA Compliance
- Implement cookie consent if required
- Configure data retention policies
- Set up data deletion procedures if needed

### Data Collection
- Only web analytics data is collected
- No native app analytics to reduce data collection
- User can opt-out through browser settings

## Troubleshooting

### Common Issues
1. **Events not appearing**: Check measurement ID and network connectivity
2. **Script loading errors**: Check browser console for network errors
3. **Events not queued**: Verify event queuing system is working

### Debugging
- Check browser console for analytics messages
- Use GA4 DebugView for real-time event monitoring
- Verify measurement ID is correct

## Performance Benefits

### 1. Reduced Bundle Size
- Removed Firebase Analytics dependencies
- Smaller app bundle size
- Faster app startup

### 2. Optimized Loading
- Async script loading
- Non-blocking initialization
- Event queuing system

### 3. Native Performance
- No analytics overhead on native platforms
- Better battery life on mobile devices
- Reduced memory usage

## Next Steps

1. **Verify Setup**: Test analytics events in GA4 Real-time reports
2. **Configure Events**: Set up custom events and conversions in GA4
3. **Set up Audiences**: Create user segments for better insights
4. **Monitor Performance**: Check app performance metrics
5. **Privacy Compliance**: Implement required privacy measures
