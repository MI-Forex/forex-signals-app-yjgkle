
# Analytics Setup

This document explains the analytics implementation in the CNC Forex Signals app.

## Overview

The app uses a simplified analytics service that logs events to the console for debugging purposes. This approach avoids the complex Firebase Analytics setup issues while maintaining a consistent API for tracking user interactions.

## Features

- **Console Logging**: All analytics events are logged to the console with timestamps and detailed information
- **Cross-Platform**: Works on iOS, Android, and Web without additional configuration
- **Event Tracking**: Supports custom events, screen views, user properties, and user identification
- **Error Handling**: Graceful error handling with fallback logging

## Usage

### Basic Event Logging

```typescript
import { logEvent, ANALYTICS_EVENTS } from '../utils/analyticsUtils';

// Log a custom event
await logEvent('button_clicked', {
  button_name: 'upgrade_to_vip',
  screen: 'vip_screen'
});

// Log a predefined event
await logEvent(ANALYTICS_EVENTS.SIGNAL_VIEW, {
  signal_id: 'EUR_USD_001',
  signal_type: 'BUY',
  is_vip: false
});
```

### Screen View Tracking

```typescript
import { logScreenView } from '../utils/analyticsUtils';

// Log screen view
await logScreenView('signals_screen');
```

### User Identification

```typescript
import { setUserId, setUserProperties } from '../utils/analyticsUtils';

// Set user ID
await setUserId('user_123');

// Set user properties
await setUserProperties({
  user_type: 'premium',
  app_version: '1.0.0'
});
```

## Available Events

The following predefined events are available in `ANALYTICS_EVENTS`:

### User Events
- `USER_LOGIN`
- `USER_REGISTER`
- `USER_LOGOUT`

### Signal Events
- `SIGNAL_VIEW`
- `SIGNAL_FILTER`
- `SIGNAL_REFRESH`

### VIP Events
- `VIP_UPGRADE_ATTEMPT`
- `VIP_WHATSAPP_OPEN`
- `VIP_FEATURES_VIEW`

### News Events
- `NEWS_VIEW`
- `NEWS_READ`
- `NEWS_REFRESH`

### Analysis Events
- `ANALYSIS_VIEW`
- `ANALYSIS_READ`
- `ANALYSIS_REFRESH`

### Admin Events
- `ADMIN_SIGNAL_CREATE`
- `ADMIN_SIGNAL_EDIT`
- `ADMIN_SIGNAL_DELETE`
- `ADMIN_NEWS_CREATE`
- `ADMIN_NEWS_EDIT`
- `ADMIN_NEWS_DELETE`
- `ADMIN_USER_MANAGE`

### Chat Events
- `CHAT_OPEN`
- `CHAT_MESSAGE_SEND`

### App Events
- `APP_OPEN`
- `SCREEN_VIEW`
- `ERROR_OCCURRED`

## Testing

Use the test screen (`/test`) to verify analytics functionality:

1. Navigate to the test screen
2. Click "Run Analytics Test" to test all analytics functions
3. Click "Test Custom Event" to test custom event logging
4. Click "Show Analytics State" to view current analytics state
5. Check the console for detailed analytics logs

## Console Output

Analytics events appear in the console with the following format:

```
📊 Analytics Event [2024-01-15T10:30:00.000Z]: {
  event: "signal_view",
  parameters: {
    signal_id: "EUR_USD_001",
    signal_type: "BUY",
    is_vip: false
  },
  platform: "ios",
  userId: "user_123"
}
```

## Future Enhancements

In a production environment, you could enhance this system by:

1. **Remote Analytics**: Send events to a remote analytics service
2. **Batch Processing**: Queue events and send them in batches
3. **Offline Support**: Store events locally when offline and sync when online
4. **Real Analytics**: Integrate with Google Analytics 4, Mixpanel, or similar services
5. **Performance Monitoring**: Add performance tracking and crash reporting

## Troubleshooting

If analytics are not working:

1. Check the console for error messages
2. Verify that the analytics service is initialized
3. Use the test screen to verify functionality
4. Check that events are being logged with proper parameters

## Migration from Firebase Analytics

This implementation replaces the previous Firebase Analytics setup that was causing build errors. The API remains the same, so existing code should continue to work without changes.
