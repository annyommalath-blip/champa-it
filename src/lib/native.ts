import { Capacitor } from '@capacitor/core';

/**
 * Native-only setup. Safe no-op in the browser / Lovable preview.
 * Status bar overlays the WebView so CSS env(safe-area-inset-*) is meaningful.
 */
export async function initNativeStatusBar() {
  if (!Capacitor.isNativePlatform()) return;
  document.documentElement.classList.add('native-app');
  if (Capacitor.getPlatform() === 'ios') {
    document.documentElement.classList.add('native-ios');
  }
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setOverlaysWebView({ overlay: true });
    await StatusBar.setStyle({ style: Style.Dark });
  } catch {
    // plugin not available in this build — ignore
  }
}

/** Light icons on home branded header; dark icons elsewhere. No-op on web. */
export async function syncStatusBarForPath(pathname: string) {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({
      style: pathname === '/' ? Style.Light : Style.Dark,
    });
  } catch {
    // plugin not available in this build — ignore
  }
}
