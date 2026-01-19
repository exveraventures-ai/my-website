#!/bin/bash

# iOS Project Setup Script for Burnout IQ
# This script sets up the iOS Xcode project from your Next.js app

set -e  # Exit on error

echo "🚀 Setting up iOS Xcode project..."
echo ""

# Step 1: Build Next.js app
echo "📦 Step 1: Building Next.js app..."
npm run build

if [ ! -d "out" ]; then
    echo "❌ Error: Build failed - 'out' directory not found"
    exit 1
fi

echo "✅ Next.js build complete"
echo ""

# Step 2: Add iOS platform
echo "🍎 Step 2: Adding iOS platform..."
npx cap add ios

echo "✅ iOS platform added"
echo ""

# Step 3: Sync to iOS
echo "🔄 Step 3: Syncing web assets and plugins to iOS..."
npx cap sync ios

echo "✅ Sync complete"
echo ""

# Step 4: Summary
echo "✨ Setup complete!"
echo ""
echo "📁 iOS project location: ios/App/App.xcodeproj"
echo ""
echo "📝 Next steps:"
echo "   1. Open Xcode: npx cap open ios"
echo "   2. Select your development team in Signing & Capabilities"
echo "   3. Choose a simulator or device"
echo "   4. Click Play (▶️) or press Cmd+R to build and run"
echo ""

# Optionally open Xcode
read -p "Open Xcode now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Opening Xcode..."
    npx cap open ios
fi
