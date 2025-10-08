import type { CapacitorConfig } from '@capacitor/cli';

// Production URL - Your actual Vercel deployment URL
const productionUrl = process.env.CAPACITOR_SERVER_URL || 'https://binge-black.vercel.app';

// For mobile builds, always use production unless explicitly overridden
// To use local dev server: CAPACITOR_SERVER_URL=http://localhost:3030 yarn cap:sync
const config: CapacitorConfig = {
  appId: 'com.binge.app',
  appName: 'Binge',
  webDir: 'out',
  server: {
    url: productionUrl,
    cleartext: false, // Always use HTTPS for security
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'always'
  },
  android: {
    backgroundColor: '#f0f9ff' // Match app's gradient start color
  }
};

export default config;
