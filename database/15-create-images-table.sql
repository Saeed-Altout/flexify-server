-- Migration: Create images table for image microservice
-- This script creates an images table to store uploaded image metadata

-- Create images table
CREATE TABLE IF NOT EXISTS images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    path TEXT NOT NULL,
    size BIGINT NOT NULL,
    mimetype VARCHAR(100) NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_mimetype ON images(mimetype);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at);
CREATE INDEX IF NOT EXISTS idx_images_filename ON images(filename);

-- Enable RLS
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own images
CREATE POLICY "Users can view their own images" ON images
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own images
CREATE POLICY "Users can insert their own images" ON images
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own images
CREATE POLICY "Users can update their own images" ON images
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own images
CREATE POLICY "Users can delete their own images" ON images
    FOR DELETE USING (auth.uid() = user_id);

-- Note: For custom authentication system, RLS policies are simplified
-- The application layer handles user authentication and authorization
