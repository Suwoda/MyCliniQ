-- Add drug_group column to drugs table
ALTER TABLE public.drugs ADD COLUMN IF NOT EXISTS drug_group TEXT;
