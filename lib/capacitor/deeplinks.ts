import { App, URLOpenListenerEvent } from '@capacitor/app';
import { isNative } from './init';

/**
 * Initialize deep link handling for the app
 * Call this in your root layout or app entry point
 */
export function initializeDeepLinking(
  onDeepLink: (url: string) => void
) {
  if (!isNative()) {
    console.log('Deep linking not available in browser');
    return;
  }

  App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
    console.log('Deep link opened:', event.url);

    // Handle binge:// URLs
    // Example: binge://join/abc123 -> /join/abc123
    if (event.url.startsWith('binge://')) {
      const path = event.url.replace('binge://', '/');
      onDeepLink(path);
    }

    // Handle https:// URLs (universal links)
    // Example: https://binge.app/join/abc123 -> /join/abc123
    else if (event.url.includes('binge.app')) {
      try {
        const url = new URL(event.url);
        onDeepLink(url.pathname + url.search);
      } catch (error) {
        console.error('Error parsing deep link URL:', error);
      }
    }
  });

  console.log('Deep linking initialized');
}

/**
 * Get the app's launch URL (if opened via deep link)
 */
export async function getInitialUrl(): Promise<string | null> {
  if (!isNative()) return null;

  try {
    const { url } = await App.getLaunchUrl();
    return url || null;
  } catch (error) {
    console.error('Error getting launch URL:', error);
    return null;
  }
}
