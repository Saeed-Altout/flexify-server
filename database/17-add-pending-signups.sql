-- Add pending signups table to store user data before verification
CREATE TABLE IF NOT EXISTS pending_signups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_pending_signups_email ON pending_signups(email);
CREATE INDEX IF NOT EXISTS idx_pending_signups_expires_at ON pending_signups(expires_at);

-- Create function to clean expired pending signups
CREATE OR REPLACE FUNCTION clean_expired_pending_signups()
RETURNS void AS $$
BEGIN
    DELETE FROM pending_signups WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create trigger to clean expired records (runs every hour)
-- Note: This would typically be handled by a cron job or scheduled task
-- For now, we'll rely on manual cleanup or application-level cleanup
