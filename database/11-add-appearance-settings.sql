-- =====================================================
-- ADD APPEARANCE SETTINGS TO USERS TABLE
-- =====================================================
-- This script adds appearance settings fields to the users table
-- Run this script in your Supabase SQL Editor

-- Add appearance settings columns to users table
DO $$
BEGIN
    -- Add theme column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'theme'
    ) THEN
        ALTER TABLE users ADD COLUMN theme VARCHAR(20) DEFAULT 'system';
        RAISE NOTICE 'Added theme column to users table';
    ELSE
        RAISE NOTICE 'theme column already exists in users table';
    END IF;

    -- Add timezone column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'timezone'
    ) THEN
        ALTER TABLE users ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC';
        RAISE NOTICE 'Added timezone column to users table';
    ELSE
        RAISE NOTICE 'timezone column already exists in users table';
    END IF;

    -- Add time_format column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'time_format'
    ) THEN
        ALTER TABLE users ADD COLUMN time_format VARCHAR(10) DEFAULT '12';
        RAISE NOTICE 'Added time_format column to users table';
    ELSE
        RAISE NOTICE 'time_format column already exists in users table';
    END IF;

    -- Add language column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'language'
    ) THEN
        ALTER TABLE users ADD COLUMN language VARCHAR(10) DEFAULT 'en';
        RAISE NOTICE 'Added language column to users table';
    ELSE
        RAISE NOTICE 'language column already exists in users table';
    END IF;

    -- Add date_format column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'date_format'
    ) THEN
        ALTER TABLE users ADD COLUMN date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY';
        RAISE NOTICE 'Added date_format column to users table';
    ELSE
        RAISE NOTICE 'date_format column already exists in users table';
    END IF;
END $$;

-- Add comments to the new columns
COMMENT ON COLUMN users.theme IS 'User theme preference: light, dark, or system';
COMMENT ON COLUMN users.timezone IS 'User timezone (e.g., UTC, America/New_York, Europe/London)';
COMMENT ON COLUMN users.time_format IS 'Time format preference: 12 or 24';
COMMENT ON COLUMN users.language IS 'User language preference (ISO 639-1 code)';
COMMENT ON COLUMN users.date_format IS 'Date format preference (e.g., MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)';

-- Add check constraints for valid values
ALTER TABLE users ADD CONSTRAINT check_theme 
    CHECK (theme IN ('light', 'dark', 'system'));

ALTER TABLE users ADD CONSTRAINT check_time_format 
    CHECK (time_format IN ('12', '24'));

ALTER TABLE users ADD CONSTRAINT check_language 
    CHECK (language IN ('en', 'ar', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'));

ALTER TABLE users ADD CONSTRAINT check_date_format 
    CHECK (date_format IN ('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'MM-DD-YYYY'));

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
    RAISE NOTICE 'Successfully added appearance settings to users table';
    RAISE NOTICE 'New fields: theme, timezone, time_format, language, date_format';
    RAISE NOTICE 'Valid themes: light, dark, system';
    RAISE NOTICE 'Valid time formats: 12, 24';
    RAISE NOTICE 'Valid languages: en, ar, fr, de, it, pt, ru, zh, ja, ko';
    RAISE NOTICE 'Valid date formats: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY, MM-DD-YYYY';
END $$;
