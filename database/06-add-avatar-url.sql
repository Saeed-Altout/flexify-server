-- =====================================================
-- ADD AVATAR_URL COLUMN TO EXISTING USERS TABLE
-- =====================================================
-- Simple script to add avatar_url column to existing users table
-- Run this if you only need to add the avatar_url column
-- =====================================================

-- Add avatar_url column if it doesn't exist
DO $$ BEGIN
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
    RAISE NOTICE 'Added avatar_url column to users table';
EXCEPTION
    WHEN duplicate_column THEN 
        RAISE NOTICE 'avatar_url column already exists in users table';
END $$;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'AVATAR_URL COLUMN ADDED SUCCESSFULLY!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'The users table now includes the avatar_url field.';
    RAISE NOTICE 'You can now store user avatar URLs in your database.';
    RAISE NOTICE '=====================================================';
END $$;
