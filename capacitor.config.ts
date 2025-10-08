import type { CapacitorConfig } from '@capacitor/cli';

// Determine if we're in production mode
const isProduction = process.env.NODE_ENV === 'production';

// Production URL - Your actual Vercel deployment URL
// You can also set CAPACITOR_SERVER_URL environment variable to override
const productionUrl = process.env.CAPACITOR_SERVER_URL || 'https://binge-c572jw32a-nics-projects-12d5bf00.vercel.app';
const developmentUrl = 'http://localhost:3000';

const config: CapacitorConfig = {
  appId: 'com.binge.app',
  appName: 'Binge',
  webDir: 'out',
  server: {
    url: isProduction ? productionUrl : developmentUrl,
    cleartext: !isProduction, // Only allow cleartext (http) in development
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
