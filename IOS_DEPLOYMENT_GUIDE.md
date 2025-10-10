
# iOS Deployment Guide for CNC Forex Signals

## Firebase Configuration for iOS

Your iOS Firebase configuration has been successfully integrated into the project. Here's what has been set up:

### Configuration Files

1. **GoogleService-Info.plist** - Created in the root directory
   - Bundle ID: `com.cnc.forexsignal`
   - Project ID: `forex-abd77`
   - iOS App ID: `1:940152361938:ios:31a68add22dd613a9eee0b`

2. **app.json** - Updated with iOS configuration
   - Bundle identifier matches the plist file
   - GoogleServicesFile path configured
   - Display name set to "CNC Forex Signals"

3. **firebase/config.ts** - Updated to support iOS
   - Platform-specific appId selection
   - iOS uses the correct App ID from GoogleService-Info.plist
   - Android continues to use its own App ID

## Building for iOS

### Prerequisites
- macOS with Xcode installed
- Apple Developer account
- EAS CLI installed (`npm install -g eas-cli`)

### Build Steps

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Run prebuild for iOS**:
   ```bash
   npx expo prebuild -p ios
   ```
   This will generate the native iOS project with your Firebase configuration.

3. **Build with EAS** (recommended):
   ```bash
   eas build -p ios
   ```

4. **Or build locally with Xcode**:
   - Open the generated `ios/cncforexsignals.xcworkspace` in Xcode
   - Select your development team
   - Build and run on simulator or device

### Important Notes

- **Bundle Identifier**: The iOS bundle identifier is `com.cnc.forexsignal` (matches your GoogleService-Info.plist)
- **Android Package**: The Android package remains `com.cncforexsignals.app`
- **Firebase Services**: All Firebase services (Auth, Firestore, Storage) are configured for both platforms

### Testing on iOS

1. **Simulator Testing**:
   ```bash
   npx expo run:ios
   ```

2. **Device Testing**:
   - Connect your iOS device
   - Run: `npx expo run:ios --device`

### Push Notifications (Optional)

If you plan to use Firebase Cloud Messaging for push notifications on iOS:

1. Enable Push Notifications in your Apple Developer account
2. Upload your APNs certificate to Firebase Console
3. Add push notification capabilities in Xcode

### Troubleshooting

**Issue**: Build fails with Firebase configuration error
**Solution**: Ensure GoogleService-Info.plist is in the root directory and referenced correctly in app.json

**Issue**: Bundle identifier mismatch
**Solution**: Verify that the bundle identifier in app.json matches the one in GoogleService-Info.plist

**Issue**: Authentication not working on iOS
**Solution**: Check that the iOS App ID in Firebase Console matches the one in your GoogleService-Info.plist

## Next Steps

1. Test the app thoroughly on iOS simulator
2. Test on a physical iOS device
3. Submit to TestFlight for beta testing
4. Submit to App Store when ready

## Support

If you encounter any issues during iOS deployment, check:
- Firebase Console for correct iOS app configuration
- Xcode build logs for specific errors
- Expo documentation for iOS-specific requirements
