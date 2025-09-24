-- Migration: Create services table for admin-managed services
-- This script creates a services table to store service information

-- Create services table
CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon_url TEXT,
    description TEXT,
    href TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at);
CREATE INDEX IF NOT EXISTS idx_services_updated_at ON services(updated_at);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow all operations for authenticated users (admin-only in application layer)
CREATE POLICY "Allow all operations on services" ON services
    FOR ALL USING (true);

-- Add comments for documentation
COMMENT ON TABLE services IS 'Stores service information managed by admins';
COMMENT ON COLUMN services.name IS 'Service name';
COMMENT ON COLUMN services.icon_url IS 'URL to service icon image';
COMMENT ON COLUMN services.description IS 'Service description';
COMMENT ON COLUMN services.href IS 'Service link/URL';
COMMENT ON COLUMN services.is_active IS 'Whether the service is active/visible';
