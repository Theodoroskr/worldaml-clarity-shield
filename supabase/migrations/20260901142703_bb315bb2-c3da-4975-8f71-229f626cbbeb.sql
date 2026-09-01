CREATE OR REPLACE FUNCTION public.save_academy_module_progress(_course_id uuid, _completed_modules jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF jsonb_typeof(_completed_modules) <> 'array' THEN
    RAISE EXCEPTION 'completed_modules must be a JSON array';
  END IF;

  INSERT INTO public.academy_progress (user_id, course_id, completed_modules)
  VALUES (auth.uid(), _course_id, _completed_modules)
  ON CONFLICT (user_id, course_id)
  DO UPDATE SET completed_modules = EXCLUDED.completed_modules;
END;
$$;

REVOKE ALL ON FUNCTION public.save_academy_module_progress(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_academy_module_progress(uuid, jsonb) TO authenticated;