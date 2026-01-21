# Fix Production Email Issues

## Why It Works Locally But Not in Production

EmailJS has security settings that restrict which domains can send emails. Your localhost is probably allowed by default, but your production domain needs to be whitelisted.

## Steps to Fix:

### 1. Whitelist Your Domain in EmailJS

1. Go to https://dashboard.emailjs.com
2. Click **Account** (top right)
3. Click **Security** or **Allowed Origins**
4. Add your production domain(s):
   ```
   https://your-domain.vercel.app
   https://your-custom-domain.com
   ```
   (Add both if you have a custom domain)
5. Click **Save**

### 2. Check CORS Settings

In EmailJS dashboard:
1. Go to **Account** → **Security**
2. Make sure **Restrict to Domains** is either:
   - Disabled (allows all domains)
   - OR has your production URL listed

### 3. Verify Environment Variables in Vercel

1. Go to Vercel → Your Project → **Settings** → **Environment Variables**
2. Confirm these are set:
   - `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
   - `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`
   - `NEXT_PUBLIC_EMAILJS_TEMPLATE_ADMIN_NOTIFICATION_ID`
   - `NEXT_PUBLIC_EMAILJS_TEMPLATE_APPROVAL_ID`
   - `NEXT_PUBLIC_ADMIN_EMAIL`

### 4. Check Browser Console on Production

1. Open your production site
2. Press F12 → Console tab
3. Try to approve a user
4. Look for error messages, specifically:
   - **CORS errors** → Domain not whitelisted
   - **"Template not found"** → Wrong template ID
   - **"Service not found"** → Wrong service ID
   - **"Public key not found"** → Missing/wrong public key

### 5. Test with Browser Console

On your production site, open console and run:

```javascript
window.emailjs.send(
  'service_sptnj9x',
  'access_request_confirmat',
  {
    to_email: 'your-test-email@gmail.com',
    to_name: 'Test User',
    user_name: 'Test User',
    user_email: 'test@example.com',
    login_url: window.location.origin + '/login',
    dashboard_url: window.location.origin + '/dashboard',
    hours_url: window.location.origin + '/hours',
    features_url: window.location.origin + '/landing#features',
    help_url: window.location.origin + '/landing'
  },
  '4cZSFjlmgHhHTMjQw'
).then(
  () => console.log('✓ Email sent!'),
  (err) => console.error('✗ Email failed:', err)
)
```

This will tell you exactly what's wrong.

### 6. Common Production Issues:

**Issue: "Failed to execute 'send' on 'EmailJS': Origin not allowed"**
- **Fix**: Add your domain to EmailJS allowed origins (step 1)

**Issue: Environment variables undefined**
- **Fix**: Make sure you selected "Production" when adding env vars in Vercel
- **Fix**: Redeploy after adding environment variables

**Issue: "Public key is required"**
- **Fix**: The public key env var isn't loading
- **Check**: Browser console → Application → Local Storage → verify env vars

**Issue: EmailJS script not loading**
- **Fix**: Check Network tab, the script should load from `https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js`
- **Fix**: Hard refresh page (Cmd+Shift+R)

### 7. Quick Checklist:

- [ ] Production domain added to EmailJS allowed origins
- [ ] All 5 environment variables added in Vercel
- [ ] Environment variables selected for "Production"
- [ ] Site redeployed after adding env vars
- [ ] Browser console shows no CORS errors
- [ ] EmailJS script loads (check Network tab)

### 8. If Still Not Working:

Send me:
1. The exact error from browser console
2. Screenshot of your EmailJS Security settings
3. Your production domain URL

I'll help you debug further!
