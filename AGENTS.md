# Project architecture rules

- The native iOS WebView is constrained to UIKit's safe-area frame so every screen clears the Dynamic Island and home indicator without relying on CSS insets.
- Prepare Xcode releases with `npm run ios:sync` so archived iOS web assets never lag behind the current app.