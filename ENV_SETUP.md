# Environment Variables Setup for iOS

## Important Notes

When building for iOS, environment variables are **baked into the JavaScript bundle** at build time since Next.js uses static export for Capacitor.

This means:
- Environment variables from `.env.local` will be included in the iOS app build
- The values are visible in the JavaScript code (this is fine for `NEXT_PUBLIC_` variables)
- You need to set environment variables **before running** `npm run build`

## Required Environment Variables

Create a `.env.local` file in the project root with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Build Process

The environment variables must be set before building:

```bash
# 1. Make sure .env.local exists with your credentials
# 2. Build (environment variables are included in the build)
npm run build

# 3. Sync to iOS
npm run sync:ios
```

## Security Notes

- `NEXT_PUBLIC_` prefix means these are **public** keys - they're safe to include in client-side code
- The Supabase anon key has Row Level Security (RLS) policies that protect your data
- Never commit `.env.local` to git (it's already in `.gitignore`)

## For Different Environments

If you need different credentials for development vs production:

1. **Development**: Use `.env.local` (not committed to git)
2. **Production**: Set environment variables in your CI/CD pipeline or Xcode build settings

### Option: Using Xcode Build Settings

You can also override environment variables in Xcode:
1. Open the iOS project in Xcode
2. Go to Build Settings
3. Add user-defined settings:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. Modify the build process to inject these into the JavaScript bundle (requires custom build script)

However, the simplest approach is to use `.env.local` with different values for different builds.

## Troubleshooting

**Issue**: "Supabase client not initialized" or API errors
**Solution**: 
- Make sure `.env.local` exists
- Check that variable names start with `NEXT_PUBLIC_`
- Verify values are correct (no extra spaces)
- Rebuild: `npm run build && npm run sync:ios`

**Issue**: Environment variables not updating in iOS app
**Solution**: 
- Environment variables are baked in at build time
- After changing `.env.local`, you must rebuild: `npm run build && npm run sync:ios`
- Then rebuild in Xcode
