# GoDaddy Deployment Guide for Burnout IQ

This guide will walk you through deploying your Burnout IQ Next.js application to GoDaddy hosting.

## Prerequisites

1. **GoDaddy Hosting Account** - Any hosting plan that supports static HTML files
2. **FTP/SSH Access** - You'll need FTP credentials or cPanel File Manager access
3. **Domain Name** - Your domain should be pointing to GoDaddy hosting
4. **Environment Variables** - Your Supabase credentials (URL and anon key)

## Step 1: Prepare Environment Variables

Before building, make sure you have your production Supabase credentials ready:

1. Create or update `.env.local` file in the project root:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Get these values from your Supabase dashboard:
   - Go to your Supabase project
   - Settings → API
   - Copy "Project URL" and "anon/public key"

**Important**: These will be baked into your build, so make sure they're correct!

## Step 2: Build Your Application

Run the build command to create a production-ready static site:

```bash
npm run build:godaddy
```

This will:
- Build your Next.js app as a static site
- Copy the `.htaccess` file to the output directory
- Prepare everything in the `out/` directory

**Alternative** (if the script doesn't work):
```bash
npm run build
# Then manually copy public/.htaccess to out/.htaccess if needed
```

## Step 3: Locate Your Build Files

After building, all your website files will be in the `out/` directory:

```
out/
├── index.html
├── dashboard/
├── hours/
├── compare/
├── login/
├── _next/
│   └── static/
├── .htaccess
└── ... (other files)
```

## Step 4: Upload to GoDaddy

You have two options for uploading:

### Option A: Using cPanel File Manager (Recommended - Easier)

1. **Log into GoDaddy cPanel**:
   - Go to your GoDaddy account
   - Click on "cPanel" or "Manage" for your hosting
   - Open "File Manager"

2. **Navigate to your website root**:
   - Usually `public_html/` or `www/` or `htdocs/`
   - This is where your domain points to

3. **Clear existing files** (if any):
   - Select all files in the root directory
   - Delete them (or backup first)

4. **Upload your files**:
   - Click "Upload" in cPanel File Manager
   - Select ALL files from your `out/` directory
   - Upload them to the root directory (public_html)
   - **Important**: Upload the CONTENTS of the `out/` folder, not the folder itself

5. **Verify .htaccess is uploaded**:
   - Make sure `.htaccess` file is in the root directory
   - If it's hidden, enable "Show Hidden Files" in File Manager settings

### Option B: Using FTP Client

1. **Get your FTP credentials**:
   - From GoDaddy cPanel → FTP Accounts
   - Or use your cPanel username/password
   - FTP server: usually `ftp.yourdomain.com` or an IP address
   - Port: usually 21 (or 22 for SFTP)

2. **Connect with FTP client**:
   - Use FileZilla, Cyberduck, or any FTP client
   - Connect to your FTP server

3. **Navigate to root directory**:
   - Usually `public_html/` or `www/`

4. **Upload files**:
   - Select all files from your local `out/` directory
   - Upload to the remote `public_html/` directory
   - Make sure to upload `.htaccess` file (it might be hidden)

5. **Set permissions** (if needed):
   - Files: 644
   - Folders: 755
   - .htaccess: 644

## Step 5: Verify Deployment

1. **Visit your website**:
   - Go to your domain (e.g., `https://yourdomain.com`)
   - Check if the homepage loads

2. **Test navigation**:
   - Click through different pages
   - Make sure routing works (client-side routing)

3. **Check console for errors**:
   - Open browser DevTools (F12)
   - Check Console tab for any JavaScript errors
   - Check Network tab to ensure assets load correctly

4. **Test Supabase connection**:
   - Try logging in
   - Verify data loads correctly

## Troubleshooting

### Issue: 404 errors on page navigation

**Solution**: 
- Make sure `.htaccess` file is in the root directory
- Verify `.htaccess` content is correct (check the file in this repo)
- Contact GoDaddy support to ensure Apache mod_rewrite is enabled

### Issue: CSS/JavaScript files not loading

**Solution**:
- Check file paths in browser DevTools Network tab
- Ensure `_next/static/` folder was uploaded
- Verify file permissions (644 for files, 755 for folders)

### Issue: Environment variables not working

**Solution**:
- Environment variables are baked into the build
- Rebuild with correct `.env.local` values
- Clear browser cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### Issue: Blank page or white screen

**Solution**:
- Check browser console for errors
- Verify all files uploaded correctly
- Check that `index.html` exists in root
- Ensure `.htaccess` is present and readable

### Issue: "Internal Server Error" or 500 error

**Solution**:
- Check GoDaddy error logs in cPanel
- Verify `.htaccess` syntax is correct
- Contact GoDaddy support to check Apache configuration

### Issue: Files uploaded but site shows old content

**Solution**:
- Clear browser cache
- Clear CDN cache (if using GoDaddy CDN)
- Wait a few minutes for DNS/propagation
- Try incognito/private browsing mode

## Updating Your Site

When you make changes to your code:

1. **Update code locally**
2. **Rebuild**:
   ```bash
   npm run build:godaddy
   ```
3. **Upload new files** to GoDaddy (replace old files)
4. **Clear browser cache** and test

## File Structure After Upload

Your GoDaddy hosting root should look like this:

```
public_html/ (or www/ or hdocs/)
├── index.html
├── .htaccess
├── dashboard/
│   └── index.html
├── hours/
│   └── index.html
├── login/
│   └── index.html
├── _next/
│   └── static/
│       ├── css/
│       └── chunks/
└── ... (other pages)
```

## Security Considerations

1. **Don't commit `.env.local`** - It's already in `.gitignore`
2. **Supabase anon key** - It's public by design, but ensure Row Level Security (RLS) is enabled in Supabase
3. **.htaccess** - Contains basic security headers, but review for your needs

## GoDaddy-Specific Notes

- **Domain**: Make sure your domain DNS is pointing to GoDaddy hosting
- **SSL Certificate**: Enable SSL/HTTPS in GoDaddy cPanel (free Let's Encrypt available)
- **PHP Version**: Not needed for static sites, but ensure static file serving is enabled
- **Apache Modules**: mod_rewrite should be enabled (usually is by default)

## Need Help?

- **GoDaddy Support**: https://support.godaddy.com
- **File Manager Guide**: Check GoDaddy's documentation for cPanel File Manager
- **FTP Guide**: GoDaddy has guides for setting up FTP clients

## Quick Reference Commands

```bash
# Build for GoDaddy
npm run build:godaddy

# Regular build (if script fails)
npm run build

# Check build output
ls -la out/

# Test build locally (optional)
npx serve out
```

---

**Last Updated**: Configuration completed for GoDaddy static hosting deployment.
