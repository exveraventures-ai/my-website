# Vercel Deployment Setup for Burnout IQ

## Required Environment Variables

For the build to work correctly, you **MUST** set the following environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

### Production Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### How to Get These Values

1. Go to your Supabase project dashboard
2. Click on **Settings** → **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Important Notes

- These are **public** keys (prefixed with `NEXT_PUBLIC_`), so they're safe to include in client-side code
- They will be baked into your static build during the build process
- Set them for **Production**, **Preview**, and **Development** environments as needed
- After adding them, trigger a new deployment for the changes to take effect

### Build Process

With static export (`output: 'export'`), Next.js:
1. Builds your application
2. Bakes environment variables into the JavaScript bundle
3. Creates a fully static site in the `out/` directory
4. Deploys this static site to Vercel

The environment variables MUST be available during the build step, otherwise the build will fail or use placeholder values.

## Troubleshooting

### Build fails with "supabaseUrl is required"

**Solution**: Make sure environment variables are set in Vercel project settings and trigger a new deployment.

### App works locally but not on Vercel

**Solution**: Check that environment variables are set in Vercel (not just locally in `.env.local`).

### Environment variables not updating

**Solution**: After adding/changing environment variables in Vercel, you must trigger a new deployment. Vercel doesn't automatically rebuild when env vars change.
