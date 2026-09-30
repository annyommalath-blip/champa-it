import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.median.ios.pwoenzz',
  appName: 'ChampaIT',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'LIGHT',
      backgroundColor: '#F7F7F8',
    },
  },
};

export default config;
