# Quick Start: Deploy to GoDaddy

## Pre-Flight Checklist

- [ ] GoDaddy hosting account active
- [ ] Domain pointing to GoDaddy
- [ ] Supabase credentials ready
- [ ] FTP/cPanel access credentials

## Steps

### 1. Set Environment Variables

Create `.env.local` in project root:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

### 2. Build for Production

```bash
npm run build:godaddy
```

### 3. Upload to GoDaddy

**Via cPanel File Manager:**
1. Login to GoDaddy → cPanel → File Manager
2. Navigate to `public_html/` (or `www/`)
3. Delete existing files (backup first!)
4. Upload ALL contents of the `out/` folder to `public_html/`
5. Verify `.htaccess` is uploaded (enable "Show Hidden Files")

**Via FTP:**
1. Connect to `ftp.yourdomain.com`
2. Navigate to `public_html/`
3. Upload all files from `out/` directory
4. Set permissions: files=644, folders=755

### 4. Test

Visit your domain and test:
- Homepage loads
- Navigation works
- Login works
- Dashboard loads data

## Common Issues

- **404 on routes**: Check `.htaccess` is in root
- **Missing CSS/JS**: Verify `_next/static/` folder uploaded
- **Env vars wrong**: Rebuild with correct `.env.local`

## Full Guide

See `GODADDY_DEPLOYMENT.md` for detailed instructions.
