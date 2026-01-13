# Mobile Responsive Guide

## Overview
This guide explains how to make the Burnout IQ website mobile-responsive for iPhone and other mobile devices.

## What's Been Set Up

1. **Viewport Meta Tag** - Added to `app/layout.tsx` to ensure proper mobile rendering
2. **useMediaQuery Hook** - Created at `app/lib/useMediaQuery.js` for detecting screen sizes
3. **Global Mobile CSS** - Added to `app/globals.css` for touch targets and text sizing

## Strategy for Making Pages Mobile-Responsive

Since the codebase uses inline styles heavily, here are three approaches:

### Option 1: Use the useIsMobile Hook (Recommended)
Import and use the hook to conditionally apply mobile styles:

```javascript
import { useIsMobile } from '../lib/useMediaQuery'

export default function MyPage() {
  const isMobile = useIsMobile()
  
  return (
    <div style={{
      padding: isMobile ? '20px' : '60px 40px',
      fontSize: isMobile ? '18px' : '24px'
    }}>
      {/* Content */}
    </div>
  )
}
```

### Option 2: CSS Media Queries (For Global Styles)
Add media queries to `app/globals.css` for common patterns:

```css
@media (max-width: 767px) {
  .mobile-padding {
    padding: 20px !important;
  }
  .mobile-text {
    font-size: 18px !important;
  }
}
```

### Option 3: Responsive Values in Inline Styles
Use responsive padding/font sizes:

```javascript
style={{
  padding: 'clamp(20px, 5vw, 60px)',
  fontSize: 'clamp(16px, 4vw, 24px)'
}}
```

## Key Mobile Breakpoints

- **Mobile**: < 768px (iPhones, small Android)
- **Tablet**: 768px - 1023px (iPad, large phones)
- **Desktop**: ≥ 1024px

## Common Mobile Fixes Needed

### Navigation
- Collapse navigation menu on mobile
- Use hamburger menu instead of horizontal links
- Reduce padding and font sizes

### Forms
- Make inputs full-width on mobile
- Stack form fields vertically
- Increase touch target sizes (min 44px)

### Tables
- Make tables scrollable horizontally
- Consider card layout instead of tables on mobile
- Reduce font sizes

### Charts/Graphs
- Make charts responsive (they already use ResponsiveContainer)
- Reduce chart heights on mobile
- Simplify legends

### Typography
- Reduce heading sizes: 64px → 32px, 48px → 28px, etc.
- Reduce paragraph sizes: 24px → 18px, 17px → 15px
- Increase line height for readability

### Padding/Margins
- Reduce container padding: 60px → 20px
- Reduce section spacing: 100px → 40px
- Use consistent mobile padding: 16px-20px

## Priority Pages to Update

1. **Landing Page** (`/landing`) - First impression, critical for conversions
2. **Hours Page** (`/hours`) - Core functionality, most complex
3. **Dashboard** (`/dashboard`) - User's main view
4. **Login Page** (`/login`) - Entry point
5. **Profile/Settings** - Less critical but still important

## Example: Mobile-Responsive Container

```javascript
const containerStyle = {
  maxWidth: '1400px',
  margin: '0 auto',
  padding: isMobile ? '20px 16px' : '60px 40px'
}
```

## Testing on iPhone

1. Use Safari's Responsive Design Mode (Desktop Safari → Develop → Enter Responsive Design Mode)
2. Test on actual iPhone devices
3. Use Chrome DevTools device emulation
4. Test both portrait and landscape orientations

## Next Steps

1. Update landing page with mobile styles
2. Update hours page with mobile styles  
3. Update dashboard with mobile styles
4. Test on actual iPhone devices
5. Iterate based on user feedback
