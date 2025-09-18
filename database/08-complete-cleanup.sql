-- =====================================================
-- COMPLETE CLEANUP FOR CUSTOM AUTHENTICATION
-- =====================================================
-- This script completely cleans up the database and prepares it
-- for custom authentication system
-- =====================================================

-- =====================================================
-- 1. DROP ALL TABLES AND CONSTRAINTS
-- =====================================================

-- Drop all tables in reverse dependency order
DROP TABLE IF EXISTS message_replies CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS technologies CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- 2. DROP ALL ENUMS
-- =====================================================

DROP TYPE IF EXISTS message_status CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- =====================================================
-- 3. DROP ALL FUNCTIONS
-- =====================================================

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- =====================================================
-- 4. COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'COMPLETE CLEANUP COMPLETED!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'All tables, constraints, and functions have been removed.';
    RAISE NOTICE 'You can now run 01-setup.sql to create a fresh database.';
    RAISE NOTICE '=====================================================';
END $$;
