# Mobile App Setup Guide

Your Binge app is now configured to run as a native mobile app on both iOS and Android! 🎉

## What's Been Set Up

✅ Capacitor installed and configured
✅ iOS and Android projects created
✅ Haptic feedback on swipes and matches
✅ Status bar styling
✅ Safe area support for notches/home indicators
✅ Mobile-optimized viewport settings

## Development Workflow

### Running on iOS (Requires macOS + Xcode)

1. **Install Xcode** (from Mac App Store)
2. **Install CocoaPods**: `sudo gem install cocoapods`
3. **Start your Next.js dev server**: `yarn dev`
4. **Open iOS project**: `yarn cap:open:ios`
5. **In Xcode**: Select a simulator and click Run (▶️)

The app will connect to your local Next.js server at `http://localhost:3000`

### Running on Android (Requires Android Studio)

1. **Install Android Studio** from https://developer.android.com/studio
2. **Start your Next.js dev server**: `yarn dev`
3. **Open Android project**: `yarn cap:open:android`
4. **In Android Studio**: Select an emulator and click Run (▶️)

The app will connect to your local Next.js server at `http://localhost:3000`

### Syncing Changes

After making changes to:
- Capacitor config
- Native plugins
- Web assets

Run: `yarn cap:sync`

## App Icons & Splash Screens

### Quick Setup (Recommended)

Use [capacitor-assets](https://github.com/ionic-team/capacitor-assets) to auto-generate all icons:

```bash
# Install the tool
yarn add -D @capacitor/assets

# Create source images
# - Icon: resources/icon.png (1024x1024, with padding)
# - Splash: resources/splash.png (2732x2732, centered logo)

# Generate all assets
npx capacitor-assets generate
```

### Manual Setup

#### iOS Icons
Place icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`:
- 1024x1024 (App Store)
- 180x180 (iPhone)
- 120x120 (iPhone)
- 60x60 (iPhone)

#### Android Icons
Place icons in `android/app/src/main/res/`:
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-mdpi/ic_launcher.png` (48x48)

## Deep Linking (Optional)

To enable invite links that open the app:

### iOS
1. Open `ios/App/App/Info.plist`
2. Add URL scheme:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>binge</string>
    </array>
  </dict>
</array>
```

### Android
Already configured in `android/app/src/main/AndroidManifest.xml` with `https` scheme

### Handle Deep Links
Update your app code:
```typescript
import { App } from '@capacitor/app';

App.addListener('appUrlOpen', (data) => {
  // Handle: binge://join/GROUP_ID
  const slug = data.url.split('://')[1];
  router.push(`/${slug}`);
});
```

## Building for Production

### iOS (Requires Apple Developer Account - $99/year)

1. **Change server URL** in `capacitor.config.ts`:
   ```typescript
   url: 'https://your-production-domain.com'
   ```

2. **Build**:
   ```bash
   yarn cap:sync
   yarn cap:open:ios
   ```

3. **In Xcode**:
   - Select "Any iOS Device" as target
   - Product → Archive
   - Distribute App → App Store Connect

### Android (Requires Google Play Console - $25 one-time)

1. **Change server URL** in `capacitor.config.ts`:
   ```typescript
   url: 'https://your-production-domain.com'
   ```

2. **Build**:
   ```bash
   yarn cap:sync
   yarn cap:open:android
   ```

3. **In Android Studio**:
   - Build → Generate Signed Bundle/APK
   - Follow prompts to create signing key
   - Upload AAB to Google Play Console

## Deployment Checklist

- [ ] Deploy Next.js app to production (Vercel, Railway, etc.)
- [ ] Update `capacitor.config.ts` with production URL
- [ ] Remove `cleartext: true` from server config
- [ ] Add app icons (1024x1024)
- [ ] Add splash screens
- [ ] Test on real devices
- [ ] Configure push notifications (optional)
- [ ] Set up analytics (optional)
- [ ] Submit to App Store / Play Store

## Native Features Available

Your app now has access to:
- ✅ **Haptics** - Already integrated on swipes
- ✅ **Status Bar** - Styled to match your app
- ✅ **Splash Screen** - Shows while loading
- 📸 **Camera** - Install `@capacitor/camera`
- 🔔 **Push Notifications** - Install `@capacitor/push-notifications`
- 📍 **Geolocation** - Install `@capacitor/geolocation`
- 📱 **Share** - Install `@capacitor/share`

## Troubleshooting

### iOS: "Developer directory error"
Install Xcode from the Mac App Store

### Android: "SDK not found"
Install Android Studio and configure SDK paths

### App shows blank screen
1. Check that `yarn dev` is running
2. Verify `capacitor.config.ts` URL is correct
3. Check device can reach localhost (use your computer's IP)

### Changes not appearing
Run `yarn cap:sync` after modifying:
- Native plugin code
- Capacitor config
- Public assets

## Next Steps

1. **Test on Real Devices**: Use USB debugging
2. **Add App Icons**: Use Capacitor Assets or create manually
3. **Deploy Backend**: Host your Next.js app online
4. **Submit to Stores**: Follow iOS/Android guidelines
5. **Monitor**: Add Sentry or similar for crash reporting

## Useful Commands

```bash
# Development
yarn dev                    # Start Next.js dev server
yarn cap:open:ios          # Open iOS in Xcode
yarn cap:open:android      # Open Android in Android Studio
yarn cap:sync              # Sync changes to native projects

# Plugin Management
yarn cap ls                # List installed plugins
yarn cap doctor            # Check configuration

# Platform Management
yarn cap add ios           # Add iOS platform
yarn cap add android       # Add Android platform
```

## Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Design Guidelines](https://developer.android.com/design)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Google Play Console](https://play.google.com/console)

---

**Need Help?** Check the Capacitor docs or file an issue in your repo!
