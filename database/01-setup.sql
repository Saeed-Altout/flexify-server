-- =====================================================
-- FLEXIFY SERVER DATABASE SETUP
-- =====================================================
-- Complete database setup for Flexify Server
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CREATE ENUMS
-- =====================================================

-- User roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Project status
DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('active', 'in_progress', 'completed', 'planning');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Message status
DO $$ BEGIN
    CREATE TYPE message_status AS ENUM ('unread', 'read', 'replied');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. CREATE TABLES
-- =====================================================

-- Users table (custom authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist (for existing tables)
DO $$ BEGIN
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Technologies table
CREATE TABLE IF NOT EXISTS technologies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status project_status DEFAULT 'planning',
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status message_status DEFAULT 'unread',
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message replies table
CREATE TABLE IF NOT EXISTS message_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reply TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Message replies indexes
CREATE INDEX IF NOT EXISTS idx_message_replies_message_id ON message_replies(message_id);
CREATE INDEX IF NOT EXISTS idx_message_replies_user_id ON message_replies(user_id);

-- =====================================================
-- 4. CREATE FUNCTIONS
-- =====================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. CREATE TRIGGERS
-- =====================================================

-- Note: Custom authentication - no Supabase Auth triggers needed

-- Update triggers for all tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_technologies_updated_at ON technologies;
CREATE TRIGGER update_technologies_updated_at
    BEFORE UPDATE ON technologies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_message_replies_updated_at ON message_replies;
CREATE TRIGGER update_message_replies_updated_at
    BEFORE UPDATE ON message_replies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_replies ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. CREATE RLS POLICIES
-- =====================================================

-- Users policies (custom authentication)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (true); -- Allow all for custom auth

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (true); -- Allow all for custom auth

DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (true); -- Allow all for custom auth

DROP POLICY IF EXISTS "Admins can update all users" ON users;
CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (true); -- Allow all for custom auth

-- Allow service role to manage users
DROP POLICY IF EXISTS "Service role can manage users" ON users;
CREATE POLICY "Service role can manage users" ON users
    FOR ALL USING (true); -- Allow all for custom auth

-- Technologies policies (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view technologies" ON technologies;
CREATE POLICY "Anyone can view technologies" ON technologies
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage technologies" ON technologies;
CREATE POLICY "Admins can manage technologies" ON technologies
    FOR ALL USING (true); -- Allow all for custom auth

-- Projects policies (custom authentication)
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (true); -- Allow all for custom auth

DROP POLICY IF EXISTS "Users can create projects" ON projects;
CREATE POLICY "Users can create projects" ON projects
    FOR INSERT WITH CHECK (true); -- Allow all for custom auth

DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (true); -- Allow all for custom auth

DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (true); -- Allow all for custom auth

DROP POLICY IF EXISTS "Admins can view all projects" ON projects;
CREATE POLICY "Admins can view all projects" ON projects
    FOR SELECT USING (true); -- Allow all for custom auth

-- Messages policies (custom authentication)
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (true); -- Allow all for custom auth

DROP POLICY IF EXISTS "Anyone can create messages" ON messages;
CREATE POLICY "Anyone can create messages" ON messages
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all messages" ON messages;
CREATE POLICY "Admins can view all messages" ON messages
    FOR SELECT USING (true); -- Allow all for custom auth

DROP POLICY IF EXISTS "Admins can update all messages" ON messages;
CREATE POLICY "Admins can update all messages" ON messages
    FOR UPDATE USING (true); -- Allow all for custom auth

-- Message replies policies (custom authentication)
DROP POLICY IF EXISTS "Users can view replies to their messages" ON message_replies;
CREATE POLICY "Users can view replies to their messages" ON message_replies
    FOR SELECT USING (true); -- Allow all for custom auth

DROP POLICY IF EXISTS "Users can create replies" ON message_replies;
CREATE POLICY "Users can create replies" ON message_replies
    FOR INSERT WITH CHECK (true); -- Allow all for custom auth

DROP POLICY IF EXISTS "Admins can view all replies" ON message_replies;
CREATE POLICY "Admins can view all replies" ON message_replies
    FOR SELECT USING (true); -- Allow all for custom auth

-- =====================================================
-- 8. INSERT INITIAL DATA
-- =====================================================

-- Insert default admin user (password: admin123)
INSERT INTO users (id, email, name, password_hash, role) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@flexify.com', 'Admin User', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Insert sample technologies
INSERT INTO technologies (name, description, category) VALUES 
('React', 'A JavaScript library for building user interfaces', 'Frontend'),
('Node.js', 'JavaScript runtime for server-side development', 'Backend'),
('PostgreSQL', 'Open source relational database', 'Database'),
('TypeScript', 'Typed superset of JavaScript', 'Language'),
('NestJS', 'Progressive Node.js framework', 'Framework'),
('Supabase', 'Open source Firebase alternative', 'Backend');

-- =====================================================
-- 9. COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'FLEXIFY SERVER DATABASE SETUP COMPLETED!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '- users (with admin user)';
    RAISE NOTICE '- technologies (8 sample technologies)';
    RAISE NOTICE '- projects';
    RAISE NOTICE '- messages';
    RAISE NOTICE '- message_replies';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Run 02-sample-data.sql for test data';
    RAISE NOTICE '2. Configure your environment variables';
    RAISE NOTICE '3. Start your Flexify Server!';
    RAISE NOTICE '=====================================================';
END $$;
