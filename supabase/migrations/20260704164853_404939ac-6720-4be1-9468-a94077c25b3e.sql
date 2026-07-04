CREATE OR REPLACE FUNCTION public.enqueue_seminar_discount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _price INTEGER;
BEGIN
  IF NEW.completed_at IS NOT NULL
     AND (TG_OP = 'INSERT' OR OLD.completed_at IS NULL) THEN

    PERFORM public.enqueue_outreach(
      NEW.user_id,
      'seminar_discount',
      'seminar-discount-suite',
      jsonb_build_object('course_id', NEW.course_id),
      INTERVAL '24 hours'
    );

    SELECT price_eur_cents INTO _price
    FROM public.academy_courses
    WHERE id = NEW.course_id;

    IF COALESCE(_price, 0) = 0 THEN
      PERFORM public.enqueue_outreach(
        NEW.user_id,
        'academy_paid_discount',
        'academy-paid-discount',
        jsonb_build_object('course_id', NEW.course_id),
        INTERVAL '24 hours'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;