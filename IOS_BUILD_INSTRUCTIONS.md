# iOS Build Instructions for Burnout IQ

This document contains step-by-step instructions for building the Burnout IQ iOS app once you have access to macOS with Xcode.

## Prerequisites

Before you begin, ensure you have:

1. **macOS** (macOS 12.0 or later)
2. **Xcode** (latest version from App Store - requires macOS 12.0+)
3. **Xcode Command Line Tools** - Install via: `xcode-select --install`
4. **Node.js** (v18 or later) - Already installed for Next.js
5. **Apple Developer Account** ($99/year) - Required for testing on devices and App Store submission
6. **CocoaPods** - Will be installed automatically by Capacitor

## Environment Variables

Make sure you have your Supabase credentials set in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important**: These environment variables will be baked into the static build. For production, you'll need to configure them in Xcode or use Capacitor's environment variable handling.

## Initial Setup (First Time Only)

When you first get access to macOS, run these commands:

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Build the Next.js app as a static export
npm run build

# 3. Add the iOS platform to Capacitor
npx cap add ios

# 4. Sync the web assets to iOS
npm run sync:ios
```

## Building the iOS App

### Option 1: Quick Build and Open in Xcode

```bash
# Build Next.js and sync to iOS, then open Xcode
npm run build:ios
npm run open:ios
```

This will:
1. Build your Next.js app as a static site
2. Copy all files to the iOS project
3. Sync Capacitor plugins
4. Open Xcode automatically

### Option 2: Manual Steps

```bash
# 1. Build the Next.js app
npm run build

# 2. Sync to iOS (copies files and updates native dependencies)
npm run sync:ios

# 3. Open in Xcode
npm run open:ios
```

## Configuring in Xcode

Once Xcode opens:

1. **Select Your Team**:
   - Click on the "Burnout IQ" project in the left sidebar
   - Select the "Burnout IQ" target
   - Go to "Signing & Capabilities"
   - Under "Team", select your Apple Developer account
   - Xcode will automatically generate a provisioning profile

2. **Configure Bundle Identifier** (if needed):
   - Currently set to: `com.burnoutiQ.app`
   - Can be changed in Signing & Capabilities if you have a different domain

3. **Set Deployment Target**:
   - Recommended: iOS 13.0 or later
   - Located in: Project Settings → Deployment Info

4. **Configure App Icon** (Optional):
   - App icons should be placed in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
   - Use [AppIcon.co](https://www.appicon.co/) or similar tool to generate all required sizes
   - Or manually add icons: 20pt, 29pt, 40pt, 60pt at @2x and @3x resolutions

5. **Configure Splash Screen** (Optional):
   - Splash screen assets go in the same Assets.xcassets folder
   - Capacitor will handle the basic splash screen automatically

## Environment Variables for iOS

Since Next.js builds a static export, environment variables are baked into the JavaScript at build time. However, for iOS you might want to handle them differently:

### Option 1: Keep them in the build (Current Setup)
- Environment variables from `.env.local` are included in the static build
- Works fine for most use cases

### Option 2: Use Capacitor Preferences (For sensitive data)
Add to `capacitor.config.ts`:
```typescript
plugins: {
  Preferences: {
    // Store non-sensitive config here
  }
}
```

## Testing the App

### On iOS Simulator

1. In Xcode, select a simulator from the device menu (top toolbar)
2. Click the "Play" button (▶️) or press `Cmd + R`
3. Wait for the build to complete and simulator to launch

### On Physical Device

1. Connect your iPhone/iPad via USB
2. Select your device from the device menu in Xcode
3. First time: Trust the computer on your device when prompted
4. Click "Play" button - Xcode will install and launch the app

**Note**: For physical device testing, you need an Apple Developer account and the device must be registered in your Apple Developer account.

## Updating the App

Whenever you make changes to your Next.js code:

```bash
# 1. Build the updated Next.js app
npm run build

# 2. Sync changes to iOS
npm run sync:ios

# 3. Rebuild in Xcode (Cmd + R)
```

For code changes, you typically don't need to reopen Xcode - just rebuild after syncing.

## Common Issues and Solutions

### Issue: "Module not found" errors
**Solution**: Run `npm install` again, then `npm run sync:ios`

### Issue: "No signing certificate found"
**Solution**: 
- Make sure you're signed into Xcode with your Apple ID
- Go to Xcode → Settings → Accounts
- Add your Apple ID if not already added
- Select your team in Signing & Capabilities

### Issue: Build fails with CocoaPods errors
**Solution**: 
```bash
cd ios/App
pod install
cd ../..
npm run sync:ios
```

### Issue: Environment variables not working
**Solution**: Remember that static Next.js exports bake in env vars at build time. Make sure `.env.local` exists and has the correct values before running `npm run build`.

### Issue: Capacitor plugins not working
**Solution**: Make sure you've run `npm run sync:ios` after installing new Capacitor plugins.

## Preparing for App Store Submission

1. **Update Version and Build Number**:
   - In Xcode: Select project → General tab
   - Set "Version" (e.g., 1.0.0)
   - Set "Build" (e.g., 1)

2. **Create App Store Listing**:
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Create a new app
   - Fill in all required metadata (description, screenshots, etc.)

3. **Archive and Upload**:
   - In Xcode: Product → Archive
   - Wait for archive to complete
   - Click "Distribute App"
   - Follow the wizard to upload to App Store Connect

4. **Submit for Review**:
   - In App Store Connect, submit your build for review
   - Fill out any required information (export compliance, etc.)

## Cloud macOS Alternatives

If you don't have access to a Mac, consider these services:

1. **MacInCloud** (https://www.macincloud.com/)
   - Rent a Mac in the cloud
   - Starting at ~$30/month

2. **AWS EC2 Mac Instances** (https://aws.amazon.com/ec2/instance-types/mac/)
   - Hourly billing for macOS instances
   - Good for occasional builds

3. **Codemagic CI/CD** (https://codemagic.io/)
   - Free tier available
   - Can build iOS apps in the cloud
   - Requires GitHub/GitLab integration

4. **GitHub Actions with macOS Runner**
   - Free for public repos
   - Can build and archive iOS apps
   - Requires Apple Developer account for signing

## Project Structure

```
.
├── app/              # Next.js app directory
├── out/              # Static export (generated after build)
├── ios/              # iOS project (generated by Capacitor)
│   └── App/          # Main iOS app project
├── capacitor.config.ts   # Capacitor configuration
├── next.config.mjs   # Next.js configuration (configured for static export)
└── package.json      # NPM scripts and dependencies
```

## Useful Commands Reference

```bash
# Development
npm run dev              # Run Next.js dev server

# Building
npm run build            # Build Next.js static site
npm run build:ios        # Build and sync to iOS (opens Xcode)
npm run sync:ios         # Sync web assets to iOS
npm run copy:ios         # Copy only web assets (no plugin sync)
npm run open:ios         # Open iOS project in Xcode

# Other
npm run lint             # Run ESLint
```

## Next Steps

1. Get access to macOS/Xcode
2. Run the initial setup commands
3. Build and test in simulator
4. Test on a physical device
5. Prepare App Store assets (screenshots, descriptions)
6. Submit to App Store

## Support

If you encounter issues:
1. Check Capacitor documentation: https://capacitorjs.com/docs
2. Check Next.js static export docs: https://nextjs.org/docs/pages/building-your-application/deploying/static-exports
3. Check Xcode console for detailed error messages

---

**Last Updated**: Configuration completed for static export and iOS build setup.
