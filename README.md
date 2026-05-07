# oniion.cc — Bio Page Platform

A full-featured bio page platform like guns.lol, built with Next.js 14, Neon Serverless Postgres, and deployed on Vercel.

## Features

- 🔐 **Authentication** — Username/password with JWT cookies (30-day sessions)
- 🎨 **Full customization** — Background, colors, fonts, accents, layout
- ✨ **Font effects** — Shimmer, glow, glitch, neon, shadow, outline
- 🌟 **Page effects** — Snow, rain, sakura, bubbles, fireflies, matrix
- 🖱 **Cursor effects** — Sparkle trail, ring, dot
- 🎵 **Music player** — Direct MP3 link with play/pause and waveform animation
- 🔗 **Custom links** — Add unlimited links with custom icons and titles
- 👁 **View counter** — Anti-spoof fingerprinting (IP + User-Agent + Accept headers + daily salt)
- 🏷 **Badge** — Custom text badge with color picker
- 🖼 **Banner** — Image or color banner
- 👤 **Avatar** — Image URL support
- 📐 **Layouts** — Centered or left-aligned
- 🃏 **Card styles** — Glass, solid, outline, neon

## Setup

### 1. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Set up Neon Database
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string from the dashboard

### 3. Configure environment
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Edit `.env.local`:
\`\`\`
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="generate-a-random-32-char-string-here"
NEXT_PUBLIC_APP_URL="https://oniion.cc"
\`\`\`

Generate a JWT secret:
\`\`\`bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
\`\`\`

### 4. Initialize the database
\`\`\`bash
npm run db:push
\`\`\`

### 5. Run locally
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000`

## Deploy to Vercel

### Option A: Vercel CLI
\`\`\`bash
npm i -g vercel
vercel deploy
\`\`\`

### Option B: GitHub
1. Push to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL`

### Custom Domain
In Vercel → Project Settings → Domains, add `oniion.cc` and follow DNS instructions.

## View Counter Anti-Spoof System

The view counter uses a multi-layer fingerprinting approach:
- **IP address** (from CF-Connecting-IP, X-Forwarded-For, X-Real-IP)
- **User-Agent** string
- **Accept-Language** header
- **Accept-Encoding** header
- **JWT secret** (server-side salt — unknown to clients)
- **Daily rotation** — the hash resets per day per user, so:
  - Same visitor on same day: counts once
  - Same visitor next day: counts again (realistic engagement)

All this is hashed server-side, so it's practically impossible to fake without knowing the JWT secret. The unique constraint in the database prevents any duplicate counting even if the hash were guessed.

## Profile URLs

Every user's profile is at: `oniion.cc/[username]`

Example: `oniion.cc/alice`

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Neon Serverless Postgres
- **Auth**: JWT via `jose` library
- **Passwords**: bcryptjs (12 rounds)
- **Hosting**: Vercel
- **Fonts**: Google Fonts (9 options)

## File Structure

\`\`\`
src/
  app/
    page.tsx              # Landing page
    layout.tsx            # Root layout
    globals.css           # Global styles + animations
    login/page.tsx        # Login page
    register/page.tsx     # Register page
    dashboard/page.tsx    # User dashboard
    [username]/page.tsx   # Public profile page
    api/
      auth/
        login/route.ts
        logout/route.ts
        register/route.ts
        session/route.ts
      profile/
        route.ts          # GET/PUT profile
        [username]/route.ts  # Public profile by username
      views/route.ts      # Record & count views
  lib/
    db.ts                 # Neon database client
    auth.ts               # JWT + view fingerprinting
scripts/
  db-push.js              # Database initialization
\`\`\`
