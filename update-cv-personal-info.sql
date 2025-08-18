-- 🗄️ Update CV Personal Info Table Migration Script
-- Run this script in your Supabase SQL Editor to add new fields

-- Add new columns to existing cv_personal_info table
ALTER TABLE IF EXISTS public.cv_personal_info 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS core_values JSONB,
ADD COLUMN IF NOT EXISTS birthday DATE,
ADD COLUMN IF NOT EXISTS experience TEXT;

-- Update existing records to have default values if needed
-- You can customize these default values based on your requirements
UPDATE public.cv_personal_info 
SET 
  name = COALESCE(name, ''),
  email = COALESCE(email, ''),
  location = COALESCE(location, ''),
  core_values = COALESCE(core_values, '[]'::jsonb),
  experience = COALESCE(experience, '')
WHERE name IS NULL 
   OR email IS NULL 
   OR location IS NULL 
   OR core_values IS NULL 
   OR experience IS NULL;

-- Add comments to document the new fields
COMMENT ON COLUMN public.cv_personal_info.name IS 'Full name of the person';
COMMENT ON COLUMN public.cv_personal_info.email IS 'Email address';
COMMENT ON COLUMN public.cv_personal_info.location IS 'Geographic location';
COMMENT ON COLUMN public.cv_personal_info.core_values IS 'Core values as JSON array of {label, value} objects';
COMMENT ON COLUMN public.cv_personal_info.birthday IS 'Birthday in DATE format';
COMMENT ON COLUMN public.cv_personal_info.experience IS 'Professional experience summary';
COMMENT ON COLUMN public.cv_personal_info.profile_picture IS 'Profile picture file path/reference (not URL)';

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'cv_personal_info' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
