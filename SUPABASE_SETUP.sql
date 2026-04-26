-- ============================================================
-- CampusConnect – Supabase SQL Setup
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. USERS TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name             TEXT NOT NULL DEFAULT '',
  email            TEXT NOT NULL DEFAULT '',
  college          TEXT DEFAULT '',
  organization     TEXT DEFAULT '',
  course           TEXT DEFAULT '',
  current_year     TEXT DEFAULT '',
  graduation_year  TEXT DEFAULT '',
  avatar_url       TEXT DEFAULT '',
  college_id_url   TEXT DEFAULT '',
  resume_url       TEXT DEFAULT '',
  points           INTEGER NOT NULL DEFAULT 0,
  streak           INTEGER NOT NULL DEFAULT 0,
  rank             INTEGER NOT NULL DEFAULT 999,
  role             TEXT NOT NULL DEFAULT 'ambassador', -- 'ambassador' | 'admin'
  badges           JSONB NOT NULL DEFAULT '[]',
  tasks_completed  INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read"         ON public.users FOR SELECT USING (true);
CREATE POLICY "Own insert"          ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Own update"          ON public.users FOR UPDATE USING (auth.uid() = id);


-- 2. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT DEFAULT '',
  points       INTEGER NOT NULL DEFAULT 0,
  deadline     TIMESTAMPTZ,
  category     TEXT DEFAULT 'Referral',  -- Referral | Content | Event | Social
  difficulty   TEXT DEFAULT 'Easy',      -- Easy | Medium | Hard
  proof_type   TEXT DEFAULT 'link',      -- link | text | image
  resources    TEXT DEFAULT '',
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads tasks"  ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Admin inserts tasks" ON public.tasks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin deletes tasks" ON public.tasks FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);


-- 3. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id      UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  task_title   TEXT DEFAULT '',
  task_points  INTEGER DEFAULT 0,
  proof        TEXT DEFAULT '',
  summary      TEXT DEFAULT '',
  image_url    TEXT DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at  TIMESTAMPTZ,
  reviewed_by  UUID REFERENCES auth.users(id)
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User sees own; admin sees all" ON public.submissions FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "User submits own"  ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin updates"     ON public.submissions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);


-- 4. POSTS TABLE (Community)
CREATE TABLE IF NOT EXISTS public.posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name     TEXT NOT NULL,
  content      TEXT NOT NULL,
  author_id    UUID REFERENCES public.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Admin creates posts" ON public.posts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- 5. STORAGE SETUP (Run these manually if bucket doesn't exist)
-- Create a public bucket named 'uploads' in Supabase Dashboard -> Storage
-- Then run these policies:

-- Policy: Allow anyone to read uploads
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'uploads' );

-- Policy: Allow authenticated users to upload
-- CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'uploads' AND auth.role() = 'authenticated' );

-- Seed some dummy tasks
INSERT INTO public.tasks (title, description, points, category, difficulty, proof_type, resources) VALUES
('Share Launch Post', 'Share our latest launch post on LinkedIn and tag us.', 50, 'Social', 'Easy', 'link', 'https://linkedin.com/posts/launch'),
('Host a Webinar', 'Organize a 30-min webinar for your college mates about our tool.', 300, 'Event', 'Hard', 'text', 'https://guide.campusconnect.com/webinars'),
('Write a Blog', 'Write a 500-word blog post on Medium about your experience.', 150, 'Content', 'Medium', 'link', 'https://medium.com/write'),
('Refer 5 Friends', 'Get 5 friends to sign up using your unique referral link.', 200, 'Referral', 'Medium', 'text', 'Use your dashboard referral link');
