
# Firebase Analytics Quick Reference

## Import Analytics Functions

```typescript
import { 
  logEvent, 
  logLogin, 
  logSignUp,
  logScreenView,
  logSignalView,
  logNewsView,
  logVIPUpgradeAttempt,
  logError,
  setUserId,
  setUserProperties,
  ANALYTICS_EVENTS 
} from '../utils/analyticsUtils';
```

## Common Usage Examples

### 1. Track User Login

```typescript
// After successful login
await logLogin('email');
```

### 2. Track User Registration

```typescript
// After successful registration
await logSignUp('email');
```

### 3. Track Screen Views

```typescript
// In your screen component
useEffect(() => {
  logScreenView('SignalsScreen');
}, []);
```

### 4. Track Custom Events

```typescript
// Track button click
await logEvent('button_click', {
  button_name: 'upgrade_to_vip',
  screen: 'vip_screen'
});

// Track filter change
await logEvent('filter_applied', {
  filter_type: 'currency_pair',
  filter_value: 'EUR/USD'
});
```

### 5. Track Signal Views

```typescript
await logSignalView(
  signal.id,           // Signal ID
  signal.type,         // 'BUY' or 'SELL'
  signal.isVip         // true/false
);
```

### 6. Track News Views

```typescript
await logNewsView(
  news.id,             // News ID
  news.title           // News title
);
```

### 7. Track VIP Upgrade Attempts

```typescript
await logVIPUpgradeAttempt('vip_screen');
```

### 8. Track Errors

```typescript
try {
  // Your code
} catch (error) {
  await logError(error.message, 'SignalsScreen');
}
```

### 9. Set User ID

```typescript
// After user logs in
await setUserId(user.uid);

// After user logs out
await setUserId(null);
```

### 10. Set User Properties

```typescript
await setUserProperties({
  user_type: userData.isVIP ? 'vip' : 'normal',
  user_role: userData.role,
  account_age_days: String(accountAgeDays)
});
```

## Predefined Event Names

Use these constants from `ANALYTICS_EVENTS`:

```typescript
ANALYTICS_EVENTS.USER_LOGIN           // 'login'
ANALYTICS_EVENTS.USER_REGISTER        // 'sign_up'
ANALYTICS_EVENTS.USER_LOGOUT          // 'logout'
ANALYTICS_EVENTS.SCREEN_VIEW          // 'screen_view'
ANALYTICS_EVENTS.SIGNAL_VIEW          // 'view_item'
ANALYTICS_EVENTS.SIGNAL_FILTER        // 'filter_signals'
ANALYTICS_EVENTS.VIP_UPGRADE_ATTEMPT  // 'begin_checkout'
ANALYTICS_EVENTS.VIP_UPGRADE_SUCCESS  // 'purchase'
ANALYTICS_EVENTS.NEWS_VIEW            // 'select_content'
ANALYTICS_EVENTS.ADMIN_ACTION         // 'admin_action'
ANALYTICS_EVENTS.CHAT_OPEN            // 'chat_open'
ANALYTICS_EVENTS.CHAT_MESSAGE_SENT    // 'chat_message_sent'
ANALYTICS_EVENTS.ERROR_OCCURRED       // 'exception'
```

## Best Practices

### ✅ DO

- Use predefined event names when available
- Keep parameter names short and descriptive
- Log important user actions
- Track errors for debugging
- Set user ID after login
- Clear user ID after logout

### ❌ DON'T

- Log sensitive information (passwords, tokens, etc.)
- Use very long parameter names (max 40 chars)
- Use very long parameter values (max 100 chars)
- Log too frequently (can impact performance)
- Import `firebase/analytics` directly on native platforms

## Platform Differences

### Web
- Events sent to Google Analytics 4
- Real-time tracking via gtag
- View in GA4 dashboard

### iOS/Android
- Events sent to Firebase Analytics
- Handled by native SDK
- View in Firebase Console
- Console logs for debugging

## Debugging

### Check Analytics State

```typescript
import analyticsService from '../utils/analyticsUtils';

const state = analyticsService.getAnalyticsState();
console.log('Analytics State:', state);
```

### Run Analytics Test

```typescript
import { testAnalyticsSetup } from '../utils/analyticsTest';

// Run test
await testAnalyticsSetup();
```

### Console Logs

Look for these prefixes in console:
- `📊 Analytics:` - General analytics logs
- `✅ GA4 Event:` - Web events sent to GA4
- `📱 Analytics:` - Native platform logs
- `❌ Analytics:` - Error logs

## Common Issues

### Issue: Events not showing up

**Solution:**
1. Check console for errors
2. Verify initialization: `analyticsService.getAnalyticsState()`
3. Wait 24-48 hours for data in dashboards
4. Check if ad blockers are enabled (web)

### Issue: App crashes on native

**Solution:**
1. Don't import `firebase/analytics` on native
2. Use provided helper functions only
3. Check GoogleService-Info.plist (iOS) or google-services.json (Android)

### Issue: TypeScript errors

**Solution:**
1. Make sure to import types: `Record<string, any>`
2. Use proper parameter types
3. Check function signatures in analyticsUtils.ts

## Resources

- [Firebase Analytics Documentation](https://firebase.google.com/docs/analytics)
- [Google Analytics 4 Documentation](https://support.google.com/analytics)
- [Complete Setup Guide](./FIREBASE_ANALYTICS_COMPLETE_SETUP.md)
