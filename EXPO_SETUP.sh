#!/bin/bash

# Expo Project Setup Script
# This script will initialize EAS project on Expo servers

echo "🚀 Expo Project Setup for employeemkg"
echo "======================================"
echo ""

# Check if logged in
echo "📝 Checking EAS login status..."
if ! eas whoami > /dev/null 2>&1; then
    echo "❌ Not logged in to EAS"
    echo "Please run: eas login"
    exit 1
fi

USERNAME=$(eas whoami)
echo "✅ Logged in as: $USERNAME"
echo ""

# Initialize EAS project (interactive)
echo "📦 Initializing EAS project..."
echo "This will create the project on Expo servers"
echo ""
echo "When prompted:"
echo "  1. Select: 'Create a new project'"
echo "  2. Project name: employeemkg"
echo "  3. Confirm: Yes"
echo ""
read -p "Press ENTER to continue..."

eas init

# Check if successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Project created successfully!"
    echo ""
    echo "📊 Project Dashboard:"
    echo "   https://expo.dev/accounts/$USERNAME/projects/employeemkg"
    echo ""
    echo "🔗 Project URL:"
    echo "   exp://exp.host/@$USERNAME/employeemkg"
    echo ""
    echo "✅ Next steps:"
    echo "   1. Run: npm start --tunnel"
    echo "   2. Scan QR with Expo Go"
    echo "   3. Or open: exp://exp.host/@$USERNAME/employeemkg"
    echo ""
else
    echo ""
    echo "❌ Failed to create project"
    echo "Please run manually: eas init"
    exit 1
fi
