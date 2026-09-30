# Project architecture rules

- Native iOS headers use both Capacitor's measured status-bar height and a 55px minimum because this TestFlight WebView does not reliably expose CSS safe-area insets.
- Prepare Xcode releases with `npm run ios:sync` so archived iOS web assets never lag behind the current app.