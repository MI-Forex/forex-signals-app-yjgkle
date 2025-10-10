
# Firebase Analytics Setup Guide

This guide explains how Firebase Analytics has been integrated into your React Native + Expo 53 app.

## What's Been Implemented

### 1. Firebase Analytics Integration
- **Platform**: Native iOS and Android (Web disabled for performance)
- **Package**: `@react-native-firebase/analytics`
- **Configuration**: Automatic initialization with Firebase config

### 2. Code Implementation

#### Analytics Utility (`utils/analyticsUtils.ts`)
- Firebase Analytics integration for native platforms
- Graceful fallback for web platform (console logging)
- Event tracking with parameter sanitization
- Cross-platform support with native-only tracking

#### Key Features
- **Native Only**: Analytics only work on iOS and Android for better performance
- **Auto-initialization**: Firebase Analytics initializes automatically
- **Error Handling**: Graceful fallbacks if Firebase Analytics fails to load
- **Parameter Sanitization**: Ensures parameters meet Firebase requirements

### 3. Required Dependencies
- `@react-native-firebase/app` - Core Firebase functionality
- `@react-native-firebase/analytics` - Firebase Analytics module
- Firebase configuration files (google-services.json, GoogleService-Info.plist)

## Event Tracking

The app tracks the following events on native platforms:
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

## Firebase Configuration

### 1. Android Setup
1. **google-services.json**: Place in `android/app/` directory
2. **Build Configuration**: Gradle plugins automatically configured
3. **Permissions**: No additional permissions required

### 2. iOS Setup
1. **GoogleService-Info.plist**: Place in iOS project root
2. **Build Configuration**: Automatically configured via Expo plugins
3. **Permissions**: No additional permissions required

### 3. Expo Configuration
The following plugins are configured in `app.json`:
```json
{
  "plugins": [
    "@react-native-firebase/app",
    "@react-native-firebase/analytics"
  ]
}
```

## Performance Optimizations

### 1. Native Only
- Analytics disabled on web for better performance
- Reduced bundle size for web builds
- Better mobile app performance

### 2. Automatic Initialization
- Firebase Analytics initializes automatically
- No manual setup required in app code
- Lazy loading for better startup performance

### 3. Error Handling
- Graceful fallbacks if Firebase fails
- Console logging for debugging
- No app crashes due to analytics errors

## Testing Analytics

### Native Testing
1. **Firebase Console**: Check Firebase Analytics dashboard
2. **DebugView**: Enable debug mode for real-time event tracking
3. **Device Logs**: Check device logs for analytics events

### Debug Mode
Enable debug mode in Firebase Console or use Firebase CLI for detailed event tracking.

## Firebase Console Setup

### 1. Firebase Project
1. Create or access your Firebase project
2. Enable Firebase Analytics
3. Configure data streams for iOS and Android

### 2. Event Configuration
1. Set up custom events in Firebase console
2. Configure conversions for important actions
3. Set up audiences based on user behavior

### 3. Data Retention
1. Configure data retention settings
2. Set up data export if needed
3. Configure privacy settings as required

## Privacy Compliance

### GDPR/CCPA Compliance
- Implement user consent if required
- Configure data retention policies
- Set up data deletion procedures if needed

### Data Collection
- Only native app analytics data is collected
- No web analytics to reduce data collection
- User can opt-out through device settings

## Troubleshooting

### Common Issues
1. **Events not appearing**: Check Firebase configuration files
2. **Build errors**: Verify Expo plugins are correctly configured
3. **Analytics not working**: Check device logs for Firebase errors

### Debugging
- Check device logs for Firebase messages
- Use Firebase DebugView for real-time event monitoring
- Verify configuration files are in correct locations

## Performance Benefits

### 1. Native Performance
- Optimized for mobile platforms
- Better battery life
- Reduced memory usage

### 2. Automatic Configuration
- No manual setup required
- Expo handles plugin configuration
- Automatic Firebase initialization

### 3. Web Performance
- No analytics overhead on web
- Faster web app loading
- Reduced web bundle size

## Next Steps

1. **Verify Setup**: Test analytics events in Firebase console
2. **Configure Events**: Set up custom events and conversions
3. **Set up Audiences**: Create user segments for better insights
4. **Monitor Performance**: Check app performance metrics
5. **Privacy Compliance**: Implement required privacy measures
