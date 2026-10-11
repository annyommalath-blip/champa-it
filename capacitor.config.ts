import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.median.ios.pwoenzz',
  appName: 'ChampaIT',
  webDir: 'dist',
  ios: {
    contentInset: 'never',
  },
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: 'DARK',
      backgroundColor: '#F7F7F8',
    },
  },
};

export default config;
