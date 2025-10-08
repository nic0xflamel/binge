import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

/**
 * Initialize Capacitor native features
 * Call this in your app's root layout or main entry point
 */
export async function initializeCapacitor() {
  if (!Capacitor.isNativePlatform()) {
    console.log('Running in browser, skipping native initialization');
    return;
  }

  try {
    // Configure Status Bar
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#ffffff' });

    // Hide splash screen after app is ready
    await SplashScreen.hide();

    console.log('Capacitor initialized successfully');
  } catch (error) {
    console.error('Error initializing Capacitor:', error);
  }
}

/**
 * Trigger haptic feedback
 * Use this for user interactions like swipes, button presses, etc.
 */
export async function triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'medium') {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const impactMap = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    };

    await Haptics.impact({ style: impactMap[style] });
  } catch (error) {
    console.error('Error triggering haptic:', error);
  }
}

/**
 * Check if running on a native platform
 */
export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get the current platform (ios, android, or web)
 */
export function getPlatform(): 'ios' | 'android' | 'web' {
  return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
}
