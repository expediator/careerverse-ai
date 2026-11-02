# CareerVerse AI

> **An [Expediator Inc.](https://github.com/expediator) product** — © 2026 Expediator Inc. All rights reserved.

AI-powered career preparation platform for students and fresh graduates. Built with Next.js, Claude AI, and PostgreSQL.

## Features

- **AI Mock Interviews** — HR, Technical, Behavioral, Case Study with scoring
- **Aptitude Prep** — Quantitative, Logical, Verbal with AI-generated questions
- **Domain Labs** — CS/DSA, Data Science, Cybersecurity, Mechanical/Civil/Electrical
- **AI Learning Assistant** — Streaming chat with 5 explanation modes
- **Resume Analyzer** — ATS scoring, skills gap, interview question generation
- **Communication Coach** — Filler word detection, AI feedback on answers
- **Career Path Explorer** — 8+ career tracks with salary ranges and prep roadmaps
- **Progress Analytics** — Score tracking, weekly activity, milestones

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript, Turbopack)
- **Styling:** Tailwind CSS v4
- **Auth:** NextAuth v5 (Google, GitHub, Email/Password)
- **Database:** PostgreSQL via Prisma ORM (Neon/Supabase)
- **AI:** Anthropic Claude (claude-haiku-4-5-20251001)
- **Deployment:** Vercel

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/expediator/careerverse-ai
cd careerverse-ai
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Where to get it |
|----------|----------------|
| `DATABASE_URL` | [Neon](https://neon.tech) or [Supabase](https://supabase.com) — free PostgreSQL |
| `AUTH_SECRET` | Run: `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | [Google Cloud Console](https://console.cloud.google.com) |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | [GitHub Developer Settings](https://github.com/settings/developers) |
| `ANTHROPIC_API_KEY` | [Anthropic Console](https://console.anthropic.com) |

### 3. Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push to GitHub: `git push origin main`
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add all env vars from `.env.example` in the Vercel dashboard
4. Set `AUTH_URL` to your Vercel domain (e.g. `https://careerverse-ai.vercel.app`)
5. Click Deploy

## License

Copyright © 2026 **Expediator Inc.** All rights reserved.

This project is proprietary software under Expediator Inc. Unauthorized copying, distribution, or modification is prohibited without explicit written permission.
