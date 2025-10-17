
# Firebase Analytics Setup Checklist

Use this checklist to verify that Firebase Analytics is properly set up and working on all platforms.

## Pre-Flight Checks

### Firebase Configuration

- [x] Firebase project created: `forex-abd77`
- [x] Firebase configuration added to `firebase/config.ts`
- [x] API Key: `AIzaSyBBFfFd1SFCrRxOpQ02TpAOFtMau1rECtg`
- [x] Project ID: `forex-abd77`
- [x] Measurement ID: `G-N7VHTSM9QK`

### iOS Configuration

- [x] `GoogleService-Info.plist` present in project root
- [x] iOS app ID configured: `1:940152361938:ios:31a68add22dd613a9eee0b`
- [x] `app.json` references GoogleService-Info.plist
- [x] Bundle identifier: `com.cnc.forexsignal`

### Android Configuration

- [ ] `google-services.json` present in project root (NEEDS TO BE ADDED)
- [ ] Android app ID configured: `1:940152361938:android:a72b610bdcb1e2459eee0b`
- [ ] `app.json` references google-services.json
- [ ] Package name: `com.cnc.forexsignal`

### Code Files

- [x] `firebase/config.ts` - Firebase initialization
- [x] `utils/analyticsUtils.ts` - Analytics service
- [x] `utils/analyticsTest.ts` - Testing utilities
- [x] `utils/errorLogger.ts` - Error logging
- [x] `contexts/AuthContext.tsx` - Auth with analytics
- [x] `types/global.d.ts` - TypeScript declarations

### Documentation

- [x] `FIREBASE_ANALYTICS_COMPLETE_SETUP.md` - Complete guide
- [x] `ANALYTICS_QUICK_REFERENCE.md` - Quick reference
- [x] `FIREBASE_FIX_SUMMARY.md` - Fix summary
- [x] `FIREBASE_ANALYTICS_CHECKLIST.md` - This checklist

## Testing Checklist

### Web Platform

#### Initial Load
- [ ] App loads without errors
- [ ] Console shows: `🔥 Firebase: Initializing Firebase app for platform: web`
- [ ] Console shows: `✅ Firebase: App initialized successfully`
- [ ] Console shows: `📊 Analytics: Loading Google Analytics for web...`
- [ ] Console shows: `✅ Firebase: Analytics initialized successfully`

#### Analytics Events
- [ ] Login event tracked
- [ ] Screen view events tracked
- [ ] Custom events tracked
- [ ] Events visible in browser Network tab (requests to google-analytics.com)

#### Browser Console
- [ ] No error messages
- [ ] Analytics events logged with `✅ GA4 Event` prefix
- [ ] User ID set correctly

#### Google Analytics Dashboard
- [ ] Events appear in GA4 dashboard (may take 24-48 hours)
- [ ] Real-time view shows active users
- [ ] Custom events visible

### iOS Platform

#### Initial Load
- [ ] App loads without errors
- [ ] Console shows: `🔥 Firebase: Initializing Firebase app for platform: ios`
- [ ] Console shows: `✅ Firebase: App initialized successfully`
- [ ] Console shows: `📱 Firebase: Analytics will use native SDK for ios`
- [ ] Console shows: `📱 Analytics: Using native Firebase Analytics for ios`

#### Analytics Events
- [ ] Login event logged to console
- [ ] Screen view events logged to console
- [ ] Custom events logged to console
- [ ] Events show `📊 Analytics Event` prefix

#### Xcode Console
- [ ] No crash logs
- [ ] Firebase SDK logs visible
- [ ] Analytics events logged

#### Firebase Console
- [ ] Events appear in Firebase Analytics (may take 24 hours)
- [ ] DebugView shows events (if debug mode enabled)
- [ ] User properties visible

### Android Platform

#### Initial Load
- [ ] App loads without errors
- [ ] Console shows: `🔥 Firebase: Initializing Firebase app for platform: android`
- [ ] Console shows: `✅ Firebase: App initialized successfully`
- [ ] Console shows: `📱 Firebase: Analytics will use native SDK for android`
- [ ] Console shows: `📱 Analytics: Using native Firebase Analytics for android`

#### Analytics Events
- [ ] Login event logged to console
- [ ] Screen view events logged to console
- [ ] Custom events logged to console
- [ ] Events show `📊 Analytics Event` prefix

#### Android Studio Console
- [ ] No crash logs
- [ ] Firebase SDK logs visible
- [ ] Analytics events logged

#### Firebase Console
- [ ] Events appear in Firebase Analytics (may take 24 hours)
- [ ] DebugView shows events (if debug mode enabled)
- [ ] User properties visible

## Functional Testing

### User Authentication
- [ ] Login tracked: `await logLogin('email')`
- [ ] Signup tracked: `await logSignUp('email')`
- [ ] User ID set on login
- [ ] User ID cleared on logout

