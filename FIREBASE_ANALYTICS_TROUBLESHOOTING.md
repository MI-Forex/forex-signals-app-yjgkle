
# Firebase Analytics Troubleshooting Guide

This guide helps you diagnose and fix common issues with Firebase Analytics setup.

## Quick Diagnostics

### 1. Check Analytics State

```typescript
import analyticsService from './utils/analyticsUtils';

// Get current state
const state = analyticsService.getAnalyticsState();
console.log('Analytics State:', state);

// Expected output:
// {
//   isInitialized: true,
//   currentUserId: 'user_123' or null,
//   userProperties: {...},
//   platform: 'web' | 'ios' | 'android',
//   measurementId: 'G-N7VHTSM9QK',
//   queuedEvents: 0
// }
```

### 2. Run Analytics Test

```typescript
import { testAnalyticsSetup } from './utils/analyticsTest';

// Run comprehensive test
await testAnalyticsSetup();

// Check console for test results
```

### 3. Check Console Logs

Look for these key log messages:

**Successful Initialization:**
```
✅ Firebase: App initialized successfully
✅ Firebase: Auth initialized successfully
✅ Firebase: Firestore initialized successfully
✅ Analytics: Google Analytics 4 initialized successfully (web)
📱 Analytics: Using native Firebase Analytics for ios/android (native)
```

**Errors:**
```
❌ Firebase: Error initializing analytics: [error message]
❌ Analytics: Failed to initialize Google Analytics: [error message]
```

## Common Issues

### Issue 1: App Crashes on Startup (Native)

**Symptoms:**
- App crashes immediately on iOS or Android
- No screens render
- Error in native crash logs

**Possible Causes:**
1. Missing GoogleService-Info.plist (iOS) or google-services.json (Android)
2. Incorrect configuration in app.json
3. Firebase Analytics module imported on native platform

**Solutions:**

#### Check Configuration Files

**iOS:**
```bash
# Check if file exists
ls -la GoogleService-Info.plist

# Verify app.json
cat app.json | grep googleServicesFile
```

**Android:**
```bash
# Check if file exists
ls -la google-services.json

# Verify app.json
cat app.json | grep googleServicesFile
```

#### Verify app.json Configuration

```json
{
  "expo": {
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

#### Check for Incorrect Imports

**❌ WRONG:**
```typescript
import { getAnalytics } from 'firebase/analytics'; // Don't do this on native!
```

**✅ CORRECT:**
```typescript
// In firebase/config.ts
if (Platform.OS === 'web') {
  import('firebase/analytics').then(({ getAnalytics }) => {
    // Initialize analytics
  });
}
```

#### Rebuild the App

```bash
# Clear cache and rebuild
expo start --clear

# Or for native builds
expo prebuild --clean
```

### Issue 2: Analytics Not Working on Web

**Symptoms:**
- Events not logged
- No gtag function available
- No requests to google-analytics.com

**Possible Causes:**
1. Ad blocker blocking analytics
2. Script failed to load
3. Measurement ID incorrect
4. Browser privacy settings

**Solutions:**

#### Check Browser Console

```javascript
// Check if gtag is available
console.log('gtag available:', typeof window.gtag === 'function');

// Check dataLayer
console.log('dataLayer:', window.dataLayer);

// Check for errors
// Look for errors related to google-analytics.com
```

#### Disable Ad Blockers

1. Disable browser ad blockers
2. Disable privacy extensions
3. Try in incognito/private mode
4. Try different browser

#### Verify Script Loading

```javascript
// Check if script is in DOM
const scripts = document.querySelectorAll('script[src*="googletagmanager"]');
console.log('GA Scripts:', scripts.length);
```

#### Check Network Tab

1. Open browser DevTools
2. Go to Network tab
3. Filter by "google-analytics" or "gtag"
4. Look for requests to `https://www.googletagmanager.com/gtag/js`

#### Verify Measurement ID

```typescript
// In utils/analyticsUtils.ts
const GA_MEASUREMENT_ID = 'G-N7VHTSM9QK'; // Should match Firebase Console
```

### Issue 3: Events Not Appearing in Dashboard

**Symptoms:**
- Events logged in console
- No errors
- Events don't appear in Firebase Console or GA4

**Possible Causes:**
1. Data processing delay (24-48 hours)
2. Debug mode not enabled
3. Wrong project selected
4. Filters applied in dashboard

**Solutions:**

#### Wait for Data Processing

- **Real-time reports:** 5-10 minutes
- **Standard reports:** 24-48 hours
- **Custom reports:** Up to 48 hours

#### Enable Debug Mode

**Web:**
```javascript
// In browser console
window.gtag('config', 'G-N7VHTSM9QK', { 'debug_mode': true });
```

**iOS:**
```bash
# Add to Xcode scheme arguments
-FIRDebugEnabled
```

**Android:**
```bash
# Enable debug mode
adb shell setprop debug.firebase.analytics.app com.cnc.forexsignal

# View logs
adb logcat -s FA FA-SVC
```

#### Check Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `forex-abd77`
3. Go to Analytics → DebugView
4. Verify events appear in real-time

#### Check GA4 Dashboard

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select property with ID: `G-N7VHTSM9QK`
3. Go to Reports → Realtime
4. Verify events appear

### Issue 4: TypeScript Errors

**Symptoms:**
- TypeScript compilation errors
- Type errors in IDE
- Build fails

**Possible Causes:**
1. Missing type declarations
2. Incorrect imports
3. Type mismatches

**Solutions:**

#### Check Type Declarations

```typescript
// types/global.d.ts should exist and contain:
interface Window {
  dataLayer?: any[];
  gtag?: (...args: any[]) => void;
}
```

#### Verify tsconfig.json

