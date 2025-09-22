-- Migration: Fix projects table schema to match code expectations
-- This script adds missing fields and fixes field naming inconsistencies

-- Add cover field to projects table if it doesn't exist
DO $$
BEGIN
    -- Add cover column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'cover'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.projects ADD COLUMN cover TEXT;
    END IF;
END$$;

-- Add likes_count field to projects table if it doesn't exist
DO $$
BEGIN
    -- Add likes_count column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'likes_count'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.projects ADD COLUMN likes_count INTEGER NOT NULL DEFAULT 0;
    END IF;
END$$;

-- Remove old likes column if it exists (we're using likes_count instead)
DO $$
BEGIN
    -- Remove likes column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'likes'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.projects DROP COLUMN likes;
    END IF;
END$$;

-- Update existing projects to have correct likes_count
UPDATE projects 
SET likes_count = (
    SELECT COUNT(*) 
    FROM project_likes 
    WHERE project_id = projects.id 
    AND is_like = true
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_is_public ON projects(is_public);
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_projects_likes_count ON projects(likes_count);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Add comments for documentation
COMMENT ON COLUMN projects.cover IS 'URL of the project cover image';
COMMENT ON COLUMN projects.images IS 'Array of URLs for project images';
COMMENT ON COLUMN projects.likes_count IS 'Total number of likes for this project';
COMMENT ON COLUMN projects.technologies IS 'Array of technology UUIDs used in this project';
