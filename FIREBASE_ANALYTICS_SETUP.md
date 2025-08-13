
# Firebase Google Analytics Integration Guide

This guide explains how Firebase Google Analytics has been integrated into your React Native + Expo 53 app for both Android and iOS builds.

## What's Been Implemented

### 1. Dependencies Installed
- `@react-native-firebase/app` - Core Firebase functionality for React Native
- `@react-native-firebase/analytics` - Firebase Analytics for React Native

### 2. Configuration Files

#### Android Setup
- **google-services.json**: Placed in `android/app/` directory
- **build.gradle (project-level)**: Added Google Services plugin
- **build.gradle (app-level)**: Added Google Services plugin and Firebase Analytics dependency

#### iOS Setup
- **GoogleService-Info.plist**: Placed in `ios/` directory
- **app.json**: Updated with Firebase plugins and configuration

### 3. Code Implementation

#### Firebase Configuration (`firebase/config.ts`)
- Updated to include Firebase Analytics initialization
- Platform-specific setup (web vs native)

#### Analytics Utility (`utils/analyticsUtils.ts`)
- Comprehensive analytics service with cross-platform support
- Pre-defined event constants for common app actions
- Methods for tracking user events, screen views, and errors

#### App Integration
- **AuthContext**: Integrated analytics tracking for user authentication events
- **App Layout**: Added app-level analytics initialization and screen tracking
- **VIP Screen**: Added analytics for VIP-related interactions
- **Signals Screen**: Added analytics for signal viewing and filtering

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
- **Web**: Uses Firebase Analytics SDK
- **iOS/Android**: Uses React Native Firebase Analytics

## Manual Setup Required

### Android
1. **Place google-services.json**: 
   - Download your actual `google-services.json` from Firebase Console
   - Replace the placeholder file in `android/app/google-services.json`

2. **Build Configuration**:
   - The Gradle files have been configured automatically
   - Run `expo prebuild -p android` to apply changes

### iOS
1. **Place GoogleService-Info.plist**:
   - Download your actual `GoogleService-Info.plist` from Firebase Console
   - Replace the placeholder file in `ios/GoogleService-Info.plist`
   - Ensure it's included in your Xcode project target

2. **CocoaPods**:
   - Run `cd ios && pod install` to install Firebase Analytics pod

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

### Debug Mode
1. **Android**: Use `adb shell setprop debug.firebase.analytics.app com.cncforexsignals.app`
2. **iOS**: Add `-FIRAnalyticsDebugEnabled` to your scheme's launch arguments

### Firebase Console
- Events appear in Firebase Console within 24 hours
- Use DebugView for real-time event monitoring during development

## Important Notes

1. **Privacy**: Ensure compliance with privacy laws (GDPR, CCPA) when collecting analytics data
2. **Data Retention**: Configure data retention settings in Firebase Console
3. **Event Limits**: Firebase Analytics has limits on custom events and parameters
4. **Testing**: Use Firebase DebugView for testing during development

## Troubleshooting

### Common Issues
1. **Events not appearing**: Check that Firebase is properly initialized and configuration files are correct
2. **iOS build issues**: Ensure GoogleService-Info.plist is added to Xcode project
3. **Android build issues**: Verify google-services.json is in the correct location

### Debugging
- Check console logs for Firebase initialization messages
- Use Firebase DebugView for real-time event monitoring
- Verify configuration files match your Firebase project settings

## Next Steps

1. Replace placeholder configuration files with your actual Firebase project files
2. Test analytics events in development using DebugView
3. Set up custom conversions and audiences in Firebase Console
4. Configure data export to BigQuery for advanced analytics (optional)
5. Set up Analytics Intelligence for automated insights (optional)
