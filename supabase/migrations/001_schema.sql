-- =============================================
-- Bridge India — Supabase Database Schema
-- Run via: supabase db push
-- =============================================

-- Enable PostGIS for geo queries
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================
-- USERS TABLE (role-based)
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('volunteer', 'ngo', 'admin')),
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- VOLUNTEER PROFILES
-- =============================================
CREATE TABLE IF NOT EXISTS public.volunteer_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  skills TEXT[] DEFAULT '{}',
  availability TEXT DEFAULT 'weekends',
  occupation TEXT DEFAULT '',
  proof_url TEXT,
  job_exp TEXT,
  location_lat DOUBLE PRECISION DEFAULT 16.5062,
  location_lng DOUBLE PRECISION DEFAULT 80.6480,
  points INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  tier TEXT DEFAULT 'newbie' CHECK (tier IN ('newbie', 'reliable', 'elite')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- NGO PROFILES
-- =============================================
CREATE TABLE IF NOT EXISTS public.ngo_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  photos TEXT[] DEFAULT '{}',
  video_url TEXT,
  location_lat DOUBLE PRECISION DEFAULT 16.5062,
  location_lng DOUBLE PRECISION DEFAULT 80.6480,
  verified BOOLEAN DEFAULT FALSE,
  website TEXT,
  contact_email TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- OPPORTUNITIES
-- =============================================
CREATE TABLE IF NOT EXISTS public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  skills_req TEXT[] DEFAULT '{}',
  location TEXT DEFAULT 'Andhra Pradesh',
  location_lat DOUBLE PRECISION DEFAULT 16.5062,
  location_lng DOUBLE PRECISION DEFAULT 80.6480,
  donation_goal NUMERIC,
  slots INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- APPLICATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(volunteer_id, opportunity_id)
);

-- =============================================
-- ACTIVITIES
-- =============================================
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.opportunities(id),
  date DATE DEFAULT CURRENT_DATE,
  hours NUMERIC DEFAULT 1,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BADGES
-- =============================================
CREATE TABLE IF NOT EXISTS public.badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🏅',
  description TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS public.volunteer_badges (
  volunteer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id TEXT REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (volunteer_id, badge_id)
);

-- =============================================
-- NOTIFICATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'general',
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  location_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- AI LOGS
-- =============================================
CREATE TABLE IF NOT EXISTS public.ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  input_hash TEXT,
  output_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Seed default badges
-- =============================================
INSERT INTO public.badges (id, name, icon, description) VALUES
  ('first-step', 'First Step', '👣', 'Complete your first volunteer activity'),
  ('week-warrior', 'Week Warrior', '⚡', '7-day activity streak'),
  ('skill-master', 'Skill Master', '🎯', 'Add 5+ skills to profile'),
  ('storyteller', 'Storyteller', '📖', 'Generate AI story'),
  ('shadow', 'Shadow Pro', '👁️', 'Complete a shadow volunteering session'),
  ('community', 'Community Builder', '🤝', 'Join 3 different NGO teams'),
  ('centurion', 'Centurion', '💯', 'Reach 100 points'),
  ('elite-member', 'Elite Member', '🏆', 'Reach Elite tier')
ON CONFLICT DO NOTHING;
