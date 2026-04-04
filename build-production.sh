#!/bin/bash

# Build configuration for EAS
echo "Building MKG Employee Mobile App for production..."

# Setup environment variables for Android keystore
export EAS_BUILD_ANDROID_KEYSTORE_PASSWORD="android"
export EAS_BUILD_ANDROID_KEY_ALIAS="employeemkg"
export EAS_BUILD_ANDROID_KEY_PASSWORD="android"
export EAS_BUILD_ANDROID_KEYSTORE_PATH="credentials/MKG-EMPLOYEE"

echo "Starting Android build..."
eas build --platform android --profile production &

echo "Starting iOS build..."
eas build --platform ios --profile production &

wait
echo "Build process completed!"