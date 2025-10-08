# Creating an Android Emulator - Step-by-Step Guide

## 📱 What is an Emulator?

An Android emulator is a virtual Android device that runs on your computer. It lets you test your app without needing a physical phone.

---

## 🎯 Step-by-Step Instructions

### **Step 1: Open Android Studio**

First, make sure Android Studio is open with your project:

```bash
yarn cap:open:android
```

This will launch Android Studio with your Binge app project loaded.

---

### **Step 2: Open Device Manager**

There are **3 ways** to open Device Manager:

**Option A - Via Menu:**
1. In Android Studio, click **Tools** in the top menu
2. Click **Device Manager**

**Option B - Via Toolbar:**
1. Look for the device icon in the top toolbar (looks like a phone)
2. Click it

**Option C - Via Quick Search:**
1. Press `Cmd + Shift + A` (Mac) or `Ctrl + Shift + A` (Windows/Linux)
2. Type "Device Manager"
3. Press Enter

A panel will open on the right side showing "Device Manager"

---

### **Step 3: Create a New Virtual Device**

1. In the Device Manager panel, click the **"+" button** or **"Create Device"**
   - If you see existing devices, the button is at the top
   - If the list is empty, you'll see a big "Create Device" button

---

### **Step 4: Select Hardware**

You'll see a list of phone/tablet models:

**Recommended Devices:**
- **Pixel 7** (Modern flagship)
- **Pixel 6** (Popular choice)
- **Medium Phone** (Generic device)

**What to look for:**
- "Play Store" column should show ✓ (means Google Play services work)
- Screen size around 5.5-6.5 inches

**Steps:**
1. Click on **"Pixel 7"** (or your preferred device)
2. Click **"Next"** at the bottom

---

### **Step 5: Select System Image (Android Version)**

You'll see a list of Android versions (system images):

**Recommended:**
- **API Level 34** - Android 14 (Latest)
- **API Level 33** - Android 13 (Most stable)
- **API Level 31** - Android 12 (Good compatibility)

**Important - Look at the "Release Name" column:**
- Choose one with **"x86_64"** architecture (faster on Intel Macs)
- Or **"arm64-v8a"** if you have an Apple Silicon Mac (M1/M2/M3)

**Steps:**
1. Find **"Tiramisu"** (API 33, Android 13) - This is the most stable
2. If it shows a **download icon (↓)** next to it:
   - Click the **download icon**
   - Accept license agreement
   - Wait for download (~800MB-1.5GB, takes 3-10 minutes)
   - Click "Finish" when done
3. Select the system image (click the radio button)
4. Click **"Next"**

---

### **Step 6: Verify Configuration**

You'll see a summary screen:

**Default settings are perfect! You'll see:**
- AVD Name: `Pixel 7 API 33` (or similar)
- Startup orientation: Portrait
- Emulated Performance: Hardware (automatic)

**Optional customizations:**
- Click **"Show Advanced Settings"** if you want to:
  - Change RAM (default 2GB is usually fine)
  - Enable/disable camera
  - Change storage size

**Steps:**
1. Review the configuration
2. Click **"Finish"**

---

### **Step 7: Launch Your Emulator**

Back in Device Manager, you'll now see your new virtual device!

**To start it:**
1. Find your device in the list (e.g., "Pixel 7 API 33")
2. Click the **▶ Play button** next to it

**What happens:**
- A new window opens (the emulator)
- Android boots up (~30-60 seconds first time)
- You'll see the Android home screen
- The emulator is now running!

---

## 🎯 Running Your App on the Emulator

Once the emulator is running:

### **Method 1 - From Android Studio:**

1. Make sure your emulator is running (you'll see it in the device dropdown)
2. In the top toolbar, the device dropdown should show your emulator name
3. Click the green **Run button (▶️)** next to it
4. Your Binge app will install and launch!

### **Method 2 - From Terminal:**

```bash
# From your project root
cd android
./gradlew installDebug
```

---

## 📸 Visual Guide

### Device Manager Location:
```
Android Studio Window
├── Top Menu Bar
│   └── Tools → Device Manager ✓
├── Top Toolbar
│   └── [📱 Device Icon] ✓
└── Right Panel
    └── Device Manager Panel
```

### Device Creation Flow:
```
Create Device
    ↓
Select Hardware (Pixel 7)
    ↓
Select System Image (API 33 - Android 13)
    ↓
[Download if needed - 3-10 min]
    ↓
Verify Configuration
    ↓
Finish → Emulator Created! 🎉
    ↓
Click ▶ to Launch
```

---

## 💡 Pro Tips

### **Multiple Emulators:**
- You can create several emulators with different Android versions
- Good for testing compatibility
- Common setup: API 33 (Android 13) + API 34 (Android 14)

### **Emulator Controls:**
- **Rotate:** `Cmd + Left/Right Arrow`
- **Volume:** Click volume buttons in emulator toolbar
- **Home button:** Click home in emulator toolbar
- **Back button:** `Cmd + Delete` or click back in toolbar
- **Screenshot:** Click camera icon in toolbar

### **Speed Tips:**
- First boot is slowest (~1 minute)
- After that, boots in ~20 seconds
- Keep emulator running while developing
- Don't create too many emulators (they take disk space)

### **Haptic Feedback Testing:**
In emulator: Settings → Display → Enable "Vibrate on touch" to feel your haptic feedback!

---

## 🐛 Troubleshooting

### "No System Images Available"
- Check your internet connection
- Try: Tools → SDK Manager → SDK Platforms → Install Android 13.0 (API 33)

### "HAXM/QEMU Error"
- macOS: Enable kernel extensions in System Settings → Privacy & Security
- Or use a physical device instead

### "Emulator is Slow"
- Allocate more RAM in Advanced Settings (try 4GB)
- Make sure "Graphics: Hardware" is selected
- Close other apps to free memory

### "Device Offline/Not Found"
```bash
# Restart ADB
adb kill-server
adb start-server
```

### "Can't Install App on Emulator"
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleDebug
```

---

## 🎯 Quick Reference

**Create emulator:**
1. Tools → Device Manager
2. Click "+"
3. Select Pixel 7
4. Select API 33 (download if needed)
5. Click Finish
6. Click ▶ to launch

**Run your app:**
1. Emulator running
2. Click green ▶ in Android Studio
3. App installs and launches!

---

## 🔗 Alternative: Use a Physical Device

Don't want to use an emulator? Use your Android phone!

### Enable Developer Options:
1. Settings → About Phone
2. Tap "Build Number" 7 times
3. Go back → Developer Options
4. Enable "USB Debugging"

### Connect & Run:
1. Plug in USB cable
2. Allow USB debugging popup on phone
3. Phone appears in device dropdown
4. Click Run ▶

**Benefits:** Faster, real haptics, true performance!

---

**Need help?** The emulator creation wizard guides you through each step with helpful descriptions. Just follow the prompts! 🚀
