#!/bin/bash
# Wrapper script to run iOS simulator
# This script helps work around SDK/runtime version mismatches

# Try to find an available iPhone simulator
# Prefer booted devices, then available devices
DEVICE_INFO=$(xcrun simctl list devices available | grep -i "iphone" | grep -i "pro" | head -1)

if [ -z "$DEVICE_INFO" ]; then
  # Fallback to any iPhone if no Pro is available
  DEVICE_INFO=$(xcrun simctl list devices available | grep -i "iphone" | head -1)
fi

if [ -z "$DEVICE_INFO" ]; then
  echo "Error: No available iPhone simulators found"
  echo "Please create a simulator via Xcode > Window > Devices and Simulators"
  exit 1
fi

# Extract device name (everything before the first parenthesis)
DEVICE_NAME=$(echo "$DEVICE_INFO" | sed 's/^[[:space:]]*\([^(]*\).*/\1/' | xargs)

# Extract device ID (UUID between parentheses)
DEVICE_ID=$(echo "$DEVICE_INFO" | grep -oE '\([A-F0-9-]+\)' | head -1 | tr -d '()')

echo "Using device: $DEVICE_NAME ($DEVICE_ID)"

# Check if device is booted
if echo "$DEVICE_INFO" | grep -q "Booted"; then
  echo "Device $DEVICE_NAME is already booted"
else
  echo "Booting device $DEVICE_NAME..."
  xcrun simctl boot "$DEVICE_ID" 2>/dev/null || {
    echo "Warning: Could not boot device. Continuing anyway..."
  }
fi

# Run Expo
# Note: There's a mismatch between iOS SDK (26.2) and available runtimes (26.0, 26.1)
# This can cause xcodebuild destination errors. Let Expo handle device selection
# which may work around the SDK/runtime mismatch.
echo "Starting Expo build..."
echo "Device: $DEVICE_NAME (will be used if compatible)"
echo ""
echo "Note: If you encounter SDK/runtime errors, you may need to:"
echo "  1. Install iOS 26.2 runtime via Xcode > Settings > Platforms"
echo "  2. Or let Expo auto-select a device (it will prompt you)"
echo ""

# Try with the selected device first
# If it fails due to SDK mismatch, the user can run without -d flag to let Expo choose
npx expo run:ios -d "$DEVICE_NAME"

