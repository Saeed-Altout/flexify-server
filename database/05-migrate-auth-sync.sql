-- =====================================================
-- FLEXIFY SERVER AUTH SYNC MIGRATION
-- =====================================================
-- This script migrates existing database to sync auth.users with custom users table
-- Run this AFTER 01-setup.sql if you have existing data
-- =====================================================

-- =====================================================
-- 1. BACKUP EXISTING DATA (if any)
-- =====================================================

-- Create backup table for existing users
CREATE TABLE IF NOT EXISTS users_backup AS 
SELECT * FROM users WHERE id NOT IN (SELECT id FROM auth.users);

-- =====================================================
-- 2. UPDATE USERS TABLE STRUCTURE
-- =====================================================

-- Add avatar_url column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Update the users table to reference auth.users
-- First, drop existing constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- Add foreign key constraint to auth.users
ALTER TABLE users ADD CONSTRAINT users_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Re-add primary key and unique constraints
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);

-- =====================================================
-- 3. CREATE SYNC FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to handle new user creation from auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'USER')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, users.name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
        role = COALESCE(EXCLUDED.role, users.role),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to automatically create user profile when auth.users is created
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 4. SYNC EXISTING AUTH USERS
-- =====================================================

-- Insert missing users from auth.users into public.users
INSERT INTO public.users (id, email, name, avatar_url, role)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', au.email),
    au.raw_user_meta_data->>'avatar_url',
    COALESCE((au.raw_user_meta_data->>'role')::user_role, 'USER')
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    role = COALESCE(EXCLUDED.role, users.role),
    updated_at = NOW();

-- =====================================================
-- 5. UPDATE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "Service role can manage users" ON users;

-- Recreate policies with correct UUID comparison
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'ADMIN'
        )
    );

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'ADMIN'
        )
    );

-- Allow service role to manage users (for triggers)
CREATE POLICY "Service role can manage users" ON users
    FOR ALL USING (auth.role() = 'service_role');

-- =====================================================
-- 6. CLEANUP
-- =====================================================

-- Drop backup table if migration was successful
-- (Uncomment the line below after verifying everything works)
-- DROP TABLE IF EXISTS users_backup;

-- =====================================================
-- 7. COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'AUTH SYNC MIGRATION COMPLETED!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Changes made:';
    RAISE NOTICE '- Added avatar_url column to users table';
    RAISE NOTICE '- Created foreign key relationship with auth.users';
    RAISE NOTICE '- Created sync trigger for new user creation';
    RAISE NOTICE '- Synced existing auth.users to public.users';
    RAISE NOTICE '- Updated RLS policies for proper UUID handling';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test user signup/signin functionality';
    RAISE NOTICE '2. Verify user data is properly synced';
    RAISE NOTICE '3. Delete users_backup table if everything works';
    RAISE NOTICE '=====================================================';
END $$;
