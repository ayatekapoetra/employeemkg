#!/bin/bash
echo "🎨 Updating App Icons..."
echo ""
echo "Step 1: Clear Expo cache..."
npx expo start --clear &
sleep 3
pkill -f "expo"
echo "✅ Cache cleared"
echo ""
echo "Step 2: Prebuild with new icons..."
npx expo prebuild --clean
echo "✅ Prebuild complete"
echo ""
echo "Step 3: Build Android app..."
echo "Run: npx expo run:android"
echo ""
echo "Done! Your new icons are ready 🎉"
