# iOS Build Setup Checklist

**Project:** Binge
**Generated:** October 8, 2025
**macOS Version:** 15.6.1 (Sequoia)

---

## Current Status Overview

### ✅ What's Already Installed & Ready

| Component | Status | Version | Notes |
|-----------|--------|---------|-------|
| **Node.js** | ✅ Installed | v22.19.0 | Ready |
| **npm** | ✅ Installed | 10.9.3 | Ready |
| **Yarn** | ✅ Installed | 4.10.3 | Ready |
| **Ruby** | ✅ Installed | 2.6.10 | Ready for CocoaPods |
| **Homebrew** | ✅ Installed | /opt/homebrew/bin/brew | Ready |
| **Xcode Command Line Tools** | ✅ Installed | - | Basic tools only |
| **iOS Project Structure** | ✅ Generated | - | `/ios/App` directory exists |
| **Podfile** | ✅ Present | - | Capacitor pods configured |
| **Capacitor iOS** | ✅ Installed | 7.4.3 | In package.json |

### ❌ What's Missing

| Component | Status | Required For | Priority |
|-----------|--------|--------------|----------|
| **Xcode (Full IDE)** | ❌ Not Installed | Building & running iOS apps | **CRITICAL** |
| **CocoaPods** | ❌ Not Installed | iOS dependency management | **CRITICAL** |
| **Pod Dependencies** | ❌ Not Installed | Capacitor native modules | **CRITICAL** |

---

## Setup Instructions

### Step 1: Install Xcode (CRITICAL)

**Estimated Time:** 30-60 minutes (depending on download speed)

#### Why You Need It
You have Xcode Command Line Tools, but you need the full Xcode IDE to:
- Build iOS apps
- Use iOS Simulator
- Open and manage Xcode projects
- Sign and deploy to physical devices

#### Installation Options

