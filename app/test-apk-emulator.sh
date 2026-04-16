#!/bin/bash

# Script per testare l'APK su emulatore Android

APK_PATH="./FamilyTrip_15_12_25.apk"
EMULATOR_NAME="Pixel_7"  # Cambia con Pixel_6a se preferisci

echo "🚀 Avvio emulatore $EMULATOR_NAME..."
emulator -avd $EMULATOR_NAME &

echo "⏳ Attendo che l'emulatore sia pronto..."
adb wait-for-device

echo "⏳ Attendo che l'emulatore sia completamente avviato..."
sleep 10

# Verifica che l'emulatore sia pronto
while ! adb shell getprop sys.boot_completed | grep -q 1; do
  echo "⏳ Attendo il boot completo..."
  sleep 2
done

echo "📱 Disinstallo versione precedente (se presente)..."
adb uninstall app.familytrip.xyz 2>/dev/null || echo "App non installata"

echo "📦 Installo APK..."
adb install -r "$APK_PATH"

if [ $? -eq 0 ]; then
  echo "✅ APK installato con successo!"
  echo "🚀 Avvio l'app..."
  adb shell am start -n app.familytrip.xyz/.MainActivity
  
  echo ""
  echo "📊 Per vedere i log in tempo reale, esegui:"
  echo "   adb logcat | grep -i 'familytrip\|fatal\|crash\|exception'"
else
  echo "❌ Errore durante l'installazione dell'APK"
  exit 1
fi
