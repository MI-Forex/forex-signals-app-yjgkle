
# Firebase Analytics Integration

## Overview

This app uses Firebase Analytics to track user behavior and app performance across web, iOS, and Android platforms.

## Quick Start

### For Developers

```typescript
// Import analytics functions
import { logEvent, logScreenView, setUserId } from './utils/analyticsUtils';

// Track screen view
useEffect(() => {
  logScreenView('MyScreen');
}, []);

// Track custom event
await logEvent('button_click', { button_name: 'submit' });

// Set user ID
await setUserId(user.uid);
```

### For QA/Testing

1. **Run the app** on your platform (web/iOS/Android)
2. **Check console logs** for analytics events (look for 📊 emoji)
3. **Enable debug mode** to see events in real-time
4. **Run analytics test**: `import { testAnalyticsSetup } from './utils/analyticsTest'; await testAnalyticsSetup();`

## Documentation

### Complete Guides

- **[Complete Setup Guide](./FIREBASE_ANALYTICS_COMPLETE_SETUP.md)** - Comprehensive setup instructions
- **[Quick Reference](./ANALYTICS_QUICK_REFERENCE.md)** - Quick reference for common tasks
- **[Troubleshooting Guide](./FIREBASE_ANALYTICS_TROUBLESHOOTING.md)** - Fix common issues
- **[Fix Summary](./FIREBASE_FIX_SUMMARY.md)** - What was fixed and why
- **[Checklist](./FIREBASE_ANALYTICS_CHECKLIST.md)** - Verification checklist

### Key Files

- `firebase/config.ts` - Firebase initialization
- `utils/analyticsUtils.ts` - Analytics service and helper functions
- `utils/analyticsTest.ts` - Testing utilities
- `contexts/AuthContext.tsx` - Auth with analytics integration
- `types/global.d.ts` - TypeScript declarations

## Platform Support

### ✅ Web
- Google Analytics 4 (GA4)
- Real-time event tracking
- View in GA4 dashboard

### ✅ iOS
- Native Firebase SDK
- Automatic event collection
- View in Firebase Console

### ✅ Android
- Native Firebase SDK
- Automatic event collection
- View in Firebase Console

## Configuration

### Firebase Project
- **Project ID:** `forex-abd77`
- **Measurement ID:** `G-N7VHTSM9QK`

### iOS
- **Bundle ID:** `com.cnc.forexsignal`
- **App ID:** `1:940152361938:ios:31a68add22dd613a9eee0b`
- **Config File:** `GoogleService-Info.plist` ✅

### Android
- **Package Name:** `com.cnc.forexsignal`
- **App ID:** `1:940152361938:android:a72b610bdcb1e2459eee0b`
- **Config File:** `google-services.json` ⚠️ (needs to be added)

## Tracked Events

### Automatic Events
- App open
- Screen views
- User engagement
- First open

### Custom Events
- User login/signup/logout
- Signal views and filters
- News views
- VIP upgrade attempts
- Chat interactions
- Admin actions
- Errors

## Testing

### Quick Test

```typescript
import { testAnalyticsSetup } from './utils/analyticsTest';
await testAnalyticsSetup();
```

### Check State

```typescript
import analyticsService from './utils/analyticsUtils';
console.log(analyticsService.getAnalyticsState());
```

### Enable Debug Mode

**Web:**
```javascript
window.gtag('config', 'G-N7VHTSM9QK', { 'debug_mode': true });
```

**iOS:**
Add `-FIRDebugEnabled` to Xcode scheme arguments

**Android:**
```bash
adb shell setprop debug.firebase.analytics.app com.cnc.forexsignal
```

## Viewing Data

### Google Analytics 4 (Web)
1. Go to https://analytics.google.com/
2. Select property: `G-N7VHTSM9QK`
3. View reports and real-time data

### Firebase Console (iOS/Android)
1. Go to https://console.firebase.google.com/
2. Select project: `forex-abd77`
3. Navigate to Analytics section
4. Use DebugView for real-time events

## Common Issues

### App crashes on native
- ✅ **Fixed:** Analytics now uses native SDKs on iOS/Android
- Check that config files are present

### Events not showing
- Wait 24-48 hours for data processing
- Enable debug mode for real-time view
- Check console logs for errors

### TypeScript errors
- ✅ **Fixed:** Type declarations added in `types/global.d.ts`
- Ensure tsconfig.json includes types directory

## Support

### Documentation
- Read the [Complete Setup Guide](./FIREBASE_ANALYTICS_COMPLETE_SETUP.md)
- Check the [Troubleshooting Guide](./FIREBASE_ANALYTICS_TROUBLESHOOTING.md)
- Review the [Quick Reference](./ANALYTICS_QUICK_REFERENCE.md)

### External Resources
- [Firebase Documentation](https://firebase.google.com/docs/analytics)
- [Google Analytics 4 Documentation](https://support.google.com/analytics)
- [Expo Documentation](https://docs.expo.dev/)

### Getting Help
1. Check console logs for errors
2. Run analytics test
3. Review troubleshooting guide
4. Check Firebase Console status
5. Contact Firebase support

## Status

### ✅ Completed
- Firebase initialization
- Analytics integration (web, iOS, Android)
- Event tracking
- User ID tracking
- Error logging
- Documentation
- Testing utilities
- TypeScript support

### ⚠️ Pending
- Add `google-services.json` for Android
- Test on physical devices
- Set up custom dashboards
- Configure alerts

## Version

**Version:** 1.0.0  
**Last Updated:** 2025-01-09  
**Status:** Production Ready (pending Android config file)

---

For detailed information, see the [Complete Setup Guide](./FIREBASE_ANALYTICS_COMPLETE_SETUP.md).
