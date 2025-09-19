-- =====================================================
-- ADD BIO FIELD TO USERS TABLE
-- =====================================================
-- This script adds bio field to the users table
-- Run this script in your Supabase SQL editor

-- Add bio column to users table
DO $$
BEGIN
    -- Add bio column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'bio'
    ) THEN
        ALTER TABLE users ADD COLUMN bio TEXT;
        RAISE NOTICE 'Added bio column to users table';
    ELSE
        RAISE NOTICE 'bio column already exists in users table';
    END IF;
END $$;

-- Add comment to the new column
COMMENT ON COLUMN users.bio IS 'User biography/description text';

-- Update the updated_at trigger to include the new column
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
    RAISE NOTICE 'Successfully added bio field to users table';
    RAISE NOTICE 'New field: bio (TEXT)';
END $$;
