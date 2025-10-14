-- Create profiles table for parents
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create children table
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  place_of_birth TEXT,
  birth_health_issues TEXT[],
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create vaccination_schedule table (master schedule)
CREATE TABLE public.vaccination_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  age_weeks INTEGER,
  age_months INTEGER,
  age_years INTEGER,
  vaccine_name TEXT NOT NULL,
  vaccine_code TEXT NOT NULL,
  purpose TEXT NOT NULL,
  is_optional BOOLEAN DEFAULT false,
  sort_order INTEGER NOT NULL
);

-- Create vaccination_records table (track individual vaccinations per child)
CREATE TABLE public.vaccination_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  schedule_id UUID REFERENCES public.vaccination_schedule(id) ON DELETE CASCADE NOT NULL,
  administered_date DATE,
  is_completed BOOLEAN DEFAULT false,
  notes TEXT,
  verified_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(child_id, schedule_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccination_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccination_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for children
CREATE POLICY "Parents can view own children"
  ON public.children FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert own children"
  ON public.children FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update own children"
  ON public.children FOR UPDATE
  USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete own children"
  ON public.children FOR DELETE
  USING (auth.uid() = parent_id);

-- RLS Policies for vaccination_schedule (public read)
CREATE POLICY "Anyone can view vaccination schedule"
  ON public.vaccination_schedule FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for vaccination_records
CREATE POLICY "Parents can view own children's vaccination records"
  ON public.vaccination_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = vaccination_records.child_id
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert vaccination records for own children"
  ON public.vaccination_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = vaccination_records.child_id
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update vaccination records for own children"
  ON public.vaccination_records FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.children
      WHERE children.id = vaccination_records.child_id
      AND children.parent_id = auth.uid()
    )
  );

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_children
  BEFORE UPDATE ON public.children
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_vaccination_records
  BEFORE UPDATE ON public.vaccination_records
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert vaccination schedule data for India 2025
INSERT INTO public.vaccination_schedule (age_weeks, age_months, age_years, vaccine_name, vaccine_code, purpose, is_optional, sort_order) VALUES
  -- At Birth
  (0, 0, 0, 'BCG', 'BCG', 'Tuberculosis prevention', false, 1),
  (0, 0, 0, 'OPV (0 dose)', 'OPV-0', 'Polio prevention', false, 2),
  (0, 0, 0, 'Hepatitis B (birth dose)', 'HepB-Birth', 'Hepatitis B prevention', false, 3),
  
  -- 6 Weeks
  (6, 0, 0, 'DPT-1', 'DPT-1', 'Diphtheria, Pertussis, Tetanus protection', false, 4),
  (6, 0, 0, 'IPV-1', 'IPV-1', 'Polio prevention', false, 5),
  (6, 0, 0, 'Hepatitis B-2', 'HepB-2', 'Hepatitis B prevention', false, 6),
  (6, 0, 0, 'Hib-1', 'Hib-1', 'Haemophilus influenzae type b prevention', false, 7),
  (6, 0, 0, 'Rotavirus-1', 'Rota-1', 'Rotavirus prevention', false, 8),
  (6, 0, 0, 'PCV-1', 'PCV-1', 'Pneumococcal disease prevention', false, 9),
  
  -- 10 Weeks
  (10, 0, 0, 'DPT-2', 'DPT-2', 'Booster dose for DPT', false, 10),
  (10, 0, 0, 'IPV-2', 'IPV-2', 'Booster dose for IPV', false, 11),
  (10, 0, 0, 'Hib-2', 'Hib-2', 'Booster dose for Hib', false, 12),
  (10, 0, 0, 'Rotavirus-2', 'Rota-2', 'Booster dose for Rotavirus', false, 13),
  (10, 0, 0, 'PCV-2', 'PCV-2', 'Booster dose for PCV', false, 14),
  
  -- 14 Weeks
  (14, 0, 0, 'DPT-3', 'DPT-3', 'Complete primary series for DPT', false, 15),
  (14, 0, 0, 'IPV-3', 'IPV-3', 'Complete primary series for IPV', false, 16),
  (14, 0, 0, 'Hib-3', 'Hib-3', 'Complete primary series for Hib', false, 17),
  (14, 0, 0, 'Rotavirus-3', 'Rota-3', 'Complete primary series for Rotavirus', false, 18),
  (14, 0, 0, 'PCV-3', 'PCV-3', 'Complete primary series for PCV', false, 19),
  
  -- 6 Months
  (0, 6, 0, 'Hepatitis B-3', 'HepB-3', 'Complete Hep B immunity', false, 20),
  
  -- 9 Months
  (0, 9, 0, 'Measles-Rubella (MR-1)', 'MR-1', 'Measles and Rubella protection', false, 21),
  (0, 9, 0, 'Japanese Encephalitis (JE)', 'JE-1', 'JE protection in endemic areas', false, 22),
  
  -- 12 Months
  (0, 12, 0, 'Hepatitis A', 'HepA-1', 'Hepatitis A prevention', true, 23),
  
  -- 15 Months
  (0, 15, 0, 'MMR-2', 'MMR-2', 'Booster for Measles, Mumps, Rubella', false, 24),
  (0, 15, 0, 'Varicella-1', 'Varicella-1', 'Chickenpox prevention', false, 25),
  (0, 15, 0, 'PCV Booster', 'PCV-Booster', 'Booster dose for PCV', false, 26),
  
  -- 18 Months
  (0, 18, 0, 'DPT Booster-1', 'DPT-B1', 'Continued DPT protection', false, 27),
  (0, 18, 0, 'Hib Booster', 'Hib-Booster', 'Continued Hib protection', false, 28),
  (0, 18, 0, 'IPV Booster', 'IPV-Booster', 'Continued Polio protection', false, 29),
  
  -- 5 Years
  (0, 0, 5, 'DPT Booster-2', 'DPT-B2', 'School-entry booster for DPT', false, 30),
  (0, 0, 5, 'OPV Booster', 'OPV-Booster', 'School-entry booster for Polio', false, 31);

-- Create function to auto-create vaccination records for new children
CREATE OR REPLACE FUNCTION public.create_vaccination_records_for_child()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.vaccination_records (child_id, schedule_id, is_completed)
  SELECT NEW.id, id, false
  FROM public.vaccination_schedule;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create vaccination records
CREATE TRIGGER create_vaccination_records_on_child_insert
  AFTER INSERT ON public.children
  FOR EACH ROW EXECUTE FUNCTION public.create_vaccination_records_for_child();