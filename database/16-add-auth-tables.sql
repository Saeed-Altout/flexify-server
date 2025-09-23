-- Add OTP verification table
CREATE TABLE IF NOT EXISTS otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(5) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(email)
);

-- Add password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(email)
);

-- Add refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_otp_verifications_email ON otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_otp_verifications_expires_at ON otp_verifications(expires_at);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_is_active ON refresh_tokens(is_active);

-- Create function to clean expired OTP records
CREATE OR REPLACE FUNCTION clean_expired_otp()
RETURNS void AS $$
BEGIN
    DELETE FROM otp_verifications WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to clean expired password reset tokens
CREATE OR REPLACE FUNCTION clean_expired_password_reset_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM password_reset_tokens WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to clean expired refresh tokens
CREATE OR REPLACE FUNCTION clean_expired_refresh_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM refresh_tokens WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to clean all expired auth records
CREATE OR REPLACE FUNCTION clean_expired_auth_records()
RETURNS void AS $$
BEGIN
    PERFORM clean_expired_otp();
    PERFORM clean_expired_password_reset_tokens();
    PERFORM clean_expired_refresh_tokens();
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on new tables
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for otp_verifications (allow all for now, can be restricted later)
CREATE POLICY "Allow all operations on otp_verifications" ON otp_verifications
    FOR ALL USING (true);

-- Create RLS policies for password_reset_tokens (allow all for now, can be restricted later)
CREATE POLICY "Allow all operations on password_reset_tokens" ON password_reset_tokens
    FOR ALL USING (true);

-- Create RLS policies for refresh_tokens (allow all for now, can be restricted later)
CREATE POLICY "Allow all operations on refresh_tokens" ON refresh_tokens
    FOR ALL USING (true);

-- Add comments for documentation
COMMENT ON TABLE otp_verifications IS 'Stores OTP codes for email verification';
COMMENT ON TABLE password_reset_tokens IS 'Stores password reset tokens';
COMMENT ON TABLE refresh_tokens IS 'Stores refresh tokens for JWT authentication';

COMMENT ON COLUMN otp_verifications.otp IS '5-digit OTP code';
COMMENT ON COLUMN otp_verifications.expires_at IS 'OTP expiration time (10 minutes)';

COMMENT ON COLUMN password_reset_tokens.token IS 'Unique password reset token';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Token expiration time (1 hour)';

COMMENT ON COLUMN refresh_tokens.token_hash IS 'SHA256 hash of the refresh token';
COMMENT ON COLUMN refresh_tokens.expires_at IS 'Token expiration time (7 days)';
COMMENT ON COLUMN refresh_tokens.is_active IS 'Whether the token is still valid';
