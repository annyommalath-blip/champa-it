# Project architecture rules

- Native iOS headers use both Capacitor's measured status-bar height and a 55px minimum because this TestFlight WebView does not reliably expose CSS safe-area insets.