### Screen Navigation
- [ ] Screen views tracked on navigation
- [ ] Screen names correct
- [ ] Screen class names correct

### Signal Interactions
- [ ] Signal view tracked
- [ ] Signal filter tracked
- [ ] Signal parameters correct (id, type, isVip)

### VIP Features
- [ ] VIP upgrade attempt tracked
- [ ] VIP upgrade success tracked (if implemented)
- [ ] Source parameter correct

### News Interactions
- [ ] News view tracked
- [ ] News ID and title correct

### Error Handling
- [ ] Errors logged to analytics
- [ ] Error context included
- [ ] Global errors caught
- [ ] Promise rejections caught

## Performance Checks

### App Startup
- [ ] App starts quickly (< 3 seconds)
- [ ] No blocking during analytics initialization
- [ ] Events queued if analytics not ready

### Runtime Performance
- [ ] No lag when logging events
- [ ] No memory leaks
- [ ] No excessive console logging in production

### Network Usage
- [ ] Analytics requests batched (web)
- [ ] Reasonable network usage
- [ ] Works offline (events queued)

## Debug Mode Testing

### iOS Debug Mode
```bash
# Enable debug mode
# Add -FIRDebugEnabled to Xcode scheme arguments

# Or via command line
xcrun simctl spawn booted log stream --predicate 'subsystem contains "com.google.firebase"'
```

- [ ] Debug logs visible
- [ ] Events appear in Firebase DebugView
- [ ] Real-time event tracking works

### Android Debug Mode
```bash
# Enable debug mode
adb shell setprop debug.firebase.analytics.app com.cnc.forexsignal

# View logs
adb logcat -s FA FA-SVC
```

- [ ] Debug logs visible
- [ ] Events appear in Firebase DebugView
- [ ] Real-time event tracking works

### Web Debug Mode
```javascript
// In browser console
window.gtag('config', 'G-N7VHTSM9QK', { 'debug_mode': true });
```

- [ ] Debug mode enabled
- [ ] Events visible in GA4 DebugView
- [ ] Real-time event tracking works

## Automated Testing

### Run Analytics Test
```typescript
import { testAnalyticsSetup } from './utils/analyticsTest';
await testAnalyticsSetup();
```

- [ ] All tests pass
- [ ] No errors in console
- [ ] Analytics state correct

### Check Analytics State
```typescript
import analyticsService from './utils/analyticsUtils';
const state = analyticsService.getAnalyticsState();
console.log('Analytics State:', state);
```

- [ ] `isInitialized: true`
- [ ] `currentUserId` set correctly
- [ ] `queuedEvents: 0` (after initialization)
- [ ] `measurementId` correct

## Production Readiness

### Code Quality
- [ ] No console.error messages
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] All imports correct

### Security
- [ ] No sensitive data in events
- [ ] User data anonymized where needed
- [ ] API keys properly configured
- [ ] RLS policies in place

### Documentation
- [ ] All documentation files present
- [ ] README updated (if needed)
- [ ] Comments in code clear
- [ ] Examples provided

### Monitoring
- [ ] Error tracking set up
- [ ] Analytics dashboard configured
- [ ] Alerts configured (optional)
- [ ] Team has access to dashboards

## Common Issues Resolution

### Issue: App crashes on startup
- [ ] Check Firebase initialization logs
- [ ] Verify configuration files present
- [ ] Check for import errors
- [ ] Review error logs

### Issue: Analytics not working on web
- [ ] Check browser console for errors
- [ ] Verify gtag script loaded
- [ ] Check for ad blockers
- [ ] Verify measurement ID

### Issue: Analytics not working on native
- [ ] Verify GoogleService-Info.plist (iOS) or google-services.json (Android)
- [ ] Check app.json configuration
- [ ] Rebuild app after adding config files
- [ ] Check Firebase Console for app registration

### Issue: Events not appearing in dashboard
- [ ] Wait 24-48 hours for data
- [ ] Check debug mode
- [ ] Verify events are being logged
- [ ] Check Firebase Console project settings

## Sign-Off

### Developer
- [ ] All code changes reviewed
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Ready for testing

**Developer Name:** _______________
**Date:** _______________

### QA
- [ ] Tested on web
- [ ] Tested on iOS
- [ ] Tested on Android
- [ ] All checklist items verified

**QA Name:** _______________
**Date:** _______________

### Product Owner
- [ ] Analytics requirements met
- [ ] Events tracking correctly
- [ ] Dashboards configured
- [ ] Ready for production

**PO Name:** _______________
**Date:** _______________

## Notes

Add any additional notes, issues, or observations here:

---

**Last Updated:** 2025-01-09
**Version:** 1.0.0
