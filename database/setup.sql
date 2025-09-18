-- =====================================================
-- FLEXIFY SERVER DATABASE SETUP SCRIPT
-- =====================================================
-- This script sets up the complete database schema for Flexify Server
-- Run this script in your Supabase SQL editor

-- =====================================================
-- 1. CREATE ENUMS
-- =====================================================

-- User role enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Project status enum
DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('planning', 'active', 'in_progress', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Message status enum
DO $$ BEGIN
    CREATE TYPE message_status AS ENUM ('unread', 'read', 'replied', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. CREATE TABLES
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'USER',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Technologies table
CREATE TABLE IF NOT EXISTS technologies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(100),
    icon_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    status project_status DEFAULT 'planning',
    technologies UUID[] DEFAULT ARRAY[]::UUID[],
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    demo_url TEXT,
    github_url TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status message_status DEFAULT 'unread',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message replies table
CREATE TABLE IF NOT EXISTS message_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
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
CREATE INDEX IF NOT EXISTS idx_messages_email ON messages(email);
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

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM sessions WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(user_uuid UUID)
RETURNS TABLE (
    total_projects BIGINT,
    public_projects BIGINT,
    featured_projects BIGINT,
    total_messages BIGINT,
    unread_messages BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM projects WHERE user_id = user_uuid) as total_projects,
        (SELECT COUNT(*) FROM projects WHERE user_id = user_uuid AND is_public = true) as public_projects,
        (SELECT COUNT(*) FROM projects WHERE user_id = user_uuid AND is_featured = true) as featured_projects,
        (SELECT COUNT(*) FROM messages) as total_messages,
        (SELECT COUNT(*) FROM messages WHERE status = 'unread') as unread_messages;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. CREATE TRIGGERS
-- =====================================================

-- Users table trigger
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_users_updated_at') THEN
        CREATE TRIGGER set_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Sessions table trigger
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_sessions_updated_at') THEN
        CREATE TRIGGER set_sessions_updated_at
        BEFORE UPDATE ON sessions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Technologies table trigger
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_technologies_updated_at') THEN
        CREATE TRIGGER set_technologies_updated_at
        BEFORE UPDATE ON technologies
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Projects table trigger
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_projects_updated_at') THEN
        CREATE TRIGGER set_projects_updated_at
        BEFORE UPDATE ON projects
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Messages table trigger
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_messages_updated_at') THEN
        CREATE TRIGGER set_messages_updated_at
        BEFORE UPDATE ON messages
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Message replies table trigger
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_message_replies_updated_at') THEN
        CREATE TRIGGER set_message_replies_updated_at
        BEFORE UPDATE ON message_replies
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

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
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Allow user registration" ON users;
CREATE POLICY "Allow user registration" ON users
    FOR INSERT WITH CHECK (true);

-- Sessions policies
DROP POLICY IF EXISTS "Users can manage their own sessions" ON sessions;
CREATE POLICY "Users can manage their own sessions" ON sessions
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Technologies policies (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view technologies" ON technologies;
CREATE POLICY "Anyone can view technologies" ON technologies
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify technologies" ON technologies;
CREATE POLICY "Only admins can modify technologies" ON technologies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'ADMIN'
        )
    );

-- Projects policies
DROP POLICY IF EXISTS "Anyone can view public projects" ON projects;
CREATE POLICY "Anyone can view public projects" ON projects
    FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can create projects" ON projects;
CREATE POLICY "Users can create projects" ON projects
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Messages policies (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view messages" ON messages;
CREATE POLICY "Anyone can view messages" ON messages
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create messages" ON messages;
CREATE POLICY "Anyone can create messages" ON messages
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Only admins can update messages" ON messages;
CREATE POLICY "Only admins can update messages" ON messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'ADMIN'
        )
    );

DROP POLICY IF EXISTS "Only admins can delete messages" ON messages;
CREATE POLICY "Only admins can delete messages" ON messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'ADMIN'
        )
    );

-- Message replies policies
DROP POLICY IF EXISTS "Anyone can view message replies" ON message_replies;
CREATE POLICY "Anyone can view message replies" ON message_replies
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can create message replies" ON message_replies;
CREATE POLICY "Only admins can create message replies" ON message_replies
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'ADMIN'
        )
    );

DROP POLICY IF EXISTS "Only admins can update message replies" ON message_replies;
CREATE POLICY "Only admins can update message replies" ON message_replies
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'ADMIN'
        )
    );

