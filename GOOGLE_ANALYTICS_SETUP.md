
# Google Analytics 4 Setup Guide

This document explains how Google Analytics 4 (GA4) tracking has been implemented in the CNC Forex Signals app using measurement ID: `G-N7VHTSM9QK`.

## Overview

The app uses a hybrid analytics approach:
- **Web Platform**: Full Google Analytics 4 integration with gtag.js
- **Native Platforms**: Console-based logging with the same event structure

## Configuration

### Measurement ID
- **GA4 Measurement ID**: `G-N7VHTSM9QK`
- **Platform Support**: Web (full), iOS/Android (console logging)

### Files Modified
1. `utils/analyticsUtils.ts` - Main analytics service
2. `app.json` - Expo configuration with GA4 settings
3. `contexts/AuthContext.tsx` - User event tracking
4. `utils/analyticsTest.ts` - Testing utilities

## Features

### Automatic Tracking
- **Screen Views**: Automatically tracked when navigating between screens
- **User Authentication**: Login, registration, and logout events
- **User Properties**: Role, VIP status, email verification status
- **Error Tracking**: Automatic error logging with context

### Custom Events
- **Signal Interactions**: View, filter, refresh signals
- **VIP Events**: Upgrade attempts, WhatsApp contact, feature views
- **News Events**: View, read, refresh news articles
- **Analysis Events**: View, read, refresh analysis content
- **Admin Events**: Content creation, editing, deletion
- **Chat Events**: Open chat, send messages

### Event Categories
All events follow GA4 recommended event naming:
- `login` - User authentication
- `sign_up` - User registration
- `view_item` - Content viewing
- `search` - Filtering/searching
- `begin_checkout` - VIP upgrade attempts
- `screen_view` - Page/screen navigation

## Implementation Details

### Web Platform
```javascript
// GA4 script is loaded asynchronously
// Events are sent using gtag() function
window.gtag('event', 'login', {
  method: 'email'
});
```

### Native Platforms
```javascript
// Events are logged to console with structured format
console.log('📊 Analytics Event:', {
  event: 'login',
  parameters: { method: 'email' },
  platform: 'ios',
  userId: 'user123'
});
```

### Event Queue
- Events triggered before GA4 initialization are queued
- Queue is processed once analytics is ready
- Prevents event loss during app startup

## Usage Examples

### Basic Event Logging
```javascript
import { logEvent } from '../utils/analyticsUtils';

// Log custom event
await logEvent('button_click', {
  button_name: 'upgrade_to_vip',
  screen_name: 'vip_screen'
});
```

### Screen View Tracking
```javascript
import { logScreenView } from '../utils/analyticsUtils';

// Track screen view
await logScreenView('signals_screen');
```

### User Property Setting
```javascript
import { setUserProperties, setUserId } from '../utils/analyticsUtils';

// Set user ID
await setUserId('user123');

// Set user properties
await setUserProperties({
  user_role: 'vip',
  subscription_status: 'active'
});
```

## Testing

### Analytics Test Functions
```javascript
import { testAnalytics, validateAnalyticsConfig } from '../utils/analyticsTest';

// Test all analytics functionality
await testAnalytics();

// Validate configuration
const isValid = validateAnalyticsConfig();
```

### Debug Information
```javascript
import { analyticsService } from '../utils/analyticsUtils';

// Get current analytics state
const state = analyticsService.getAnalyticsState();
console.log('Analytics State:', state);
```

## Privacy & Compliance

### Data Collection
- **User ID**: Firebase UID (when authenticated)
- **User Properties**: Role, VIP status, email verification
- **Custom Events**: App interactions and user behavior
- **Screen Views**: Navigation patterns

### Privacy Features
- **IP Anonymization**: Enabled by default
- **No PII**: Personal information is not tracked
- **Consent**: Consider implementing consent management
- **Data Retention**: Follows GA4 default retention policies

## Monitoring & Debugging

### Console Logs
All analytics events are logged to console with emoji prefixes:
- 📊 Analytics events and state changes
- ✅ Successful operations
- ❌ Errors and failures
- 🧪 Test operations

### Error Handling
- Failed GA4 initialization falls back to console logging
- Network errors are handled gracefully
- Event queue prevents data loss

## Best Practices

### Event Naming
- Use GA4 recommended event names when possible
- Keep parameter names under 40 characters
- Use snake_case for parameter names
- Limit string values to 100 characters

### Performance
- Asynchronous script loading
- Event queuing for delayed initialization
- Beacon transport for minimal impact
- Console logging fallback for native platforms

### Data Quality
- Parameter sanitization
- Type validation
- Error boundaries
- Consistent event structure

## Future Enhancements

### Potential Improvements
1. **Enhanced E-commerce Tracking**: VIP subscription purchases
2. **Custom Dimensions**: More detailed user segmentation
3. **Goal Tracking**: Conversion funnel analysis
4. **Real-time Reporting**: Dashboard integration
5. **A/B Testing**: Experiment tracking
6. **Cross-platform Analytics**: Native platform integration

### Native Platform Options
- Firebase Analytics for iOS/Android
- Custom analytics service integration
- Third-party analytics solutions
- Server-side event tracking

## Troubleshooting

### Common Issues
1. **GA4 Script Loading**: Check network connectivity and script URL
2. **Event Not Appearing**: Verify measurement ID and event format
3. **Console Errors**: Check browser developer tools
4. **Missing Events**: Verify analytics initialization

### Debug Steps
1. Check console logs for analytics events
2. Verify measurement ID in configuration
3. Test with analytics test functions
4. Check GA4 real-time reports
5. Validate event parameters

## Support

For issues with Google Analytics implementation:
1. Check console logs for error messages
2. Use the analytics test functions
3. Verify GA4 configuration in Google Analytics dashboard
4. Review this documentation for proper usage
