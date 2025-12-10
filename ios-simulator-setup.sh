#!/bin/bash

echo "🎯 iOS Simulator Setup for Checklog Testing"
echo "=========================================="
echo ""

# Check if simulator is running
SIMULATOR_ID=$(xcrun simctl list devices | grep "Booted" | awk -F'[()]' '{print $2}' | head -1)

if [ -z "$SIMULATOR_ID" ]; then
  echo "❌ No iOS Simulator is running"
  echo ""
  echo "Please start the simulator first:"
  echo "  npx expo run:ios"
  exit 1
fi

echo "✅ Found running simulator: $SIMULATOR_ID"
echo ""

# Set location to Kopi Kebun (default office location)
LOCATION="\-5.145160066718947,119.44856202229857"
echo "📍 Setting location to: Kopi Kebun Office"
echo "   Coordinates: -5.145160, 119.448562"
echo ""

xcrun simctl location "$SIMULATOR_ID" set "$LOCATION"

if [ $? -eq 0 ]; then
  echo "✅ Location set successfully!"
  echo ""
  echo "Next steps:"
  echo "  1. Open the app on simulator"
  echo "  2. Go to Checklog screen"
  echo "  3. Map should now display with your location"
  echo "  4. Distance should show < 100m"
  echo ""
  echo "💡 To change location, run:"
  echo "   ./set-simulator-location.sh [location-name]"
else
  echo "❌ Failed to set location"
  exit 1
fi
