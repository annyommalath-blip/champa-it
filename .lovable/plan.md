# Fix the TestFlight iOS top safe area

## Outcome
The Champa logo and header actions will always begin below the iPhone status bar in the native app, while the header background continues behind the notch and Dynamic Island.

## Changes
- Keep the current bundle ID and app name unchanged.
- Make native iOS identification available before React renders, so the fixed native header inset cannot miss the first paint.
- Keep `viewport-fit=cover`, the existing safe-area variable support, and the native 55px minimum fallback.
- Configure the iOS WebView to respect its native content inset in addition to the header-level fallback.
- Sync the current web build into the iOS project so Xcode does not archive the older bundled interface.
- Verify the browser layout, generated iOS configuration, and current build diagnostics.

## Technical details
The fix will use two layers: native WebView inset handling and the `.native-ios .safe-area-top` header rule. This avoids relying solely on `env(safe-area-inset-top)`, which has been unreliable in this TestFlight WebView.