**Option A: App Store (Recommended)**
1. Open the **App Store** on your Mac
2. Search for "Xcode"
3. Click **Install** (it's free, ~15GB download)
4. Wait for installation to complete (can take 30-60 minutes)

**Option B: Direct Download**
1. Visit [developer.apple.com/download](https://developer.apple.com/download)
2. Sign in with your Apple ID
3. Download the latest Xcode version
4. Install the .xip file

#### Post-Installation
After Xcode is installed, run these commands:

```bash
# Accept Xcode license
sudo xcodebuild -license accept

# Set Xcode as active developer directory
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# Verify installation
xcodebuild -version
```

**Expected Output:**
```
Xcode 16.x
Build version xxxxx
```

---

### Step 2: Install CocoaPods (CRITICAL)

**Estimated Time:** 2-5 minutes

#### Why You Need It
CocoaPods manages iOS native dependencies for Capacitor plugins:
- @capacitor/app
- @capacitor/haptics
- @capacitor/splash-screen
- @capacitor/status-bar

#### Installation

Run this command:

```bash
sudo gem install cocoapods
```

#### Verify Installation

```bash
pod --version
```

**Expected Output:** `1.x.x` (e.g., 1.15.2)

#### Troubleshooting

If you get permission errors:
```bash
# Use Homebrew Ruby instead (optional)
brew install ruby
echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
gem install cocoapods
```

---

### Step 3: Install Pod Dependencies (CRITICAL)

**Estimated Time:** 3-5 minutes

#### Commands

Navigate to your iOS app directory and install dependencies:

```bash
cd /Users/adrianobradley/binge/ios/App
pod install
```

**Expected Output:**
```
Analyzing dependencies
Downloading dependencies
Installing Capacitor (7.x.x)
Installing CapacitorCordova (7.x.x)
Installing CapacitorApp (7.x.x)
Installing CapacitorHaptics (7.x.x)
Installing CapacitorSplashScreen (7.x.x)
Installing CapacitorStatusBar (7.x.x)
Generating Pods project
Integrating client project
```

#### What Gets Created
- `Pods/` directory with all dependencies
- `Podfile.lock` with locked versions
- Updated `App.xcworkspace`

---

### Step 4: Build Your App (First Build)

**Estimated Time:** 5-10 minutes

#### Before Building
Make sure you have a production build of your Next.js app:

```bash
cd /Users/adrianobradley/binge

# Build Next.js for static export
yarn build

# Sync with Capacitor
yarn cap:sync
```

#### Open in Xcode

```bash
# This will open Xcode with your project
yarn cap:open:ios
```

Alternatively:
```bash
open /Users/adrianobradley/binge/ios/App/App.xcworkspace
```

**IMPORTANT:** Always open `.xcworkspace`, NOT `.xcodeproj` when using CocoaPods!

#### Build & Run

In Xcode:
1. Select a simulator device (e.g., iPhone 15 Pro)
2. Click the **Play** button (▶) or press `Cmd + R`
3. Wait for build to complete
4. App should launch in simulator

---

## Configuration Details

### Capacitor Configuration

**App ID:** `com.binge.app`
**App Name:** Binge
**Web Directory:** `out` (Next.js static export)
**iOS Min Version:** 14.0

### Current Setup

Your project is configured with:
- **Server URL (Dev):** http://localhost:3030
- **Server URL (Prod):** https://binge-black.vercel.app
- **Content Inset:** Always
- **Plugins:**
  - App (core functionality)
  - Haptics (tactile feedback)
  - Splash Screen (launch screen)
  - Status Bar (top bar customization)

---

## Complete Setup Checklist

Use this checklist to track your progress:

- [ ] Install Xcode from App Store (30-60 min)
- [ ] Accept Xcode license agreement
- [ ] Set Xcode as active developer directory
- [ ] Verify Xcode installation (`xcodebuild -version`)
- [ ] Install CocoaPods (`sudo gem install cocoapods`)
- [ ] Verify CocoaPods installation (`pod --version`)
- [ ] Navigate to `/Users/adrianobradley/binge/ios/App`
- [ ] Run `pod install`
- [ ] Verify Pods directory was created
- [ ] Build Next.js app (`yarn build`)
- [ ] Sync Capacitor (`yarn cap:sync`)
- [ ] Open Xcode workspace (`yarn cap:open:ios`)
- [ ] Select iOS simulator
- [ ] Build and run app (Cmd + R)
- [ ] Verify app launches in simulator
- [ ] Test app functionality

---

## Common Issues & Troubleshooting

### Issue: "xcrun: error: invalid active developer path"

**Solution:**
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### Issue: Pod install fails with "Unable to find a specification"

**Solution:**
```bash
# Update CocoaPods repo
pod repo update

# Try installing again
pod install
```

### Issue: Build fails with signing errors

**Solution:**
1. In Xcode, select your project
2. Go to **Signing & Capabilities** tab
3. Check **Automatically manage signing**
4. Select your development team (or create a free Apple ID)

### Issue: "The app ID cannot be registered to your development team"

**Solution:**
Change the Bundle Identifier in Xcode:
1. Select project > App target
2. Change Bundle Identifier to something unique (e.g., `com.yourname.binge`)
3. Update `capacitor.config.ts` to match

### Issue: Simulator doesn't launch

**Solution:**
```bash
# Kill existing simulators
killall Simulator

# Open Xcode and try again
```

### Issue: App shows white screen

**Solution:**
1. Make sure you ran `yarn build` before `yarn cap:sync`
2. Check that `out/` directory contains your built files
3. In Xcode, check the console for errors

---

## Quick Reference Commands

```bash
# Build Next.js app
yarn build

# Sync Capacitor (copies web assets to native projects)
yarn cap:sync

# Open iOS project in Xcode
yarn cap:open:ios

# Run dev server + sync + open Xcode (combined)
yarn cap:run:ios

# Install/update iOS dependencies
cd ios/App && pod install

# Update Capacitor
yarn add @capacitor/ios@latest @capacitor/cli@latest
```

---

## Apple Developer Account (Optional)

### For Simulator Testing
- **Not Required** - You can build and test in the iOS Simulator without an Apple Developer account

### For Physical Device Testing
- **Free Apple ID** - You can test on your own devices for free (apps expire after 7 days)
- Sign in with your Apple ID in Xcode > Settings > Accounts

### For App Store Distribution
- **Paid Apple Developer Program** - $99/year
- Required to publish apps to the App Store
- Visit [developer.apple.com/programs](https://developer.apple.com/programs)

---

## Next Steps After Setup

1. **Test Core Functionality**
   - Test swipe gestures
   - Verify Supabase connection
   - Test haptic feedback
   - Check splash screen

2. **Configure App Icons & Splash Screens**
   - Use [capacitor-assets](https://github.com/ionic-team/capacitor-assets)
   - Or manually add in `ios/App/App/Assets.xcassets`

3. **Test on Physical Device** (Optional)
   - Connect iPhone via USB
   - Trust the device
   - Select device in Xcode
   - Build and run

4. **Optimize for Production**
   - Configure proper error handling
   - Set up crash reporting (e.g., Sentry)
   - Test offline functionality
   - Performance profiling with Instruments

---

## Estimated Total Time

| Task | Time |
|------|------|
| Xcode Download & Install | 30-60 min |
| Xcode Configuration | 2-3 min |
| CocoaPods Installation | 2-5 min |
| Pod Dependencies Install | 3-5 min |
| First Build & Test | 5-10 min |
| **TOTAL** | **~45-85 minutes** |

Most time is spent downloading Xcode. Actual configuration is quick!

---

## Project-Specific Notes

### Your Capacitor Setup

Your project has already been initialized with Capacitor:
- iOS platform added
- Configuration file exists at `/Users/adrianobradley/binge/capacitor.config.ts`
- iOS project structure generated
- Podfile configured with Capacitor plugins

### Your Package Scripts

Useful npm scripts from your `package.json`:
- `yarn cap:sync` - Sync web assets to native projects
- `yarn cap:open:ios` - Open iOS project in Xcode
- `yarn cap:run:ios` - Dev server + sync + open (combined workflow)

### Current iOS Structure

```
/Users/adrianobradley/binge/ios/
├── App/
│   ├── App/                    # iOS app source
│   │   ├── AppDelegate.swift
│   │   ├── Assets.xcassets
│   │   ├── Info.plist
│   │   └── public/             # Synced from Next.js build
│   ├── App.xcodeproj/
│   ├── App.xcworkspace/        # ← Open this in Xcode!
│   ├── Podfile                 # ✅ Exists
│   └── Pods/                   # ❌ Will be created after pod install
└── capacitor-cordova-ios-plugins/
```

---

## Support Resources

- **Capacitor iOS Docs:** https://capacitorjs.com/docs/ios
- **Capacitor CLI:** https://capacitorjs.com/docs/cli
- **Xcode Help:** https://developer.apple.com/documentation/xcode
- **CocoaPods Guides:** https://guides.cocoapods.org

---

**Good luck with your iOS build!** 🚀

Once you complete these steps, you'll be able to build and test your Binge app on iOS simulators and devices.
