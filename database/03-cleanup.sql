-- =====================================================
-- FLEXIFY SERVER DATABASE CLEANUP
-- =====================================================
-- This will delete ALL data and tables
-- Use with caution!
-- =====================================================

-- =====================================================
-- 1. DROP TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_technologies_updated_at ON technologies;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
DROP TRIGGER IF EXISTS update_message_replies_updated_at ON message_replies;

-- =====================================================
-- 2. DROP TABLES
-- =====================================================

DROP TABLE IF EXISTS message_replies CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS technologies CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- 3. DROP FUNCTIONS
-- =====================================================

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- =====================================================
-- 4. DROP TYPES/ENUMS
-- =====================================================

DROP TYPE IF EXISTS message_status CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- =====================================================
-- 5. COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'DATABASE CLEANUP COMPLETED!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'All tables, functions, and types have been removed.';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now run 01-setup.sql to recreate everything.';
    RAISE NOTICE '=====================================================';
END $$;
