
# Firebase Analytics Complete Setup Guide

This guide explains how Firebase Analytics is configured in this app for both web and native (iOS/Android) platforms.

## Overview

Firebase Analytics is implemented differently for web and native platforms:

- **Web**: Uses Firebase Analytics SDK with Google Analytics 4 (GA4)
- **iOS**: Uses native Firebase SDK via GoogleService-Info.plist
- **Android**: Uses native Firebase SDK via google-services.json

## Configuration Files

### 1. Firebase Config (`firebase/config.ts`)

The main Firebase configuration file initializes:
- Firebase App
- Authentication (with platform-specific persistence)
- Firestore
- Storage
- Analytics (web only, via dynamic import)

**Key Features:**
- Platform detection using `Platform.OS`
- Dynamic import of analytics module for web only
- Proper error handling and logging
- No analytics initialization on native platforms (handled by native SDKs)

### 2. Analytics Utils (`utils/analyticsUtils.ts`)

Provides a unified analytics interface for all platforms:

**Features:**
- Event tracking with automatic platform detection
- User property management
- Screen view tracking
- Predefined event types (login, signup, VIP upgrade, etc.)
- Event queueing before initialization
- Parameter sanitization
- Console logging fallback for native platforms

**Usage Example:**
```typescript
import { logEvent, logLogin, logScreenView, setUserId } from '../utils/analyticsUtils';

// Log custom event
await logEvent('button_click', { button_name: 'upgrade_vip' });

// Log predefined events
await logLogin('email');
await logScreenView('SignalsScreen');

// Set user ID
await setUserId(user.uid);
```

## Platform-Specific Setup

### Web Platform

**Automatic Setup:**
1. Google Analytics 4 script is loaded dynamically
2. `gtag` function is initialized
3. Events are sent to GA4 with measurement ID: `G-N7VHTSM9QK`

**Configuration:**
- Measurement ID: `G-N7VHTSM9QK`
- Page views: Manual (not automatic)
- Transport: Beacon
- IP Anonymization: Enabled

### iOS Platform

**Required Files:**
- `GoogleService-Info.plist` (already configured in project root)

**Configuration in app.json:**
```json
{
  "ios": {
    "googleServicesFile": "./GoogleService-Info.plist"
  }
}
```

**Native Analytics:**
- Events are automatically collected by Firebase SDK
- Custom events logged via console for debugging
- No additional code needed

### Android Platform

**Required Files:**
- `google-services.json` (needs to be added to project root)

**Configuration in app.json:**
```json
{
  "android": {
    "googleServicesFile": "./google-services.json"
  }
}
```

**Native Analytics:**
- Events are automatically collected by Firebase SDK
- Custom events logged via console for debugging
- No additional code needed

## Getting google-services.json for Android

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `forex-abd77`
3. Click on the Android app or add a new Android app
4. Download `google-services.json`
5. Place it in the project root directory

## Analytics Events

### Predefined Events

The app tracks the following events:

**User Events:**
- `login` - User signs in
- `sign_up` - User registers
- `logout` - User signs out

**Screen Views:**
- `screen_view` - User navigates to a screen

**Signal Events:**
- `view_item` - User views a signal
- `filter_signals` - User filters signals

**VIP Events:**
- `begin_checkout` - User attempts VIP upgrade
- `purchase` - VIP upgrade successful

**News Events:**
- `select_content` - User views news article

**Admin Events:**
- `admin_action` - Admin performs action

**Chat Events:**
- `chat_open` - User opens chat
- `chat_message_sent` - User sends message

**Error Events:**
- `exception` - Error occurred

### Custom Event Parameters

All events include:
- `custom_parameter_user_id` - Current user ID
- `custom_parameter_platform` - Platform (web/ios/android)
- Event-specific parameters

## Debugging

### Console Logs

The analytics system provides detailed console logs:

**Initialization:**
```
📊 Analytics: Creating AnalyticsService instance for platform: ios
📊 Analytics: Starting initialization...
📱 Analytics: Using native Firebase Analytics for ios
```

**Events:**
```
📊 Analytics Event [2025-01-09T14:30:00.000Z]: {
  event: 'login',
  parameters: { method: 'email' },
  platform: 'ios',
  userId: 'abc123'
}
```

**Web Events:**
```
✅ GA4 Event [2025-01-09T14:30:00.000Z]: {
  event: 'login',
  parameters: { method: 'email' },
  measurementId: 'G-N7VHTSM9QK'
}
```

### Checking Analytics State

```typescript
import analyticsService from '../utils/analyticsUtils';

const state = analyticsService.getAnalyticsState();
console.log('Analytics State:', state);
```

## Integration with AuthContext

The AuthContext automatically tracks:
- User login events
- User signup events
- User ID changes
- Authentication errors

## Best Practices

1. **Always use the provided helper functions** instead of calling analytics directly
2. **Log screen views** when users navigate to important screens
3. **Track user actions** that are important for business metrics
4. **Use predefined event names** from `ANALYTICS_EVENTS` when possible
5. **Keep parameter names short** (max 40 characters)
6. **Keep parameter values short** (max 100 characters)
7. **Don't log sensitive information** (passwords, tokens, etc.)

## Troubleshooting

### App Crashes on Native Platforms

**Problem:** App crashes when trying to use Firebase Analytics on iOS/Android

**Solution:** 
- Make sure you're not importing `firebase/analytics` on native platforms
- The current implementation uses dynamic imports for web only
- Native platforms use native SDKs automatically

### Analytics Not Working on Web

**Problem:** Events not showing up in Google Analytics

**Solution:**
1. Check browser console for errors
2. Verify measurement ID is correct: `G-N7VHTSM9QK`
3. Check if ad blockers are blocking analytics
4. Wait 24-48 hours for data to appear in GA4 dashboard

### Analytics Not Working on Native

**Problem:** Events not showing up in Firebase Console

**Solution:**
1. Verify `GoogleService-Info.plist` (iOS) or `google-services.json` (Android) is present
2. Check if files are properly configured in `app.json`
3. Rebuild the app after adding configuration files
4. Check Firebase Console for debug view (enable debug mode in app)

## Testing

### Web Testing

1. Open browser developer tools
2. Check console for analytics logs
3. Check Network tab for requests to `google-analytics.com`
4. Use [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger) extension

### Native Testing

1. Check Xcode/Android Studio console for analytics logs
2. Enable Firebase Analytics debug mode:
   - iOS: Add `-FIRDebugEnabled` to launch arguments
   - Android: Run `adb shell setprop debug.firebase.analytics.app <package_name>`
3. Use Firebase Console DebugView

## Firebase Console

View analytics data:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `forex-abd77`
3. Navigate to Analytics section
4. View events, users, and other metrics

## Support

For issues or questions:
1. Check Firebase documentation: https://firebase.google.com/docs/analytics
2. Check Google Analytics 4 documentation: https://support.google.com/analytics
3. Review console logs for error messages
4. Check this guide for troubleshooting steps
