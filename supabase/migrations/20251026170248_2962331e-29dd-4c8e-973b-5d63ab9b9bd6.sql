-- Create role enum
CREATE TYPE public.app_role AS ENUM ('doctor', 'parent');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roles during signup"
ON public.user_roles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create doctors table
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  specialization TEXT NOT NULL,
  qualification TEXT NOT NULL,
  experience_years INTEGER NOT NULL,
  consultation_fee DECIMAL(10,2),
  location TEXT NOT NULL,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view doctors"
ON public.doctors FOR SELECT
USING (true);

CREATE POLICY "Doctors can update own profile"
ON public.doctors FOR UPDATE
USING (public.has_role(auth.uid(), 'doctor') AND auth.uid() = user_id);

CREATE POLICY "Doctors can insert own profile"
ON public.doctors FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'doctor') AND auth.uid() = user_id);

-- Create doctor_availability table
CREATE TABLE public.doctor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  available_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_booked BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (doctor_id, available_date, start_time)
);

ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available slots"
ON public.doctor_availability FOR SELECT
USING (true);

CREATE POLICY "Doctors can manage own availability"
ON public.doctor_availability FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.doctors
    WHERE doctors.id = doctor_availability.doctor_id
    AND doctors.user_id = auth.uid()
    AND public.has_role(auth.uid(), 'doctor')
  )
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  availability_id UUID REFERENCES public.doctor_availability(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own appointments"
ON public.appointments FOR SELECT
USING (auth.uid() = parent_id AND public.has_role(auth.uid(), 'parent'));

CREATE POLICY "Parents can create appointments"
ON public.appointments FOR INSERT
WITH CHECK (auth.uid() = parent_id AND public.has_role(auth.uid(), 'parent'));

CREATE POLICY "Parents can update own appointments"
ON public.appointments FOR UPDATE
USING (auth.uid() = parent_id AND public.has_role(auth.uid(), 'parent'));

CREATE POLICY "Doctors can view their appointments"
ON public.appointments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.doctors
    WHERE doctors.id = appointments.doctor_id
    AND doctors.user_id = auth.uid()
    AND public.has_role(auth.uid(), 'doctor')
  )
);

CREATE POLICY "Doctors can update their appointments"
ON public.appointments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.doctors
    WHERE doctors.id = appointments.doctor_id
    AND doctors.user_id = auth.uid()
    AND public.has_role(auth.uid(), 'doctor')
  )
);

-- Create doctor_patients table (for patient allocation)
CREATE TABLE public.doctor_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  allocated_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (doctor_id, child_id)
);

ALTER TABLE public.doctor_patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view allocated patients"
ON public.doctor_patients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.doctors
    WHERE doctors.id = doctor_patients.doctor_id
    AND doctors.user_id = auth.uid()
    AND public.has_role(auth.uid(), 'doctor')
  )
);

CREATE POLICY "Parents can view their children's doctors"
ON public.doctor_patients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id = doctor_patients.child_id
    AND children.parent_id = auth.uid()
    AND public.has_role(auth.uid(), 'parent')
  )
);

-- Trigger for doctor updated_at
CREATE TRIGGER update_doctors_updated_at
BEFORE UPDATE ON public.doctors
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for appointments updated_at
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_doctors_location ON public.doctors(location);
CREATE INDEX idx_doctor_availability_doctor_date ON public.doctor_availability(doctor_id, available_date);
CREATE INDEX idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_parent_id ON public.appointments(parent_id);
CREATE INDEX idx_doctor_patients_doctor_id ON public.doctor_patients(doctor_id);
CREATE INDEX idx_doctor_patients_child_id ON public.doctor_patients(child_id);