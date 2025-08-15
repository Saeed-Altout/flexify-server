-- 🗄️ CV Builder Tables Migration Script
-- Run this script in your Supabase SQL Editor

-- Create CV sections configuration table
CREATE TABLE IF NOT EXISTS public.cv_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_required BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create CV personal info table
CREATE TABLE IF NOT EXISTS public.cv_personal_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_title TEXT,
    summary TEXT,
    profile_picture TEXT,
    phone TEXT,
    address TEXT,
    website TEXT,
    linkedin TEXT,
    github TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id)
);

-- Create CV skills table
CREATE TABLE IF NOT EXISTS public.cv_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    level INTEGER NOT NULL CHECK (level >= 0 AND level <= 100),
    category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create CV experience table
CREATE TABLE IF NOT EXISTS public.cv_experience (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    project_name TEXT,
    seniority_level TEXT NOT NULL CHECK (seniority_level IN ('JUNIOR', 'MID', 'SENIOR', 'LEAD', 'MANAGER', 'DIRECTOR', 'CTO')),
    location TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    key_achievements TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create CV experience technologies junction table
CREATE TABLE IF NOT EXISTS public.cv_experience_technologies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    experience_id UUID NOT NULL REFERENCES public.cv_experience(id) ON DELETE CASCADE,
    technology_id UUID NOT NULL REFERENCES public.technologies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(experience_id, technology_id)
);

-- Create CV education table
CREATE TABLE IF NOT EXISTS public.cv_education (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    degree TEXT NOT NULL,
    institution TEXT NOT NULL,
    location TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create CV certifications table
CREATE TABLE IF NOT EXISTS public.cv_certifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    issuer TEXT NOT NULL,
    issue_date DATE NOT NULL,
    expiration_date DATE,
    credential_id TEXT,
    credential_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create CV awards table
CREATE TABLE IF NOT EXISTS public.cv_awards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    issuer TEXT NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create CV interests table
CREATE TABLE IF NOT EXISTS public.cv_interests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create CV references table
CREATE TABLE IF NOT EXISTS public.cv_references (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security on all tables
ALTER TABLE public.cv_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_personal_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_experience_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_references ENABLE ROW LEVEL SECURITY;

-- Create policies for cv_sections table
CREATE POLICY "Public can read cv sections" ON public.cv_sections
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage cv sections" ON public.cv_sections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Create policies for cv_personal_info table
CREATE POLICY "Users can manage their own personal info" ON public.cv_personal_info
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all personal info" ON public.cv_personal_info
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Create policies for cv_skills table
CREATE POLICY "Users can manage their own skills" ON public.cv_skills
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all skills" ON public.cv_skills
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Create policies for cv_experience table
CREATE POLICY "Users can manage their own experience" ON public.cv_experience
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all experience" ON public.cv_experience
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Create policies for cv_experience_technologies table
CREATE POLICY "Users can manage their own experience technologies" ON public.cv_experience_technologies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.cv_experience 
            WHERE id = experience_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all experience technologies" ON public.cv_experience_technologies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Create policies for cv_education table
CREATE POLICY "Users can manage their own education" ON public.cv_education
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all education" ON public.cv_education
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Create policies for cv_certifications table
CREATE POLICY "Users can manage their own certifications" ON public.cv_certifications
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all certifications" ON public.cv_certifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Create policies for cv_awards table
CREATE POLICY "Users can manage their own awards" ON public.cv_awards
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all awards" ON public.cv_awards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Create policies for cv_interests table
CREATE POLICY "Users can manage their own interests" ON public.cv_interests
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all interests" ON public.cv_interests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Create policies for cv_references table
CREATE POLICY "Users can manage their own references" ON public.cv_references
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all references" ON public.cv_references
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'ADMIN'
        )
    );

-- Service role can do everything
CREATE POLICY "Service role can manage all cv data" ON public.cv_sections
    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage all cv data" ON public.cv_personal_info
    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage all cv data" ON public.cv_skills
    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage all cv data" ON public.cv_experience
    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage all cv data" ON public.cv_experience_technologies
    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage all cv data" ON public.cv_education
    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage all cv data" ON public.cv_certifications
    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage all cv data" ON public.cv_awards
    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage all cv data" ON public.cv_interests
    FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage all cv data" ON public.cv_references
    FOR ALL USING (auth.role() = 'service_role');

-- Create triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_cv_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_cv_personal_info_updated
    BEFORE UPDATE ON public.cv_personal_info
    FOR EACH ROW EXECUTE FUNCTION public.handle_cv_updated_at();