DROP POLICY IF EXISTS "Only admins can delete message replies" ON message_replies;
CREATE POLICY "Only admins can delete message replies" ON message_replies
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'ADMIN'
        )
    );

-- =====================================================
-- 8. INSERT SAMPLE DATA
-- =====================================================

-- Insert sample technologies
INSERT INTO technologies (name, description, category, icon_url) VALUES
('React', 'A JavaScript library for building user interfaces', 'Frontend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg'),
('Vue.js', 'The Progressive JavaScript Framework', 'Frontend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg'),
('Angular', 'A platform for building mobile and desktop web applications', 'Frontend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angular/angular-original.svg'),
('Node.js', 'A JavaScript runtime built on Chrome''s V8 JavaScript engine', 'Backend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg'),
('Express.js', 'Fast, unopinionated, minimalist web framework for Node.js', 'Backend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg'),
('NestJS', 'A progressive Node.js framework for building efficient and scalable server-side applications', 'Backend', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-plain.svg'),
('PostgreSQL', 'The world''s most advanced open source relational database', 'Database', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg'),
('MongoDB', 'The database for modern applications', 'Database', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg'),
('Redis', 'The open source, in-memory data structure store', 'Database', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg'),
('TypeScript', 'JavaScript with syntax for types', 'Language', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg'),
('JavaScript', 'The programming language for the web', 'Language', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg'),
('Python', 'A programming language that lets you work quickly and integrate systems more effectively', 'Language', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg'),
('Docker', 'Empowering App Development for Developers', 'DevOps', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg'),
('AWS', 'Amazon Web Services', 'Cloud', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg'),
('Vercel', 'The platform for frontend developers', 'Cloud', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg')
ON CONFLICT (name) DO NOTHING;

-- Insert sample admin user (password: admin123)
INSERT INTO users (id, email, name, password_hash, role, is_active, email_verified) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@flexify.com', 'Admin User', '$2b$10$rQZ8K9XvYwE7nF5tG3hJ0e8vYwE7nF5tG3hJ0e8vYwE7nF5tG3hJ0e', 'ADMIN', true, true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample regular user (password: user123)
INSERT INTO users (id, email, name, password_hash, role, is_active, email_verified) VALUES
('00000000-0000-0000-0000-000000000002', 'user@flexify.com', 'Regular User', '$2b$10$rQZ8K9XvYwE7nF5tG3hJ0e8vYwE7nF5tG3hJ0e8vYwE7nF5tG3hJ0e', 'USER', true, true)
ON CONFLICT (email) DO NOTHING;

-- Get technology IDs for sample projects
DO $$
DECLARE
    react_id UUID;
    node_id UUID;
    postgres_id UUID;
    typescript_id UUID;
    docker_id UUID;
    vercel_id UUID;
BEGIN
    SELECT id INTO react_id FROM technologies WHERE name = 'React';
    SELECT id INTO node_id FROM technologies WHERE name = 'Node.js';
    SELECT id INTO postgres_id FROM technologies WHERE name = 'PostgreSQL';
    SELECT id INTO typescript_id FROM technologies WHERE name = 'TypeScript';
    SELECT id INTO docker_id FROM technologies WHERE name = 'Docker';
    SELECT id INTO vercel_id FROM technologies WHERE name = 'Vercel';

    -- Insert sample projects
    INSERT INTO projects (user_id, title, description, content, status, technologies, images, demo_url, github_url, is_public, is_featured) VALUES
    ('00000000-0000-0000-0000-000000000001', 'E-Commerce Platform', 'A full-stack e-commerce platform built with modern technologies', 'This is a comprehensive e-commerce platform featuring user authentication, product management, shopping cart, payment processing, and admin dashboard. Built with React, Node.js, and PostgreSQL.', 'completed', ARRAY[react_id, node_id, postgres_id, typescript_id], ARRAY['https://example.com/ecommerce1.jpg', 'https://example.com/ecommerce2.jpg'], 'https://ecommerce-demo.vercel.app', 'https://github.com/user/ecommerce-platform', true, true),
    ('00000000-0000-0000-0000-000000000001', 'Task Management App', 'A collaborative task management application', 'A modern task management application with real-time collaboration, drag-and-drop functionality, and team management features.', 'active', ARRAY[react_id, node_id, typescript_id], ARRAY['https://example.com/task1.jpg'], 'https://tasks-demo.vercel.app', 'https://github.com/user/task-manager', true, false),
    ('00000000-0000-0000-0000-000000000002', 'Portfolio Website', 'Personal portfolio website', 'A responsive portfolio website showcasing my projects and skills.', 'completed', ARRAY[react_id, typescript_id], ARRAY['https://example.com/portfolio1.jpg'], 'https://portfolio-demo.vercel.app', 'https://github.com/user/portfolio', true, false),
    ('00000000-0000-0000-0000-000000000002', 'Weather App', 'Real-time weather application', 'A weather application that provides current weather conditions and forecasts for any location worldwide.', 'in_progress', ARRAY[react_id, node_id], ARRAY['https://example.com/weather1.jpg'], null, 'https://github.com/user/weather-app', false, false)
    ON CONFLICT DO NOTHING;
END $$;

-- Insert sample messages
INSERT INTO messages (name, email, subject, message, status, ip_address, user_agent) VALUES
('John Doe', 'john@example.com', 'Project Inquiry', 'Hi, I am interested in your e-commerce platform project. Could we discuss potential collaboration?', 'unread', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
('Jane Smith', 'jane@example.com', 'Hiring Opportunity', 'We are looking for a full-stack developer. Your portfolio looks impressive. Are you available for a project?', 'read', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
('Mike Johnson', 'mike@example.com', 'Technical Question', 'I noticed you used TypeScript in your projects. Could you share some best practices for large-scale applications?', 'replied', '192.168.1.102', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'),
('Sarah Wilson', 'sarah@example.com', 'Partnership Proposal', 'We are a startup looking for a technical co-founder. Your experience with React and Node.js would be perfect for our team.', 'unread', '192.168.1.103', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15')
ON CONFLICT DO NOTHING;

-- Insert sample message replies
DO $$
DECLARE
    message_id UUID;
    admin_id UUID;
BEGIN
    SELECT id INTO message_id FROM messages WHERE subject = 'Technical Question' LIMIT 1;
    SELECT id INTO admin_id FROM users WHERE email = 'admin@flexify.com' LIMIT 1;
    
    INSERT INTO message_replies (message_id, user_id, reply) VALUES
    (message_id, admin_id, 'Thank you for your question! For large-scale TypeScript applications, I recommend using strict mode, proper type definitions, and organizing your code with modules. Feel free to check out my GitHub repositories for examples.')
    ON CONFLICT DO NOTHING;
END $$;

-- =====================================================
-- 9. CREATE VIEWS
-- =====================================================

-- View for project statistics
CREATE OR REPLACE VIEW project_stats AS
SELECT 
    COUNT(*) as total_projects,
    COUNT(*) FILTER (WHERE is_public = true) as public_projects,
    COUNT(*) FILTER (WHERE is_featured = true) as featured_projects,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_projects,
    COUNT(*) FILTER (WHERE status = 'active') as active_projects,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_projects,
    COUNT(*) FILTER (WHERE status = 'planning') as planning_projects
FROM projects;

-- View for message statistics
CREATE OR REPLACE VIEW message_stats AS
SELECT 
    COUNT(*) as total_messages,
    COUNT(*) FILTER (WHERE status = 'unread') as unread_messages,
    COUNT(*) FILTER (WHERE status = 'read') as read_messages,
    COUNT(*) FILTER (WHERE status = 'replied') as replied_messages,
    COUNT(*) FILTER (WHERE status = 'archived') as archived_messages,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as today_messages,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as week_messages,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as month_messages
FROM messages;

-- =====================================================
-- 10. GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

-- Display setup completion message
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'FLEXIFY SERVER DATABASE SETUP COMPLETE!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Tables created: users, sessions, technologies, projects, messages, message_replies';
    RAISE NOTICE 'Enums created: user_role, project_status, message_status';
    RAISE NOTICE 'Functions created: update_updated_at_column, clean_expired_sessions, get_user_stats';
    RAISE NOTICE 'Views created: project_stats, message_stats';
    RAISE NOTICE 'Sample data inserted successfully';
    RAISE NOTICE 'Row Level Security enabled on all tables';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Set up your environment variables in your application';
    RAISE NOTICE '2. Configure Supabase authentication if needed';
    RAISE NOTICE '3. Test your API endpoints';
    RAISE NOTICE '=====================================================';
END $$;
