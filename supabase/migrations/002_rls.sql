-- =============================================
-- Bridge India — Row Level Security Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ngo_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USERS policies
-- =============================================
CREATE POLICY "Users can read own record" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own record" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update users" ON public.users
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- VOLUNTEER PROFILES policies
-- =============================================
CREATE POLICY "Volunteers can read own profile" ON public.volunteer_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "NGOs can read volunteer profiles" ON public.volunteer_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ngo', 'admin'))
  );

-- =============================================
-- NGO PROFILES policies
-- =============================================
CREATE POLICY "NGOs manage own profile" ON public.ngo_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read verified NGO profiles" ON public.ngo_profiles
  FOR SELECT USING (verified = TRUE OR auth.uid() = user_id);

-- =============================================
-- OPPORTUNITIES policies
-- =============================================
CREATE POLICY "NGOs manage own opportunities" ON public.opportunities
  FOR ALL USING (auth.uid() = ngo_id);

CREATE POLICY "Authenticated users can read opportunities" ON public.opportunities
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- =============================================
-- APPLICATIONS policies
-- =============================================
CREATE POLICY "Volunteers manage own applications" ON public.applications
  FOR ALL USING (auth.uid() = volunteer_id);

CREATE POLICY "NGOs can read/update applications for their opportunities" ON public.applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.opportunities
      WHERE id = opportunity_id AND ngo_id = auth.uid()
    )
  );

-- =============================================
-- ACTIVITIES policies
-- =============================================
CREATE POLICY "Volunteers see own activities" ON public.activities
  FOR ALL USING (auth.uid() = volunteer_id);

CREATE POLICY "Admins see all activities" ON public.activities
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- BADGES policies
-- =============================================
CREATE POLICY "Anyone can read badges" ON public.badges
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage badges" ON public.badges
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- VOLUNTEER BADGES policies
-- =============================================
CREATE POLICY "Volunteers read own badges" ON public.volunteer_badges
  FOR SELECT USING (auth.uid() = volunteer_id);

CREATE POLICY "System can insert badges" ON public.volunteer_badges
  FOR INSERT WITH CHECK (TRUE);

-- =============================================
-- NOTIFICATIONS policies
-- =============================================
CREATE POLICY "Users read own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- AI LOGS policies
-- =============================================
CREATE POLICY "Admins read AI logs" ON public.ai_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can insert AI logs" ON public.ai_logs
  FOR INSERT WITH CHECK (TRUE);
