-- Create patient_profiles table
CREATE TABLE IF NOT EXISTS public.patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female', 'other')),
  location TEXT NOT NULL,
  health_issue TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create doctor_profiles_temp table for pending approvals
CREATE TABLE IF NOT EXISTS public.doctor_profiles_temp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 150),
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female', 'other')),
  specialization TEXT NOT NULL,
  experience_years INTEGER NOT NULL CHECK (experience_years >= 0),
  consultation_fees NUMERIC(10,2),
  qualification TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  documents JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Update doctors table to include approved doctor data
ALTER TABLE public.doctors 
  ADD COLUMN IF NOT EXISTS doctor_profile_temp_id UUID REFERENCES public.doctor_profiles_temp(id),
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS age INTEGER CHECK (age > 0 AND age < 150),
  ADD COLUMN IF NOT EXISTS sex TEXT CHECK (sex IN ('male', 'female', 'other')),
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS consultation_fee NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Create health_records table
CREATE TABLE IF NOT EXISTS public.health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patient_profiles(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  visit_date DATE NOT NULL,
  symptoms TEXT,
  diagnosis TEXT,
  prescriptions TEXT,
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  follow_up_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles_temp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patient_profiles
CREATE POLICY "Users can insert own patient profile"
  ON public.patient_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own patient profile"
  ON public.patient_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own patient profile"
  ON public.patient_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Doctors can view their patients"
  ON public.patient_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.health_records hr
      JOIN public.doctors d ON d.id = hr.doctor_id
      WHERE hr.patient_id = patient_profiles.id
        AND d.user_id = auth.uid()
        AND has_role(auth.uid(), 'doctor'::app_role)
    )
  );

CREATE POLICY "Admins can view all patient profiles"
  ON public.patient_profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for doctor_profiles_temp
CREATE POLICY "Doctors can insert own temp profile"
  ON public.doctor_profiles_temp FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can view own temp profile"
  ON public.doctor_profiles_temp FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Doctors can update own pending profile"
  ON public.doctor_profiles_temp FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all temp profiles"
  ON public.doctor_profiles_temp FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update temp profiles"
  ON public.doctor_profiles_temp FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for health_records
CREATE POLICY "Patients can view own health records"
  ON public.health_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_profiles pp
      WHERE pp.id = health_records.patient_id
        AND pp.user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can view assigned patient records"
  ON public.health_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.id = health_records.doctor_id
        AND d.user_id = auth.uid()
        AND has_role(auth.uid(), 'doctor'::app_role)
    )
  );

CREATE POLICY "Doctors can create health records"
  ON public.health_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.id = doctor_id
        AND d.user_id = auth.uid()
        AND has_role(auth.uid(), 'doctor'::app_role)
    )
  );

CREATE POLICY "Doctors can update their patient records"
  ON public.health_records FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.doctors d
      WHERE d.id = health_records.doctor_id
        AND d.user_id = auth.uid()
        AND has_role(auth.uid(), 'doctor'::app_role)
    )
  );

CREATE POLICY "Admins can view all health records"
  ON public.health_records FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all health records"
  ON public.health_records FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Update appointments table to reference patient_profiles
ALTER TABLE public.appointments 
  ADD COLUMN IF NOT EXISTS patient_profile_id UUID REFERENCES public.patient_profiles(id);

-- Update doctors RLS to allow patients to view active doctors
CREATE POLICY "Patients can view active doctors"
  ON public.doctors FOR SELECT
  USING (status = 'active' AND has_role(auth.uid(), 'patient'::app_role));

-- Create triggers for updated_at
CREATE TRIGGER update_patient_profiles_updated_at
  BEFORE UPDATE ON public.patient_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_doctor_profiles_temp_updated_at
  BEFORE UPDATE ON public.doctor_profiles_temp
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON public.health_records
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();