```json
{
  "include": [
    "**/*.ts",
    "**/*.tsx",
    "types/**/*.d.ts"
  ]
}
```

#### Fix Import Errors

```typescript
// Use correct imports
import { logEvent, logLogin } from '../utils/analyticsUtils';

// Not
import { logEvent } from 'firebase/analytics'; // Wrong!
```

### Issue 5: User ID Not Tracking

**Symptoms:**
- User ID not set in analytics
- Events don't include user ID
- User properties not working

**Possible Causes:**
1. setUserId not called
2. Called before initialization
3. User ID cleared incorrectly

**Solutions:**

#### Verify setUserId Calls

```typescript
// In AuthContext after login
await setUserId(user.uid);

// After logout
await setUserId(null);
```

#### Check Timing

```typescript
// Wait for initialization
await analyticsService.waitForInitialization();
await setUserId(user.uid);
```

#### Verify in Console

```typescript
const state = analyticsService.getAnalyticsState();
console.log('Current User ID:', state.currentUserId);
```

### Issue 6: Events Not Queued Properly

**Symptoms:**
- Events logged before initialization are lost
- Some events missing
- Inconsistent event tracking

**Possible Causes:**
1. Events logged before initialization
2. Queue not processing
3. Initialization failed

**Solutions:**

#### Check Queue Status

```typescript
const state = analyticsService.getAnalyticsState();
console.log('Queued Events:', state.queuedEvents);
console.log('Is Initialized:', state.isInitialized);
```

#### Wait for Initialization

```typescript
// Before logging critical events
await analyticsService.waitForInitialization();
await logEvent('important_event', { data: 'value' });
```

#### Check Initialization

```typescript
// Verify initialization completed
if (!analyticsService.getAnalyticsState().isInitialized) {
  console.error('Analytics not initialized!');
}
```

### Issue 7: Performance Issues

**Symptoms:**
- App slow to start
- Lag when logging events
- High memory usage

**Possible Causes:**
1. Too many events logged
2. Large event parameters
3. Synchronous operations

**Solutions:**

#### Reduce Event Frequency

```typescript
// Use debouncing for frequent events
import { debounce } from 'lodash';

const logScrollEvent = debounce(() => {
  logEvent('scroll', { position: scrollY });
}, 1000);
```

#### Limit Parameter Size

```typescript
// Keep parameters small
await logEvent('user_action', {
  action: 'click',
  target: 'button_1' // Short values
});

// Not
await logEvent('user_action', {
  action: 'click',
  target: veryLongStringWithLotsOfData // Too large!
});
```

#### Use Async Operations

```typescript
// Don't await unless necessary
logEvent('background_event', { data: 'value' }); // Fire and forget

// Only await for critical events
await logEvent('critical_event', { data: 'value' });
```

## Platform-Specific Issues

### iOS Specific

#### Issue: GoogleService-Info.plist Not Found

**Solution:**
```bash
# Verify file exists
ls -la GoogleService-Info.plist

# Check file permissions
chmod 644 GoogleService-Info.plist

# Verify in app.json
cat app.json | grep -A 2 "ios"
```

#### Issue: Build Fails with Firebase Error

**Solution:**
```bash
# Clean build
cd ios
pod deintegrate
pod install
cd ..

# Rebuild
expo prebuild --clean
```

### Android Specific

#### Issue: google-services.json Not Found

**Solution:**
```bash
# Download from Firebase Console
# 1. Go to Project Settings
# 2. Select Android app
# 3. Download google-services.json
# 4. Place in project root

# Verify
ls -la google-services.json
```

#### Issue: Build Fails with Google Services Error

**Solution:**
```bash
# Clean build
cd android
./gradlew clean
cd ..

# Rebuild
expo prebuild --clean
```

### Web Specific

#### Issue: Content Security Policy Blocking Analytics

**Solution:**
```html
<!-- Add to index.html or configure in app.json -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
               connect-src 'self' https://www.google-analytics.com;">
```

## Getting Help

### Check Logs

**Web:**
```javascript
// Browser console
console.log('Analytics State:', analyticsService.getAnalyticsState());
```

**iOS:**
```bash
# Xcode console or
xcrun simctl spawn booted log stream --predicate 'subsystem contains "firebase"'
```

**Android:**
```bash
# Android Studio Logcat or
adb logcat -s FA FA-SVC
```

### Enable Verbose Logging

```typescript
// In firebase/config.ts
console.log('🔥 Firebase: Detailed initialization logs');

// In utils/analyticsUtils.ts
console.log('📊 Analytics: Detailed event logs');
```

### Contact Support

1. **Firebase Support:** https://firebase.google.com/support
2. **Google Analytics Support:** https://support.google.com/analytics
3. **Expo Forums:** https://forums.expo.dev/
4. **Stack Overflow:** Tag with `firebase`, `firebase-analytics`, `expo`

### Useful Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Analytics 4 Documentation](https://support.google.com/analytics)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Firebase](https://rnfirebase.io/)

## Prevention

### Best Practices

1. **Always test on all platforms** before deploying
2. **Use debug mode** during development
3. **Monitor console logs** for errors
4. **Keep configuration files** in version control (except sensitive data)
5. **Document custom events** and parameters
6. **Review analytics regularly** to ensure data quality
7. **Test after updates** to Firebase or Expo

### Code Review Checklist

- [ ] No direct imports of `firebase/analytics` on native
- [ ] Platform checks before web-only code
- [ ] Proper error handling
- [ ] Events logged with correct parameters
- [ ] User ID set/cleared appropriately
- [ ] No sensitive data in events
- [ ] Console logs for debugging
- [ ] TypeScript types correct

---

**Last Updated:** 2025-01-09
**Version:** 1.0.0
