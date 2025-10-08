# Android Build Setup Guide

Your Binge app is ready to build for Android! Here's everything you need to know.

## ✅ Current Status

**What's Ready:**
- ✅ Java installed (`/usr/bin/java`)
- ✅ Android project generated at `android/`
- ✅ Gradle build system configured
- ✅ Capacitor synced with latest config
- ✅ Production URL configured: `https://binge-black.vercel.app`
- ✅ All Capacitor plugins installed (App, Haptics, Splash Screen, Status Bar)

**What You Need:**
- ❌ Android Studio (needs installation)

---

## 🚀 Step-by-Step Setup

### Step 1: Install Android Studio (~15 minutes)

1. **Download Android Studio:**
   - Visit: https://developer.android.com/studio
   - Click "Download Android Studio"
   - Accept terms and download

2. **Install:**
   - Open the downloaded `.dmg` file
   - Drag Android Studio to Applications folder
   - Launch Android Studio
   - Follow the setup wizard:
     - Choose "Standard" installation
     - Accept license agreements
     - Wait for SDK and tools to download (~5-10 min)

3. **Configure Android SDK:**
   - Android Studio will auto-download:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device (Emulator)
   - Accept all license agreements when prompted

**Time Estimate:** 15-20 minutes (depending on download speed)

---

### Step 2: Open Your Project

Once Android Studio is installed:

```bash
# From your project root
yarn cap:open:android
```

Or manually:
1. Open Android Studio
2. Click "Open an Existing Project"
3. Navigate to `/Users/adrianobradley/binge/android`
4. Click "Open"

**First-time setup:**
- Gradle will sync automatically (~2-5 minutes)
- Android Studio will download any missing dependencies
- You might see a prompt to update Gradle - click "Update" if asked

---

### Step 3: Create an Emulator (Virtual Device)

1. **Open AVD Manager:**
   - In Android Studio, click Tools → Device Manager
   - Or click the device icon in the toolbar

2. **Create Virtual Device:**
   - Click "+ Create Device"
   - Select a phone (recommended: Pixel 6 or Pixel 7)
   - Click "Next"

3. **Select System Image:**
   - Choose API Level 33 or 34 (Android 13 or 14)
   - Download if needed (click the download icon)
   - Click "Next" then "Finish"

**Time Estimate:** 5-10 minutes (if downloading system image)

---

### Step 4: Run Your App! 🎉

1. **Select your emulator** from the device dropdown (top toolbar)
2. **Click the green Play button (▶️)** or press `Ctrl + R`
3. **Wait for the emulator to start** (~30 seconds first time)
4. **Your app will launch!**

The app will connect to your production server at:
`https://binge-black.vercel.app`

---

## 🧪 Testing Checklist

Once your app launches, test:

- [ ] App opens and shows loading screen
- [ ] Connects to production server
- [ ] Login flow works
- [ ] Can create/join a group
- [ ] Swipe functionality works
- [ ] **Haptic feedback** triggers on swipes (in emulator: Settings → Display → Vibrate on touch)
- [ ] Status bar styled correctly
- [ ] Safe areas respected (no content under notch)
- [ ] Navigation works
- [ ] Can view matches

---

## 🔧 Alternative: Use Physical Device

Instead of an emulator, you can use a real Android phone:

### Enable Developer Mode:
1. On your Android phone: Settings → About Phone
2. Tap "Build Number" 7 times
3. Go back → Developer Options
4. Enable "USB Debugging"

### Connect & Run:
1. Connect phone via USB
2. Allow USB debugging when prompted
3. Your device will appear in Android Studio device dropdown
4. Click Run ▶️

**Benefits:**
- Faster than emulator
- Real haptic feedback
- True performance testing
- Actual mobile experience

---

## 🎨 Building a Release APK (For Distribution)

When you're ready to share your app or submit to Google Play:

### Step 1: Generate Signing Key

```bash
cd android/app
keytool -genkey -v -keystore binge-release-key.keystore -alias binge -keyalg RSA -keysize 2048 -validity 10000
```

Answer the prompts and **remember your passwords!**

### Step 2: Build Release APK

In Android Studio:
1. Build → Generate Signed Bundle/APK
2. Select "APK"
3. Choose your keystore file
4. Enter passwords
5. Select "release" variant
6. Click "Finish"

The APK will be saved to: `android/app/release/app-release.apk`

---

## 🐛 Troubleshooting

### "Gradle sync failed"
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew build
```

### "SDK not found"
- Open Android Studio → Tools → SDK Manager
- Install Android SDK Platform 33 or 34
- Install Android SDK Build-Tools

### "Emulator won't start"
- Enable hardware acceleration:
  - macOS: System Settings → Privacy & Security → Allow kernel extensions
- Or use a physical device instead

### "App shows white screen"
- Check the production URL is accessible: `https://binge-black.vercel.app`
- Check Android logcat for errors (bottom panel in Android Studio)
- Verify environment variables in Vercel dashboard

### "Can't connect to server"
- Ensure dev server is NOT running on port 3030
- App should connect to production, not localhost
- Check Android logcat for network errors

---

## 📱 App Configuration

Your Android app is configured with:

- **Package:** `com.binge.app`
- **App Name:** Binge
- **Production Server:** `https://binge-black.vercel.app`
- **Background Color:** `#f0f9ff` (matches your gradient)
- **Target SDK:** 34 (Android 14)
- **Min SDK:** 22 (Android 5.1)

---

## 🚀 Next Steps After First Build

1. **Add App Icon:**
   - Create 1024x1024 icon
   - Use: `yarn add -D @capacitor/assets`
   - Run: `npx capacitor-assets generate`

2. **Add Splash Screen:**
   - Create 2732x2732 splash image
   - Place in `resources/splash.png`
   - Run: `npx capacitor-assets generate`

3. **Test on Multiple Devices:**
   - Different screen sizes
   - Different Android versions
   - Real devices vs emulator

4. **Prepare for Google Play:**
   - Screenshots (phone and tablet)
   - Privacy policy
   - App description
   - Developer account ($25 one-time fee)

---

## 📚 Resources

- [Android Developer Docs](https://developer.android.com)
- [Capacitor Android Docs](https://capacitorjs.com/docs/android)
- [Google Play Console](https://play.google.com/console)

---

**Ready to build?** Install Android Studio and run `yarn cap:open:android`! 🎉
