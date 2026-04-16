#!/usr/bin/env bash
# Build Android in locale con ANDROID_HOME impostato (evita "SDK location not found").
# Uso: da app/ eseguire: ./scripts/android-local-build.sh
#      oppure: bash scripts/android-local-build.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$APP_DIR"

# Android SDK tipico su macOS
if [[ -z "$ANDROID_HOME" ]]; then
  if [[ -d "$HOME/Library/Android/sdk" ]]; then
    export ANDROID_HOME="$HOME/Library/Android/sdk"
    echo "ANDROID_HOME impostato a: $ANDROID_HOME"
  else
    echo "Errore: ANDROID_HOME non impostato e non trovato in $HOME/Library/Android/sdk"
    echo "Imposta ANDROID_HOME manualmente o installa Android Studio / Android SDK."
    exit 1
  fi
fi

# Profilo: development (APK) di default; passare come argomento per cambiare (es. production)
PROFILE="${1:-development}"
echo "Build Android (profilo: $PROFILE) in corso..."
echo "ANDROID_HOME=$ANDROID_HOME"

# Forza ANDROID_HOME nel comando così il processo figlio (plugin EAS) lo riceve
if command -v eas >/dev/null 2>&1; then
  ANDROID_HOME="${ANDROID_HOME}" eas build --platform android --profile "$PROFILE" --local
elif command -v yarn >/dev/null 2>&1; then
  if [[ "$PROFILE" == "production" ]]; then
    ANDROID_HOME="${ANDROID_HOME}" yarn run buildAndroidProductionLocal
  else
    ANDROID_HOME="${ANDROID_HOME}" yarn run buildAndroidLocal
  fi
elif command -v npm >/dev/null 2>&1; then
  if [[ "$PROFILE" == "production" ]]; then
    ANDROID_HOME="${ANDROID_HOME}" npm run buildAndroidProductionLocal
  else
    ANDROID_HOME="${ANDROID_HOME}" npm run buildAndroidLocal
  fi
else
  echo "Errore: installa EAS CLI (npm install -g eas-cli) oppure usa yarn/npm."
  exit 1
fi
