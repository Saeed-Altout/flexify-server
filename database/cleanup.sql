-- =====================================================
-- FLEXIFY SERVER DATABASE CLEANUP SCRIPT
-- =====================================================
-- This script removes all data and schema from the database
-- WARNING: This will delete ALL data!

-- =====================================================
-- 1. DROP TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS set_users_updated_at ON users;
DROP TRIGGER IF EXISTS set_sessions_updated_at ON sessions;
DROP TRIGGER IF EXISTS set_technologies_updated_at ON technologies;
DROP TRIGGER IF EXISTS set_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS set_messages_updated_at ON messages;
DROP TRIGGER IF EXISTS set_message_replies_updated_at ON message_replies;

-- =====================================================
-- 2. DROP VIEWS
-- =====================================================

DROP VIEW IF EXISTS project_stats;
DROP VIEW IF EXISTS message_stats;

-- =====================================================
-- 3. DROP FUNCTIONS
-- =====================================================

DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS clean_expired_sessions();
DROP FUNCTION IF EXISTS get_user_stats(UUID);

-- =====================================================
-- 4. DROP TABLES (in reverse order due to foreign keys)
-- =====================================================

DROP TABLE IF EXISTS message_replies CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS technologies CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- 5. DROP ENUMS
-- =====================================================

DROP TYPE IF EXISTS message_status CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- =====================================================
-- CLEANUP COMPLETE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'FLEXIFY SERVER DATABASE CLEANUP COMPLETE!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'All tables, functions, triggers, and enums have been removed.';
    RAISE NOTICE 'You can now run the setup.sql script to recreate everything.';
    RAISE NOTICE '=====================================================';
END $$;
