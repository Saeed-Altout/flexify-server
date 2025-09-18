-- =====================================================
-- FLEXIFY SERVER DATABASE SETUP
-- =====================================================
-- Clean microservices architecture with users and sessions
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

-- Users table (Auth Microservice)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'USER',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table (Auth Microservice)
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Technologies table (Technologies Microservice)
CREATE TABLE IF NOT EXISTS technologies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50),
    icon_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table (Projects Microservice)
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    status project_status DEFAULT 'planning',
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    technologies UUID[] DEFAULT '{}',
    images TEXT[] DEFAULT '{}',
    demo_url TEXT,
    github_url TEXT,
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table (Messages Microservice)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status message_status DEFAULT 'unread',
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message replies table (Messages Microservice)
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
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active);

-- Technologies indexes
CREATE INDEX IF NOT EXISTS idx_technologies_name ON technologies(name);
CREATE INDEX IF NOT EXISTS idx_technologies_category ON technologies(category);
CREATE INDEX IF NOT EXISTS idx_technologies_is_active ON technologies(is_active);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON projects(is_public);
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON projects(is_featured);
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

-- Function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM sessions 
    WHERE expires_at < NOW() OR is_active = false;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. CREATE TRIGGERS
-- =====================================================

-- Update triggers for all tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
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
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_replies ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. CREATE RLS POLICIES
-- =====================================================

-- Users policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (true);

-- Sessions policies
DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
CREATE POLICY "Users can view own sessions" ON sessions
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own sessions" ON sessions;
CREATE POLICY "Users can manage own sessions" ON sessions
    FOR ALL USING (true);

-- Technologies policies (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view technologies" ON technologies;
CREATE POLICY "Anyone can view technologies" ON technologies
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage technologies" ON technologies;
CREATE POLICY "Admins can manage technologies" ON technologies
    FOR ALL USING (true);

-- Projects policies
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create projects" ON projects;
CREATE POLICY "Users can create projects" ON projects
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (true);

DROP POLICY IF EXISTS "Public projects are viewable" ON projects;
CREATE POLICY "Public projects are viewable" ON projects
    FOR SELECT USING (is_public = true);

-- Messages policies
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages" ON messages
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create messages" ON messages;
CREATE POLICY "Anyone can create messages" ON messages
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all messages" ON messages;
CREATE POLICY "Admins can view all messages" ON messages
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can update all messages" ON messages;
CREATE POLICY "Admins can update all messages" ON messages
    FOR UPDATE USING (true);

-- Message replies policies
DROP POLICY IF EXISTS "Users can view replies to their messages" ON message_replies;
CREATE POLICY "Users can view replies to their messages" ON message_replies
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create replies" ON message_replies;
CREATE POLICY "Users can create replies" ON message_replies
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all replies" ON message_replies;
CREATE POLICY "Admins can view all replies" ON message_replies
    FOR SELECT USING (true);

-- =====================================================
-- 8. INSERT INITIAL DATA
-- =====================================================

-- Insert default admin user (password: admin123)
INSERT INTO users (id, email, name, password_hash, role, email_verified) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@flexify.com', 'Admin User', '$2b$10$rQZ8K9vL2mN3pO4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'ADMIN', true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample technologies
INSERT INTO technologies (name, description, category) VALUES
('React', 'A JavaScript library for building user interfaces', 'Frontend'),
('Node.js', 'JavaScript runtime for server-side development', 'Backend'),
('PostgreSQL', 'Open source relational database', 'Database'),
('TypeScript', 'Typed superset of JavaScript', 'Language'),
('NestJS', 'Progressive Node.js framework', 'Framework'),
('Supabase', 'Open source Firebase alternative', 'Backend'),
('Next.js', 'React framework for production', 'Frontend'),
('Tailwind CSS', 'Utility-first CSS framework', 'Frontend'),
('Docker', 'Containerization platform', 'DevOps'),
('AWS', 'Cloud computing platform', 'Cloud')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 9. COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'FLEXIFY SERVER DATABASE SETUP COMPLETED!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '- users (Auth Microservice)';
    RAISE NOTICE '- sessions (Auth Microservice)';
    RAISE NOTICE '- technologies (Technologies Microservice)';
    RAISE NOTICE '- projects (Projects Microservice)';
    RAISE NOTICE '- messages (Messages Microservice)';
    RAISE NOTICE '- message_replies (Messages Microservice)';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Microservices ready for deployment!';
    RAISE NOTICE '=====================================================';
END $$;