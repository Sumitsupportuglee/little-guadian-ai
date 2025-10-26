-- Fix search_path for existing functions
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_vaccination_records_for_child()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.vaccination_records (child_id, schedule_id, is_completed)
  SELECT NEW.id, id, false
  FROM public.vaccination_schedule;
  RETURN NEW;
END;
$$;