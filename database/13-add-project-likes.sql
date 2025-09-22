-- Migration: Add project likes/dislikes system
-- This script creates a project_likes table to track individual user likes/dislikes

-- First, add likes column to projects table if it doesn't exist
DO $$
BEGIN
    -- Add likes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'likes'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.projects ADD COLUMN likes INTEGER NOT NULL DEFAULT 0;
    END IF;
END$$;

-- Create project_likes table
CREATE TABLE IF NOT EXISTS project_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_like BOOLEAN NOT NULL, -- true for like, false for dislike
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    
    -- Ensure one like/dislike per user per project
    UNIQUE(project_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_likes_project_id ON project_likes(project_id);
CREATE INDEX IF NOT EXISTS idx_project_likes_user_id ON project_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_project_likes_is_like ON project_likes(is_like);

-- Enable RLS
ALTER TABLE project_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view all likes (for public display)
CREATE POLICY "Anyone can view project likes" ON project_likes
    FOR SELECT USING (true);

-- Note: For custom authentication system, RLS policies are simplified
-- The application layer handles user authentication and authorization
-- Users can only insert their own likes (handled by application logic)
CREATE POLICY "Users can insert their own likes" ON project_likes
    FOR INSERT WITH CHECK (true);

-- Users can only update their own likes (handled by application logic)
CREATE POLICY "Users can update their own likes" ON project_likes
    FOR UPDATE USING (true);

-- Users can only delete their own likes (handled by application logic)
CREATE POLICY "Users can delete their own likes" ON project_likes
    FOR DELETE USING (true);

-- Create function to update project likes count
CREATE OR REPLACE FUNCTION update_project_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if likes column exists before updating
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'likes'
        AND table_schema = 'public'
    ) THEN
        -- Update the likes count in the projects table
        UPDATE projects 
        SET likes = (
            SELECT COUNT(*) 
            FROM project_likes 
            WHERE project_id = COALESCE(NEW.project_id, OLD.project_id) 
            AND is_like = true
        )
        WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update likes count
CREATE TRIGGER update_likes_count_on_insert
    AFTER INSERT ON project_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_project_likes_count();

CREATE TRIGGER update_likes_count_on_update
    AFTER UPDATE ON project_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_project_likes_count();

CREATE TRIGGER update_likes_count_on_delete
    AFTER DELETE ON project_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_project_likes_count();

-- Update existing projects to have correct likes count (only if likes column exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'likes'
        AND table_schema = 'public'
    ) THEN
        UPDATE projects 
        SET likes = (
            SELECT COUNT(*) 
            FROM project_likes 
            WHERE project_id = projects.id 
            AND is_like = true
        );
    END IF;
END$$;