CREATE TRIGGER on_cv_skills_updated
    BEFORE UPDATE ON public.cv_skills
    FOR EACH ROW EXECUTE FUNCTION public.handle_cv_updated_at();

CREATE TRIGGER on_cv_experience_updated
    BEFORE UPDATE ON public.cv_experience
    FOR EACH ROW EXECUTE FUNCTION public.handle_cv_updated_at();

CREATE TRIGGER on_cv_education_updated
    BEFORE UPDATE ON public.cv_education
    FOR EACH ROW EXECUTE FUNCTION public.handle_cv_updated_at();

CREATE TRIGGER on_cv_certifications_updated
    BEFORE UPDATE ON public.cv_certifications
    FOR EACH ROW EXECUTE FUNCTION public.handle_cv_updated_at();

CREATE TRIGGER on_cv_awards_updated
    BEFORE UPDATE ON public.cv_awards
    FOR EACH ROW EXECUTE FUNCTION public.handle_cv_updated_at();

CREATE TRIGGER on_cv_interests_updated
    BEFORE UPDATE ON public.cv_interests
    FOR EACH ROW EXECUTE FUNCTION public.handle_cv_updated_at();

CREATE TRIGGER on_cv_references_updated
    BEFORE UPDATE ON public.cv_references
    FOR EACH ROW EXECUTE FUNCTION public.handle_cv_updated_at();

CREATE TRIGGER on_cv_sections_updated
    BEFORE UPDATE ON public.cv_sections
    FOR EACH ROW EXECUTE FUNCTION public.handle_cv_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cv_personal_info_user_id ON public.cv_personal_info(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_skills_user_id ON public.cv_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_skills_category ON public.cv_skills(category);
CREATE INDEX IF NOT EXISTS idx_cv_experience_user_id ON public.cv_experience(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_experience_company ON public.cv_experience(company);
CREATE INDEX IF NOT EXISTS idx_cv_experience_start_date ON public.cv_experience(start_date);
CREATE INDEX IF NOT EXISTS idx_cv_experience_technologies_experience_id ON public.cv_experience_technologies(experience_id);
CREATE INDEX IF  NOT EXISTS idx_cv_experience_technologies_technology_id ON public.cv_experience_technologies(technology_id);
CREATE INDEX IF NOT EXISTS idx_cv_education_user_id ON public.cv_education(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_education_institution ON public.cv_education(institution);
CREATE INDEX IF NOT EXISTS idx_cv_certifications_user_id ON public.cv_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_awards_user_id ON public.cv_awards(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_interests_user_id ON public.cv_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_references_user_id ON public.cv_references(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_sections_name ON public.cv_sections(name);
CREATE INDEX IF NOT EXISTS idx_cv_sections_is_active ON public.cv_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_cv_sections_sort_order ON public.cv_sections(sort_order);

-- Insert default CV sections
INSERT INTO public.cv_sections (name, display_name, description, is_active, is_required, sort_order) VALUES
('personal_info', 'Personal Information', 'Basic personal and contact information', true, true, 1),
('skills', 'Skills', 'Technical and soft skills with proficiency levels', true, false, 2),
('experience', 'Work Experience', 'Professional work experience and achievements', true, false, 3),
('education', 'Education', 'Academic background and qualifications', true, false, 4),
('certifications', 'Certifications', 'Professional certifications and credentials', true, false, 5),
('awards', 'Awards & Recognition', 'Professional awards and achievements', true, false, 6),
('interests', 'Interests', 'Personal and professional interests', true, false, 7),
('references', 'References', 'Professional references and contacts', true, false, 8)
ON CONFLICT (name) DO NOTHING;

-- Verify the setup
SELECT 
    'cv_sections' as table_name,
    COUNT(*) as row_count
FROM public.cv_sections;

SELECT 
    'cv_personal_info' as table_name,
    COUNT(*) as row_count
FROM public.cv_personal_info;

SELECT 
    'cv_skills' as table_name,
    COUNT(*) as row_count
FROM public.cv_skills;

SELECT 
    'cv_experience' as table_name,
    COUNT(*) as row_count
FROM public.cv_experience;

SELECT 
    'cv_education' as table_name,
    COUNT(*) as row_count
FROM public.cv_education;

SELECT 
    'cv_certifications' as table_name,
    COUNT(*) as row_count
FROM public.cv_certifications;

SELECT 
    'cv_awards' as table_name,
    COUNT(*) as row_count
FROM public.cv_awards;

SELECT 
    'cv_interests' as table_name,
    COUNT(*) as row_count
FROM public.cv_interests;

SELECT 
    'cv_references' as table_name,
    COUNT(*) as row_count
FROM public.cv_references;
