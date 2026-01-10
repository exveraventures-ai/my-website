# How to Deploy to Website via GitHub

## Quick Steps

### 1. Check Your Changes
```bash
git status
```
This shows all files you've modified.

### 2. Add All Changes
```bash
git add .
```
This stages all your changes for commit.

### 3. Commit Your Changes
```bash
git commit -m "Add access control system, fix stat cards, add email notifications"
```
Replace the message with a description of your changes.

### 4. Push to GitHub
```bash
git push origin main
```
(Or `git push origin master` if your main branch is called "master")

### 5. Wait for Auto-Deploy
If your GitHub is connected to Vercel/Netlify, it will automatically deploy. Check your deployment dashboard.

---

## Detailed Step-by-Step

### Step 1: Open Terminal
- Open Terminal on your Mac
- Navigate to your project:
  ```bash
  cd "/Users/alexnash/Banker Tracker"
  ```

### Step 2: Check What Changed
```bash
git status
```
You should see a list of modified files (red) and new files (untracked).

### Step 3: Stage All Changes
```bash
git add .
```
This adds all changes to be committed.

### Step 4: Commit Changes
```bash
git commit -m "Your commit message here"
```
Good commit messages:
- "Add access control system and admin panel"
- "Fix stat cards showing incorrect totals"
- "Add email notifications for access requests"
- "Remove password requirement from access requests"

### Step 5: Push to GitHub
```bash
git push origin main
```
If you get an error about "main" vs "master", try:
```bash
git push origin master
```

### Step 6: Check Your Deployment
- **If using Vercel**: Go to https://vercel.com → Your project → Deployments
- **If using Netlify**: Go to https://app.netlify.com → Your site → Deploys
- **If using GitHub Pages**: Changes appear automatically (may take a few minutes)

---

## Troubleshooting

### "Not a git repository"
If you get this error, you need to initialize git first:
```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
```

### "Authentication failed"
You need to authenticate with GitHub:
- Use GitHub CLI: `gh auth login`
- Or use a Personal Access Token instead of password
- Or set up SSH keys

### "Branch 'main' does not exist"
Check what branch you're on:
```bash
git branch
```
Then push to the correct branch:
```bash
git push origin YOUR_BRANCH_NAME
```

### "Everything up-to-date"
This means all your local changes are already pushed to GitHub. Your deployment should already be updated.

---

## First Time Setup (If Not Done Yet)

### 1. Create GitHub Repository
1. Go to https://github.com
2. Click "New repository"
3. Name it (e.g., "burnout-iq")
4. Don't initialize with README (if you already have code)
5. Click "Create repository"

### 2. Connect Local Project to GitHub
```bash
cd "/Users/alexnash/Banker Tracker"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual GitHub username and repository name.

---

## Auto-Deploy Setup

### Vercel (Recommended)
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Vercel will auto-deploy on every push

### Netlify
1. Go to https://app.netlify.com
2. Sign in with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select your repository
5. Netlify will auto-deploy on every push

---

## Environment Variables

**IMPORTANT**: After deploying, make sure to add your environment variables in your deployment platform:

### In Vercel:
1. Go to Project Settings → Environment Variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_EMAILJS_SERVICE_ID` (if using EmailJS)
   - `NEXT_PUBLIC_EMAILJS_TEMPLATE_REQUEST_ID`
   - `NEXT_PUBLIC_EMAILJS_TEMPLATE_APPROVAL_ID`
   - `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`

### In Netlify:
1. Go to Site Settings → Environment Variables
2. Add the same variables as above

---

## Quick Command Reference

```bash
# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "Your message"

# Push
git push origin main

# See what branch you're on
git branch

# See recent commits
git log --oneline -5
```

---

## After Pushing

1. **Wait 1-2 minutes** for deployment to complete
2. **Check deployment logs** in Vercel/Netlify dashboard
3. **Visit your website** to verify changes are live
4. **Test the new features**:
   - Request access (no password)
   - Admin panel stat cards
   - Email notifications (if set up)

---

## Need Help?

If you get stuck:
1. Check the error message in terminal
2. Check deployment logs in Vercel/Netlify
3. Make sure environment variables are set
4. Verify your GitHub repository is connected to deployment platform

