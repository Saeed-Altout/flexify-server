-- =====================================================
-- ADD CV FILE FIELDS TO USERS TABLE
-- =====================================================
-- This script adds CV file related fields to the users table
-- Run this script in your Supabase SQL editor

-- Add CV file fields to users table
DO $$
BEGIN
    -- Add cv_file_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'cv_file_url'
    ) THEN
        ALTER TABLE users ADD COLUMN cv_file_url TEXT;
        RAISE NOTICE 'Added cv_file_url column to users table';
    ELSE
        RAISE NOTICE 'cv_file_url column already exists in users table';
    END IF;

    -- Add cv_file_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'cv_file_name'
    ) THEN
        ALTER TABLE users ADD COLUMN cv_file_name VARCHAR(255);
        RAISE NOTICE 'Added cv_file_name column to users table';
    ELSE
        RAISE NOTICE 'cv_file_name column already exists in users table';
    END IF;

    -- Add cv_file_size column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'cv_file_size'
    ) THEN
        ALTER TABLE users ADD COLUMN cv_file_size BIGINT;
        RAISE NOTICE 'Added cv_file_size column to users table';
    ELSE
        RAISE NOTICE 'cv_file_size column already exists in users table';
    END IF;

    -- Add cv_uploaded_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'cv_uploaded_at'
    ) THEN
        ALTER TABLE users ADD COLUMN cv_uploaded_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added cv_uploaded_at column to users table';
    ELSE
        RAISE NOTICE 'cv_uploaded_at column already exists in users table';
    END IF;
END $$;

-- Add comments to the new columns
COMMENT ON COLUMN users.cv_file_url IS 'URL of the uploaded CV file in Supabase storage';
COMMENT ON COLUMN users.cv_file_name IS 'Original filename of the uploaded CV file';
COMMENT ON COLUMN users.cv_file_size IS 'Size of the uploaded CV file in bytes';
COMMENT ON COLUMN users.cv_uploaded_at IS 'Timestamp when the CV file was uploaded';

-- Update the updated_at trigger to include the new columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure the trigger exists for the users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Final success message
DO $$
BEGIN
    RAISE NOTICE 'Successfully added CV file fields to users table';
    RAISE NOTICE 'New fields: cv_file_url, cv_file_name, cv_file_size, cv_uploaded_at';
END $$;
