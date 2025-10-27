-- Make child_id nullable in appointments table to support self-bookings
ALTER TABLE public.appointments ALTER COLUMN child_id DROP NOT NULL;

-- Add a column to track if appointment is for self
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS is_self_booking boolean DEFAULT false;

-- Update RLS policies for appointments to support users booking for themselves
DROP POLICY IF EXISTS "Parents can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON public.appointments;
CREATE POLICY "Users can create appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (
  auth.uid() = parent_id AND 
  (has_role(auth.uid(), 'parent'::app_role) OR has_role(auth.uid(), 'user'::app_role))
);

DROP POLICY IF EXISTS "Parents can view own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can view own appointments" ON public.appointments;
CREATE POLICY "Users can view own appointments" 
ON public.appointments 
FOR SELECT 
USING (
  auth.uid() = parent_id AND 
  (has_role(auth.uid(), 'parent'::app_role) OR has_role(auth.uid(), 'user'::app_role))
);

DROP POLICY IF EXISTS "Parents can update own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update own appointments" ON public.appointments;
CREATE POLICY "Users can update own appointments" 
ON public.appointments 
FOR UPDATE 
USING (
  auth.uid() = parent_id AND 
  (has_role(auth.uid(), 'parent'::app_role) OR has_role(auth.uid(), 'user'::app_role))
);