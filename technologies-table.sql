-- 🗄️ Technologies Table Migration Script
-- Run this script in your Supabase SQL Editor

-- Create technologies table
CREATE TABLE IF NOT EXISTS public.technologies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    label TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.technologies ENABLE ROW LEVEL SECURITY;

-- Create policies for technologies table

-- Public can read all technologies (for project creation forms)
CREATE POLICY "Public can read technologies" ON public.technologies
    FOR SELECT USING (true);

-- Only admins can create/update/delete technologies
CREATE POLICY "Admins can manage technologies" ON public.technologies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Service role can do everything
CREATE POLICY "Service role can manage all technologies" ON public.technologies
    FOR ALL USING (auth.role() = 'service_role');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_technologies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_technologies_updated
    BEFORE UPDATE ON public.technologies
    FOR EACH ROW EXECUTE FUNCTION public.handle_technologies_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_technologies_label ON public.technologies(label);
CREATE INDEX IF NOT EXISTS idx_technologies_value ON public.technologies(value);
CREATE INDEX IF NOT EXISTS idx_technologies_created_at ON public.technologies(created_at);

-- Insert some common technologies as examples
-- Using individual INSERT statements to avoid ON CONFLICT issues
INSERT INTO public.technologies (label, value) VALUES ('React.js', 'react') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('Vue.js', 'vue') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('Angular', 'angular') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('Node.js', 'nodejs') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('Python', 'python') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('Django', 'django') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('FastAPI', 'fastapi') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('TypeScript', 'typescript') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('JavaScript', 'javascript') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('HTML5', 'html5') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('CSS3', 'css3') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('Tailwind CSS', 'tailwind') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('Bootstrap', 'bootstrap') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('PostgreSQL', 'postgresql') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('MongoDB', 'mongodb') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('Redis', 'redis') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('Docker', 'docker') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('Kubernetes', 'kubernetes') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('AWS', 'aws') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('Google Cloud', 'gcp') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('Azure', 'azure') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('Git', 'git') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('GitHub', 'github') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('GitLab', 'gitlab') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('CI/CD', 'cicd') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('REST API', 'rest') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('GraphQL', 'graphql') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('JWT', 'jwt') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('OAuth', 'oauth') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('WebSocket', 'websocket') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('PWA', 'pwa') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('Mobile App', 'mobile') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('iOS', 'ios') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('Android', 'android') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('Flutter', 'flutter') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('React Native', 'react-native') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('Machine Learning', 'ml') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('AI', 'ai') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('Data Science', 'data-science') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('Blockchain', 'blockchain') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('Web3', 'web3') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('Ethereum', 'ethereum') ON CONFLICT (label) DO NOTHING;
INSERT INTO public.technologies (label, value) VALUES ('Solidity', 'solidity') ON CONFLICT (label) DO NOTHING;

-- Verify the setup
SELECT 
    'technologies' as table_name,
    COUNT(*) as row_count
FROM public.technologies;
