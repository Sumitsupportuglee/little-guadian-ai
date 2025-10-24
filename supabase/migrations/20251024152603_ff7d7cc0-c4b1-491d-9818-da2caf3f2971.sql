-- Create medications table for tracking prescribed medicines
CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id UUID NOT NULL,
  health_issue TEXT NOT NULL,
  medicine_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  doctor_contact TEXT,
  prescribed_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_child FOREIGN KEY (child_id) REFERENCES public.children(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

-- Create policies for medication access
CREATE POLICY "Parents can view medications for own children"
ON public.medications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id = medications.child_id
    AND children.parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can insert medications for own children"
ON public.medications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id = medications.child_id
    AND children.parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can update medications for own children"
ON public.medications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id = medications.child_id
    AND children.parent_id = auth.uid()
  )
);

CREATE POLICY "Parents can delete medications for own children"
ON public.medications
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.children
    WHERE children.id = medications.child_id
    AND children.parent_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_medications_updated_at
BEFORE UPDATE ON public.medications
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create index for better query performance
CREATE INDEX idx_medications_child_id ON public.medications(child_id);
CREATE INDEX idx_medications_prescribed_date ON public.medications(prescribed_date DESC);