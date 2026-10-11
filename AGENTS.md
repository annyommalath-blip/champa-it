# Project architecture rules

- The native iOS WebView is edge-to-edge; CSS `env(safe-area-inset-*)` (via `--sat` / `--sab` tokens) owns top and bottom insets so branded headers can paint under the status bar while controls stay clear of the Dynamic Island and home indicator.
- Prepare Xcode releases with `npm run ios:sync` so archived iOS web assets never lag behind the current app.

## TestFlight QA (after `npm run ios:sync`)

1. Cold launch — no gray double-band under the island; splash falls through to web shell.
2. Home (`/`) — yellow header paints under the status bar; logo/controls sit below the inset; status bar icons are light.
3. Secondary tabs (Shop / Profile) — glass header clears the island; status bar icons are dark.
4. Bottom tab dock — icons clear the home indicator; list content clears the dock.
5. Sheet / toast — toasts clear the island; bottom sheets clear the home indicator.
6. Resume from background — insets and status bar style still look correct.
