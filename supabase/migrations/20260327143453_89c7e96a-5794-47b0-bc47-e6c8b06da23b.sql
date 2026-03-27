ALTER TABLE public.academy_courses ADD COLUMN category TEXT NOT NULL DEFAULT 'global';
ALTER TABLE public.academy_courses ADD COLUMN cpd_hours NUMERIC NOT NULL DEFAULT 0;