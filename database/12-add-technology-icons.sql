-- =====================================================
-- ADD ICON FIELDS TO TECHNOLOGIES TABLE
-- =====================================================
-- This script adds icon-related fields to the technologies table
-- Run this script in your Supabase SQL Editor

-- Add icon fields to technologies table
DO $$
BEGIN
    -- Add icon_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'technologies' AND column_name = 'icon_url'
    ) THEN
        ALTER TABLE technologies ADD COLUMN icon_url TEXT;
        RAISE NOTICE 'Added icon_url column to technologies table';
    ELSE
        RAISE NOTICE 'icon_url column already exists in technologies table';
    END IF;

    -- Add icon_filename column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'technologies' AND column_name = 'icon_filename'
    ) THEN
        ALTER TABLE technologies ADD COLUMN icon_filename VARCHAR(255);
        RAISE NOTICE 'Added icon_filename column to technologies table';
    ELSE
        RAISE NOTICE 'icon_filename column already exists in technologies table';
    END IF;

    -- Add icon_size column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'technologies' AND column_name = 'icon_size'
    ) THEN
        ALTER TABLE technologies ADD COLUMN icon_size BIGINT;
        RAISE NOTICE 'Added icon_size column to technologies table';
    ELSE
        RAISE NOTICE 'icon_size column already exists in technologies table';
    END IF;

    -- Add icon_uploaded_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'technologies' AND column_name = 'icon_uploaded_at'
    ) THEN
        ALTER TABLE technologies ADD COLUMN icon_uploaded_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added icon_uploaded_at column to technologies table';
    ELSE
        RAISE NOTICE 'icon_uploaded_at column already exists in technologies table';
    END IF;
END $$;

-- Add comments to the new columns
COMMENT ON COLUMN technologies.icon_url IS 'URL of the technology icon image';
COMMENT ON COLUMN technologies.icon_filename IS 'Original filename of the technology icon';
COMMENT ON COLUMN technologies.icon_size IS 'Size of the technology icon file in bytes';
COMMENT ON COLUMN technologies.icon_uploaded_at IS 'Timestamp when the technology icon was uploaded';

-- Update the updated_at trigger to include the new columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure the trigger exists for the technologies table
DROP TRIGGER IF EXISTS update_technologies_updated_at ON technologies;
CREATE TRIGGER update_technologies_updated_at
    BEFORE UPDATE ON technologies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Final success message
DO $$
BEGIN
    RAISE NOTICE 'Successfully added icon fields to technologies table';
    RAISE NOTICE 'New fields: icon_url, icon_filename, icon_size, icon_uploaded_at';
END $$;
