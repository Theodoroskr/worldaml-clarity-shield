
-- Academy courses
CREATE TABLE public.academy_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  difficulty text NOT NULL DEFAULT 'beginner',
  duration_minutes integer NOT NULL DEFAULT 30,
  image_url text,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Course modules (learning content sections)
CREATE TABLE public.academy_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.academy_courses(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

-- Quiz questions per course
CREATE TABLE public.academy_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.academy_courses(id) ON DELETE CASCADE NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]',
  correct_index integer NOT NULL,
  explanation text,
  sort_order integer NOT NULL DEFAULT 0
);

-- User progress tracking
CREATE TABLE public.academy_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid REFERENCES public.academy_courses(id) ON DELETE CASCADE NOT NULL,
  completed_modules jsonb NOT NULL DEFAULT '[]',
  quiz_score integer,
  quiz_passed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Certificates
CREATE TABLE public.academy_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid REFERENCES public.academy_courses(id) ON DELETE CASCADE NOT NULL,
  holder_name text NOT NULL,
  score integer NOT NULL,
  share_token text NOT NULL DEFAULT substr(md5(random()::text || clock_timestamp()::text), 1, 12),
  issued_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id),
  UNIQUE(share_token)
);

-- RLS
ALTER TABLE public.academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_certificates ENABLE ROW LEVEL SECURITY;

-- Courses: public read for published
CREATE POLICY "Anyone can view published courses" ON public.academy_courses FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage courses" ON public.academy_courses FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Modules: public read
CREATE POLICY "Anyone can view modules of published courses" ON public.academy_modules FOR SELECT USING (course_id IN (SELECT id FROM public.academy_courses WHERE is_published = true));
CREATE POLICY "Admins can manage modules" ON public.academy_modules FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Questions: authenticated read
CREATE POLICY "Authenticated users can view questions" ON public.academy_questions FOR SELECT TO authenticated USING (course_id IN (SELECT id FROM public.academy_courses WHERE is_published = true));
CREATE POLICY "Admins can manage questions" ON public.academy_questions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'));

-- Progress: own records
CREATE POLICY "Users can view own progress" ON public.academy_progress FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own progress" ON public.academy_progress FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own progress" ON public.academy_progress FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Certificates: own + public via share_token
CREATE POLICY "Users can view own certificates" ON public.academy_certificates FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own certificates" ON public.academy_certificates FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Anyone can view certificates by share_token" ON public.academy_certificates FOR SELECT USING (true);
