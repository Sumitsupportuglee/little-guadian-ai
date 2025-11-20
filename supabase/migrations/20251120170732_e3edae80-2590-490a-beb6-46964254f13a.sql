-- Add patient and admin roles to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'patient';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'admin';