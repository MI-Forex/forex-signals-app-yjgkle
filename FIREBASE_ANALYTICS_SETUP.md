
# Firebase Analytics Setup Guide - Expo Managed Workflow

This guide explains the Firebase Analytics implementation for your React Native + Expo 53 app that works within the Expo managed workflow.

## ✅ Build Errors Fixed

The following build errors have been resolved:
- **PluginError**: `@react-native-firebase/analytics` does not contain a valid config plugin
- **SyntaxError**: Cannot use import statement outside a module

## What's Been Implemented

### 1. Dependencies Updated
- **Removed**: `@react-native-firebase/app` and `@react-native-firebase/analytics` (incompatible with Expo managed workflow)
- **Using**: Web Firebase SDK (`firebase` package) for cross-platform analytics

### 2. Configuration Files

#### Expo Configuration (`app.json`)
```json
{
  "expo": {
    "plugins": [
      "expo-font",
      "expo-router"
    ],
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

**Note**: React Native Firebase plugins have been removed as they are incompatible with Expo managed workflow.

### 3. Code Implementation

#### Firebase Configuration (`firebase/config.ts`)
```typescript
// Analytics (web only in managed workflow)
let analytics = null;
if (Platform.OS === 'web') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log('Firebase: Analytics initialized successfully for web');
    }
  });
} else {
  console.log('Firebase: Analytics not available on native platforms in Expo managed workflow');
}
```

#### Analytics Utility (`utils/analyticsUtils.ts`)
- **Web Platform**: Full Firebase Analytics functionality
- **Native Platforms**: Console logging for development and debugging
- Pre-defined event constants for common app actions
- Cross-platform API that works consistently

#### App Integration
- **App Layout**: Screen tracking and app-level analytics
- **VIP Screen**: VIP upgrade and WhatsApp interaction tracking
- **Signals Screen**: Signal viewing and filtering analytics
- **All Screens**: Consistent analytics implementation

## Key Features

### Event Tracking
The app now tracks the following events:
- User authentication (login, register, logout)
- Screen views and navigation
- Signal interactions (view, filter, refresh)
- VIP upgrade attempts and WhatsApp interactions
- News and analysis interactions
- Admin actions
- Chat interactions
- Error occurrences

### User Properties
The analytics service sets user properties including:
- User role (user, admin, editor)
- VIP status
- Email verification status

### Cross-Platform Support
- **Web**: Full Firebase Analytics SDK functionality
- **iOS/Android**: Console logging (Firebase Analytics requires bare workflow for native platforms)

## Setup Required

### Configuration Files
1. **google-services.json** (Android):
   - Download from Firebase Console
   - Place in project root directory

2. **GoogleService-Info.plist** (iOS):
   - Download from Firebase Console  
   - Place in project root directory

### No Additional Build Steps
- No Gradle configuration needed
- No CocoaPods installation required
- Works with standard Expo managed workflow

### Firebase Console Setup
1. **Enable Analytics**: Ensure Analytics is enabled in your Firebase project
2. **Configure Events**: Set up custom events and conversions in Firebase Console
3. **Set up Audiences**: Create user segments based on tracked properties

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

## Testing Analytics

### Web Platform
- Events are sent to Firebase Analytics in real-time
- Use Firebase Console DebugView for testing
- Check browser console for analytics logs

### Native Platforms (Development)
- Events are logged to console for debugging
- Check Metro bundler logs or device logs
- Format: `Analytics: Native event (logged): event_name {parameters}`

### Firebase Console
- Web events appear in Firebase Console within 24 hours
- Native events are not sent to Firebase (console logging only)

## Important Notes

1. **Privacy**: Ensure compliance with privacy laws (GDPR, CCPA) when collecting analytics data
2. **Data Retention**: Configure data retention settings in Firebase Console
3. **Event Limits**: Firebase Analytics has limits on custom events and parameters
4. **Testing**: Use Firebase DebugView for testing during development

## Troubleshooting

### Build Errors Fixed ✅
1. **"Package does not contain a valid config plugin"**: Removed `@react-native-firebase` plugins from app.json
2. **"Cannot use import statement outside a module"**: Removed React Native Firebase dependencies
3. **Module resolution errors**: Using only web Firebase SDK

### Common Issues
1. **Web events not appearing**: Check Firebase configuration and browser console
2. **Native logging not working**: Check Metro bundler logs
3. **Configuration errors**: Verify Firebase project settings

### Debugging
- Check console for Firebase initialization messages
- Web: Use browser developer tools
- Native: Check Metro bundler or device logs
- Verify `firebase/config.ts` initialization

## Next Steps

1. **For Web Analytics**: 
   - Test events in Firebase Console DebugView
   - Set up custom conversions and audiences
   - Configure data export to BigQuery (optional)

2. **For Native Analytics in Production**:
   - Consider ejecting to bare workflow for full Firebase Analytics
   - Implement custom analytics backend
   - Use alternative services (Amplitude, Mixpanel)

3. **Development**:
   - Monitor console logs for analytics events
   - Test analytics flows on web platform
   - Ensure consistent API usage across platforms

## Platform Limitations

### Expo Managed Workflow
- **Web**: Full Firebase Analytics support ✅
- **Native**: Console logging only ⚠️
- **Reason**: React Native Firebase requires bare workflow

### For Full Native Analytics
- Eject to bare workflow with `expo eject`
- Use EAS Build with custom config plugins
- Implement alternative analytics solution
