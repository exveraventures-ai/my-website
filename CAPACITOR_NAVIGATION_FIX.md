# Capacitor Navigation Fix

## Problem
Next.js client-side routing (`router.push()`) doesn't work properly in Capacitor iOS apps because they run as static exports in a WebView. Navigation needs to use full page reloads (`window.location.href`) instead.

## Solution
Created a navigation utility (`app/lib/capacitorNavigation.js`) that:
- Detects if running in Capacitor environment
- Uses `window.location.href` for navigation in Capacitor
- Falls back to Next.js router in web browsers
- Handles cases where Capacitor isn't available

## Files Updated
1. **app/lib/capacitorNavigation.js** - New navigation utility
2. **app/login/page.jsx** - Updated all `router.push()` calls
3. **app/dashboard/page.jsx** - Updated all `router.push()` calls
4. **app/hours/page.jsx** - Updated all `router.push()` calls
5. **app/page.jsx** - Updated redirect to use navigation utility
6. **app/components/Navigation.jsx** - Updated sign out to use proper navigation

## Usage
```javascript
import { navigateTo, isCapacitor } from '../lib/capacitorNavigation'

// Instead of: router.push('/dashboard')
navigateTo('/dashboard', router)

// Check if in Capacitor
if (isCapacitor()) {
  // Do Capacitor-specific logic
}
```

## Testing
After rebuilding the iOS app:
1. Sign in should navigate properly
2. Navigation between pages should work
3. Sign out should redirect correctly
4. All links should function properly

## Rebuild Required
After these changes, you need to rebuild and sync:
```bash
npm run build
npx cap sync ios
```

Then rebuild in Xcode.
