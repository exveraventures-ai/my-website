# Burnout IQ

A Next.js dashboard application for high-intensity professionals (banking, PE, consulting, tech, etc.) to track work hours, analyze burnout risk, and maintain sustainable performance.

## Features

- 📊 Dashboard with statistics (Total Hours, Active Deals, Total Entries)
- ⏱️ Log work hours with Deal Nickname
- 📅 Date selection for work logs
- 📋 View recent work logs
- 🔗 Connect Garmin button (ready for API integration)

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hooks** - State management

## Project Structure

```
├── app/
│   ├── globals.css      # Global styles with Tailwind
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main dashboard page
├── package.json
├── tailwind.config.ts   # Tailwind configuration
└── tsconfig.json        # TypeScript configuration
```

## Deployment

This application is configured for static hosting (e.g., GoDaddy, Netlify, Vercel).

### Quick Deploy to GoDaddy

1. **Set environment variables** in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Build for production**:
   ```bash
   npm run build:godaddy
   ```

3. **Upload** all contents of the `out/` directory to your GoDaddy hosting root (`public_html/`)

4. **Verify** `.htaccess` file is uploaded (enables client-side routing)

See `GODADDY_DEPLOYMENT.md` for detailed deployment instructions.

### Other Hosting Options

- **Vercel**: Connect your GitHub repo or use `vercel deploy`
- **Netlify**: Drag & drop the `out/` folder or connect via Git
- **Any static host**: Upload contents of `out/` directory

## Build Scripts

```bash
npm run dev              # Development server
npm run build            # Build for production
npm run build:godaddy    # Build and prepare for GoDaddy
npm run lint             # Run ESLint
```

## Tech Stack

- **Next.js 14** - React framework with App Router (static export)
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Backend (database & authentication)
- **Recharts** - Data visualization
- **Capacitor** - Mobile app support (iOS/Android ready)

## Environment Variables

Required environment variables (set in `.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key

These are baked into the build at build time for static hosting.

## Future Enhancements

- Garmin API integration for automatic activity tracking
- Health metrics tracking
- Advanced analytics and reporting
- Mobile app (iOS/Android) via Capacitor





