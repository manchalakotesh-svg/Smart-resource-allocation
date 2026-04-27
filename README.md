# Bridge India

> AI-powered Smart Volunteer Resource Allocation Platform for Andhra Pradesh

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env
# Fill in your Supabase URL + Anon Key in .env

# 3. Run development server
npm run dev
```

## 🔧 Setup Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run migrations:
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```
3. Deploy Edge Functions:
   ```bash
   supabase functions deploy ai-storyteller
   supabase functions deploy ai-matchmaker
   supabase functions deploy chatbot
   ```
4. Set Edge Function secrets in Supabase Dashboard:
   - `GEMINI_API_KEY` — Google AI Studio key
   - (SUPABASE_URL and SERVICE_ROLE_KEY are auto-set)

## 🌐 Deploy to Vercel

```bash
npm install -g vercel
npm run build
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic CI/CD.

## 📱 Features

| Feature | Description |
|---|---|
| Role-Based Auth | Volunteer / NGO / Admin portals with Supabase RLS |
| OTP Auth | Email + Phone OTP via Supabase Auth |
| AI Storyteller | Gemini generates personalized volunteer narratives |
| AI Matchmaker | Skill + location + tier-based compatibility scoring |
| NGO Chatbot | Gemini-powered contextual query assistant |
| Gamification | Points, streaks, badges, Newbie→Reliable→Elite tiers |
| PDF Certificates | Auto-generated volunteer activity certificates |
| Shadow Volunteering | Observe live NGO sessions before committing |
| Admin Panel | Approve users, manage badges, view analytics |
| Analytics | Platform-wide charts, tier distribution, district heatmaps |

## 📍 Andhra Pradesh Focus

Default map center: Vijayawada (16.5062°N, 80.6480°E)

All 13 AP districts are tracked in the analytics dashboard.

## 🗂️ Project Structure

```
src/
├── pages/
│   ├── Home.tsx              # Public landing page
│   ├── auth/                 # Role-based auth flows
│   ├── volunteer/            # Volunteer portal pages
│   ├── ngo/                  # NGO portal pages
│   └── admin/                # Admin portal pages
├── components/               # Shared UI components
├── lib/                      # Supabase, AI, gamification utils
└── context/                  # Auth context

supabase/
├── migrations/               # SQL schema + RLS policies
└── functions/                # Deno AI Edge Functions
```

## 🎮 Gamification Tiers

| Tier | Requirement |
|---|---|
| 🟡 Newbie | < 100 points |
| 🟢 Reliable | 100+ points + 2 badges |
| 🔵 Elite | 500+ points + 5 badges |
