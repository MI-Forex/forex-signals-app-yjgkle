
# Firebase Analytics Migration Guide

## Overview

This guide helps you migrate from the old Firebase Analytics setup (which was causing crashes) to the new, stable implementation.

## What Changed

### Before (Problematic)

**Issues:**
- App crashed on iOS/Android startup
- Analytics module loaded on native platforms
- Synchronous initialization blocking app startup
- No error handling
- No event queueing

**Old Code:**
```typescript
// firebase/config.ts (OLD - DON'T USE)
import { getAnalytics } from 'firebase/analytics'; // ❌ Crashes on native!

const analytics = getAnalytics(app); // ❌ Synchronous, blocks startup
export { analytics };
```

### After (Fixed)

**Improvements:**
- ✅ No crashes on any platform
- ✅ Platform-specific initialization
- ✅ Asynchronous loading
- ✅ Comprehensive error handling
- ✅ Event queueing before initialization
- ✅ Better TypeScript support
- ✅ Extensive logging for debugging

**New Code:**
```typescript
// firebase/config.ts (NEW - SAFE)
let analytics = null;

if (Platform.OS === 'web') {
  import('firebase/analytics') // ✅ Dynamic import
    .then(({ getAnalytics, isSupported }) => {
      return isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
        }
      });
    })
    .catch((error) => {
      console.error('Error initializing analytics:', error);
    });
}
```

## Migration Steps

### Step 1: Update Firebase Config

**Replace** `firebase/config.ts` with the new version:

<details>
<summary>View new firebase/config.ts</summary>

```typescript
// See the complete file in firebase/config.ts
// Key changes:
// 1. Platform detection
// 2. Dynamic imports for web only
// 3. Error handling
// 4. Comprehensive logging
```
</details>

### Step 2: Update Analytics Utils

**Replace** `utils/analyticsUtils.ts` with the new version:

<details>
<summary>View new analyticsUtils.ts</summary>

```typescript
// See the complete file in utils/analyticsUtils.ts
// Key changes:
// 1. AnalyticsService class
// 2. Event queueing
// 3. Platform-specific behavior
// 4. Better error handling
// 5. TypeScript improvements
```
</details>

### Step 3: Update AuthContext

**Update** `contexts/AuthContext.tsx` to integrate analytics:

```typescript
import { logLogin, logSignUp, setUserId, logError } from '../utils/analyticsUtils';

// In signIn function
await logLogin('email');

// In signUp function
await logSignUp('email');

// In handleUserSession
await setUserId(firebaseUser.uid);

// In logout
await setUserId(null);

// In error handlers
await logError(error.message, 'AuthContext');
```

### Step 4: Add Type Declarations

**Create** `types/global.d.ts`:

```typescript
interface Window {
  dataLayer?: any[];
  gtag?: (...args: any[]) => void;
}

declare const ErrorUtils: {
  setGlobalHandler: (handler: (error: Error, isFatal: boolean) => void) => void;
  getGlobalHandler: () => ((error: Error, isFatal: boolean) => void) | undefined;
};
```

**Update** `tsconfig.json`:

```json
{
  "include": [
    "**/*.ts",
    "**/*.tsx",
    "types/**/*.d.ts"
  ]
}
```

### Step 5: Update Error Logger

**Update** `utils/errorLogger.ts` to integrate with analytics:

```typescript
import { logError } from './analyticsUtils';

// In error handlers
await logError(error.message, 'ErrorLogger');
```

### Step 6: Add Screen Tracking

**Update** your screen components to track views:

```typescript
import { logScreenView } from '../utils/analyticsUtils';

export default function MyScreen() {
  useEffect(() => {
    logScreenView('MyScreen');
  }, []);
  
  // ... rest of component
}
```

### Step 7: Test Everything

**Run the analytics test:**

```typescript
import { testAnalyticsSetup } from './utils/analyticsTest';
await testAnalyticsSetup();
```

**Check console logs:**
- Look for ✅ success messages
- Look for ❌ error messages
- Verify platform-specific initialization

**Test on all platforms:**
- Web: Check browser console and Network tab
- iOS: Check Xcode console
- Android: Check Android Studio Logcat

## Breaking Changes

### 1. Analytics Import

**Before:**
```typescript
import { analytics } from '../firebase/config';
import { logEvent } from 'firebase/analytics';

logEvent(analytics, 'event_name', { param: 'value' });
```

**After:**
```typescript
import { logEvent } from '../utils/analyticsUtils';

await logEvent('event_name', { param: 'value' });
```

### 2. User ID Setting

**Before:**
```typescript
import { setUserId } from 'firebase/analytics';
import { analytics } from '../firebase/config';

setUserId(analytics, userId);
```

**After:**
```typescript
import { setUserId } from '../utils/analyticsUtils';

await setUserId(userId);
```

### 3. Screen Tracking

**Before:**
```typescript
import { logEvent } from 'firebase/analytics';
import { analytics } from '../firebase/config';

logEvent(analytics, 'screen_view', { screen_name: 'MyScreen' });
```

