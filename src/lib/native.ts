import { Capacitor } from '@capacitor/core';

/**
 * Native-only setup. Safe no-op in the browser / Lovable preview.
 * Ensures the iOS status bar does not overlay the WebView.
 */
export async function initNativeStatusBar() {
  if (!Capacitor.isNativePlatform()) return;
  // Marks the document so CSS can apply a guaranteed status-bar offset,
  // since env(safe-area-inset-top) is unreliable in this WebView setup.
  document.documentElement.classList.add('native-app');
  if (Capacitor.getPlatform() === 'ios') {
    document.documentElement.classList.add('native-ios');
  }
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setStyle({ style: Style.Light });
  } catch {
    // plugin not available in this build — ignore
  }
}
