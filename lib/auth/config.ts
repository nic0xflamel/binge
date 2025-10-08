import { Capacitor } from '@capacitor/core';

/**
 * Get the appropriate redirect URL for authentication callbacks
 * Based on whether we're running on native mobile or web
 */
export function getAuthRedirectUrl(): string {
  // On native mobile, use custom scheme for deep linking
  if (Capacitor.isNativePlatform()) {
    return 'com.binge.app://auth/callback';
  }

  // On web, use the current origin
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }

  // Fallback for SSR
  return 'https://binge-black.vercel.app/auth/callback';
}

/**
 * Get the base URL for the app
 */
export function getAppBaseUrl(): string {
  if (Capacitor.isNativePlatform()) {
    return 'https://binge-black.vercel.app';
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return 'https://binge-black.vercel.app';
}