**After:**
```typescript
import { logScreenView } from '../utils/analyticsUtils';

await logScreenView('MyScreen');
```

## Code Search & Replace

Use these patterns to update your codebase:

### Find and Replace Patterns

1. **Analytics imports:**
   - Find: `import { .* } from 'firebase/analytics'`
   - Replace: `import { logEvent, logScreenView, setUserId } from '../utils/analyticsUtils'`

2. **logEvent calls:**
   - Find: `logEvent\(analytics, '(.+)', (.+)\)`
   - Replace: `await logEvent('$1', $2)`

3. **setUserId calls:**
   - Find: `setUserId\(analytics, (.+)\)`
   - Replace: `await setUserId($1)`

4. **Screen view tracking:**
   - Find: `logEvent\(analytics, 'screen_view', { screen_name: '(.+)' }\)`
   - Replace: `await logScreenView('$1')`

## Verification Checklist

After migration, verify:

- [ ] App starts without crashes on all platforms
- [ ] Console shows successful Firebase initialization
- [ ] Console shows successful Analytics initialization
- [ ] Events are logged correctly
- [ ] User ID is set/cleared appropriately
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Analytics test passes
- [ ] Events appear in dashboards (after 24-48 hours)

## Rollback Plan

If you need to rollback:

1. **Revert files:**
   ```bash
   git checkout HEAD~1 firebase/config.ts
   git checkout HEAD~1 utils/analyticsUtils.ts
   git checkout HEAD~1 contexts/AuthContext.tsx
   ```

2. **Remove new files:**
   ```bash
   rm types/global.d.ts
   rm utils/analyticsTest.ts
   ```

3. **Restore tsconfig.json:**
   ```bash
   git checkout HEAD~1 tsconfig.json
   ```

4. **Test the app:**
   ```bash
   expo start --clear
   ```

## Support During Migration

### Common Migration Issues

#### Issue: Import errors after migration

**Solution:**
```bash
# Clear cache
expo start --clear

# Reinstall dependencies
rm -rf node_modules
npm install
```

#### Issue: TypeScript errors

**Solution:**
```bash
# Restart TypeScript server in your IDE
# Or rebuild
npm run build
```

#### Issue: Events not working

**Solution:**
```typescript
// Check analytics state
import analyticsService from './utils/analyticsUtils';
console.log(analyticsService.getAnalyticsState());

// Run test
import { testAnalyticsSetup } from './utils/analyticsTest';
await testAnalyticsSetup();
```

### Getting Help

1. **Check documentation:**
   - [Complete Setup Guide](./FIREBASE_ANALYTICS_COMPLETE_SETUP.md)
   - [Troubleshooting Guide](./FIREBASE_ANALYTICS_TROUBLESHOOTING.md)
   - [Quick Reference](./ANALYTICS_QUICK_REFERENCE.md)

2. **Check console logs:**
   - Look for error messages
   - Check initialization logs
   - Verify event logs

3. **Run diagnostics:**
   ```typescript
   import { testAnalyticsSetup } from './utils/analyticsTest';
   await testAnalyticsSetup();
   ```

4. **Contact support:**
   - Firebase Support: https://firebase.google.com/support
   - Expo Forums: https://forums.expo.dev/

## Timeline

### Recommended Migration Timeline

**Day 1: Preparation**
- Read all documentation
- Backup current code
- Review changes

**Day 2: Implementation**
- Update Firebase config
- Update Analytics utils
- Update AuthContext
- Add type declarations

**Day 3: Testing**
- Test on web
- Test on iOS
- Test on Android
- Run analytics test

**Day 4: Verification**
- Check console logs
- Verify events in dashboards
- Test all features
- Document any issues

**Day 5: Deployment**
- Deploy to staging
- Monitor for issues
- Deploy to production
- Monitor analytics

## Post-Migration

### Monitoring

After migration, monitor:

1. **App stability:**
   - No crashes
   - No errors in logs
   - Smooth performance

2. **Analytics data:**
   - Events appearing in dashboards
   - User IDs tracked correctly
   - Screen views tracked
   - Custom events working

3. **User feedback:**
   - No user-reported issues
   - App functioning normally
   - Features working as expected

### Optimization

After successful migration:

1. **Review events:**
   - Remove unnecessary events
   - Add missing events
   - Optimize event parameters

2. **Set up dashboards:**
   - Create custom reports
   - Set up alerts
   - Share with team

3. **Document custom events:**
   - List all tracked events
   - Document parameters
   - Share with team

## Success Criteria

Migration is successful when:

- ✅ App runs without crashes on all platforms
- ✅ Analytics initializes correctly
- ✅ Events are tracked and appear in dashboards
- ✅ No errors in console
- ✅ All tests pass
- ✅ Team is trained on new system
- ✅ Documentation is complete

---

**Version:** 1.0.0  
**Last Updated:** 2025-01-09  
**Status:** Ready for Migration
