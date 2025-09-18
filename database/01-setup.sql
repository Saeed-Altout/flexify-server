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
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');

-- Project status
CREATE TYPE project_status AS ENUM ('active', 'in_progress', 'completed', 'planning');

-- Message status
CREATE TYPE message_status AS ENUM ('unread', 'read', 'replied');

-- =====================================================
-- 2. CREATE TABLES
-- =====================================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Technologies table
CREATE TABLE technologies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status project_status DEFAULT 'planning',
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
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
CREATE TABLE message_replies (
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
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Projects indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at);

-- Messages indexes
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Message replies indexes
CREATE INDEX idx_message_replies_message_id ON message_replies(message_id);
CREATE INDEX idx_message_replies_user_id ON message_replies(user_id);

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

-- Update triggers for all tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_technologies_updated_at
    BEFORE UPDATE ON technologies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'ADMIN'
        )
    );

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'ADMIN'
        )
    );

-- Technologies policies (public read, admin write)
CREATE POLICY "Anyone can view technologies" ON technologies
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage technologies" ON technologies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'ADMIN'
        )
    );

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create projects" ON projects
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all projects" ON projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'ADMIN'
        )
    );

-- Messages policies
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Anyone can create messages" ON messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all messages" ON messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'ADMIN'
        )
    );

CREATE POLICY "Admins can update all messages" ON messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'ADMIN'
        )
    );

-- Message replies policies
CREATE POLICY "Users can view replies to their messages" ON message_replies
    FOR SELECT USING (
        auth.uid()::text = user_id::text OR
        EXISTS (
            SELECT 1 FROM messages 
            WHERE id = message_id 
            AND user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can create replies" ON message_replies
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all replies" ON message_replies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'ADMIN'
        )
    );

-- =====================================================
-- 8. INSERT INITIAL DATA
-- =====================================================

-- Insert default admin user
INSERT INTO users (id, email, name, role) VALUES 
('00000000-0000-0000-0000-000000000001', 'admin@flexify.com', 'Admin User', 'ADMIN');

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
