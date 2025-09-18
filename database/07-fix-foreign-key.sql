-- =====================================================
-- FIX FOREIGN KEY CONSTRAINT
-- =====================================================
-- This script removes the foreign key constraint from users table
-- and allows custom authentication to work properly
-- =====================================================

-- Drop the foreign key constraint if it exists
DO $$ 
BEGIN
    -- Check if the constraint exists and drop it
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_id_fkey' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE users DROP CONSTRAINT users_id_fkey;
        RAISE NOTICE 'Dropped foreign key constraint users_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint users_id_fkey does not exist';
    END IF;
END $$;

-- Ensure the users table has the correct structure
DO $$ 
BEGIN
    -- Add password_hash column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
        RAISE NOTICE 'Added password_hash column to users table';
    ELSE
        RAISE NOTICE 'password_hash column already exists';
    END IF;

    -- Add avatar_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE users ADD COLUMN avatar_url TEXT;
        RAISE NOTICE 'Added avatar_url column to users table';
    ELSE
        RAISE NOTICE 'avatar_url column already exists';
    END IF;
END $$;

-- Insert the admin user if it doesn't exist
INSERT INTO users (id, email, name, password_hash, role) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@flexify.com', 'Admin User', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'FOREIGN KEY CONSTRAINT FIX COMPLETED!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Changes made:';
    RAISE NOTICE '- Removed foreign key constraint to auth.users';
    RAISE NOTICE '- Added password_hash column if missing';
    RAISE NOTICE '- Added avatar_url column if missing';
    RAISE NOTICE '- Inserted admin user if not exists';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Custom authentication is now ready to use!';
    RAISE NOTICE '=====================================================';
END $$;
