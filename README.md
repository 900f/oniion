# oniion.cc — Bio Page Platform

A full-featured bio page platform like guns.lol, built with Next.js 14, Neon Serverless Postgres, UploadThing, and Vercel.

## Features

- 🔐 **Authentication** — Username/password with JWT cookies (30-day sessions)
- 🎨 **Full customization** — Background, colors, fonts, accents, layout
- 🔤 **Custom font upload** — Upload any .ttf / .otf / .woff / .woff2 file via UploadThing
- ✨ **Font effects** — Shimmer, glow, glitch, neon, shadow, outline
- 🌟 **Page effects** — Snow, rain, sakura, bubbles, fireflies, matrix
- 🖱 **Cursor effects** — Sparkle trail, ring, dot
- 🎵 **Music player** — Direct MP3 link with play/pause and waveform animation
- 🔗 **Custom links** — Add unlimited links with custom icons and titles
- 👁 **View counter** — Anti-spoof fingerprinting
- 🏷 **Badge** — Custom text badge with color picker
- 🖼 **Banner** — Image or color banner
- 📐 **Layouts** — Centered or left-aligned
- 🃏 **Card styles** — Glass, solid, outline, neon

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Neon Database
1. Go to [neon.tech](https://neon.tech) — create a free account
2. Create a new project
3. Copy your connection string

### 3. Set up UploadThing (custom font uploads)
1. Go to [uploadthing.com](https://uploadthing.com) — create a free account
2. Create a new app
3. Copy your **Secret Key** and **App ID**

### 4. Configure environment
```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:
```
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="your-random-secret"
NEXT_PUBLIC_APP_URL="https://oniion.cc"
UPLOADTHING_SECRET="sk_live_xxxxxxxxxxxxxxxx"
UPLOADTHING_APP_ID="xxxxxxxx"
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Initialize the database
```bash
npm run db:push
```

### 6. Run locally
```bash
npm run dev
# Visit http://localhost:3000
```

## Deploy to Vercel

```bash
npm i -g vercel
vercel deploy
```

Add all 5 environment variables in the Vercel dashboard, then point `oniion.cc` to your deployment via Settings → Domains.

## Custom Font System

Users can upload their own font files (.ttf, .otf, .woff, .woff2) up to 4MB each. The flow:

1. User uploads font in Dashboard → Appearance → Font
2. File is uploaded to UploadThing CDN, URL stored in Neon DB
3. On the public profile page, a `@font-face` rule is injected with the stored URL
4. The font loads from UploadThing's CDN with `font-display: swap` for fast rendering

If no custom font is set, one of the 9 preset Google Fonts is used instead.

## View Counter Anti-Spoof

Views use multi-layer fingerprinting: IP + User-Agent + Accept headers + server-side JWT secret, hashed and stored with a daily salt. Same visitor = 1 count per day. Impossible to fake without the secret.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Neon Serverless Postgres
- **File storage**: UploadThing (font files)
- **Auth**: JWT via `jose`
- **Passwords**: bcryptjs (12 rounds)
- **Hosting**: Vercel
