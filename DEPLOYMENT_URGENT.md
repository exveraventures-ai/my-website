# URGENT DEPLOYMENT INSTRUCTIONS

## Changes Made

### 1. Clock-In/Out Functionality (RESTORED)
- ✅ Big "Start Work Day" / "End Work Day" buttons
- ✅ Real-time timer display when clocked in
- ✅ Auto-saves partial entry to Supabase
- ✅ Prevents double clock-ins
- ✅ Location: `/app/hours/page.jsx` (lines ~155-650)

### 2. Burnout Score V2
- ✅ Breaks >7 days <2h → full reset (0, "RECOVERED 🟢")
- ✅ RecentIntensity = (L7D/L90D) * streakMult (>3d 12h+ = 1.5x)
- ✅ Score = 40*Intensity + 20*(L7D/target) + 20*redEyeWeeks + 20*SD(start/end L30)
- ✅ 0-30🟢, 30-60🟡, 60-85🟠, 85+🔴 CRITICAL
- ✅ Holiday: longestRecentBreak()>14d → -50pts
- ✅ Location: `/app/hours/page.jsx` (lines ~970-1200)

### 3. New Metrics
- ✅ Routine SD (standard deviation of start/end times L30D)
- ✅ High-streak (consecutive >9h days)
- ✅ Recovery days (days since <6h day)
- ✅ Location: `/app/hours/page.jsx` (lines ~970-1100)

### 4. Dashboard Updates
- ✅ Burnout Score KPI with recovery countdown
- ✅ Intensity Index v2
- ✅ Protected weekends % L90D
- ✅ Financial-actionable alerts
- ✅ Location: `/app/dashboard/page.jsx` (lines ~513-620)

### 5. Financial-Actionable Alerts
- ✅ "CRITICAL: L7D 13h. 48h recovery by [date]. >80h/wk=2x errors (JAMA)"
- ✅ "L7D 13h → delay DD. Lock weekend."
- ✅ Research citations included

## Deployment Steps

### Option 1: Deploy to Vercel (Recommended)

```bash
# 1. Commit changes
git add .
git commit -m "URGENT: Restore clock-in/out, implement Burnout V2, add metrics"

# 2. Push to GitHub
git push origin main

# 3. Vercel will auto-deploy (if connected)
# Or manually deploy:
vercel --prod
```

### Option 2: Deploy to GoDaddy (Static Export)

```bash
# 1. Build for production
npm run build:godaddy

# 2. This creates .next/out directory with static files
# 3. Upload .next/out/* to GoDaddy via FTP/SFTP

# Or use the prepare script:
npm run prepare:godaddy
# Then upload the generated files
```

### Option 3: Local Testing First

```bash
# 1. Install dependencies (if needed)
npm install

# 2. Run development server
npm run dev

# 3. Test locally at http://localhost:3000
# - Test clock-in/out functionality
# - Verify burnout score calculations
# - Check new metrics display
# - Test dashboard updates
```

## Critical Testing Checklist

- [ ] Clock-in button creates partial entry in Supabase
- [ ] Timer displays correctly when clocked in
- [ ] Clock-out saves complete entry with calculated hours
- [ ] No double clock-ins possible
- [ ] Burnout score shows correct calculation (v2)
- [ ] Extended breaks (>7 days) reset score to 0
- [ ] Holiday bonus (-50pts) applies correctly
- [ ] New metrics display (Routine SD, High-streak, Recovery days)
- [ ] Dashboard shows burnout KPI with recovery countdown
- [ ] Financial alerts display when score >= 85
- [ ] All calculations handle edge cases (empty logs, null values)

## Database Considerations

No schema changes required! All functionality uses existing `Work_Logs` table:
- `Date` (date)
- `Start Time` (time, nullable for partial entries)
- `End Time` (time, nullable for partial entries)
- `hours` (numeric)
- `user_id` (uuid)

Partial entries (clocked in) have:
- `Start Time` = set
- `End Time` = null
- `hours` = 0

## Environment Variables

No new environment variables needed. Uses existing:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Rollback Plan

If issues occur:

```bash
# Revert to previous commit
git log  # Find previous commit hash
git revert <commit-hash>
git push origin main
```

Or manually restore previous versions:
```bash
git checkout HEAD~1 -- app/hours/page.jsx
git checkout HEAD~1 -- app/dashboard/page.jsx
```

## Performance Notes

- New calculations are optimized but may be slower with 1000+ log entries
- Consider adding caching for dashboard metrics if needed
- Clock-in/out uses real-time timer (updates every 1s) - minimal impact

## Support

If issues occur:
1. Check browser console for errors
2. Check Supabase logs for database errors
3. Verify RLS policies allow partial entry creation
4. Test with minimal data first

## Research Citations (for financial team)

Burnout calculation based on:
- JAMA research: >80h/wk = 2x cognitive errors
- Sleep debt = 1.5x error rate (multiple studies)
- Circadian disruption impact on decision-making
- Recovery break effectiveness (>7 days for full reset)
