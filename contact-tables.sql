-- Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REPLIED', 'ARCHIVED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Replies Table
CREATE TABLE IF NOT EXISTS contact_replies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES contact_messages(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reply_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_replies_message_id ON contact_replies(message_id);
CREATE INDEX IF NOT EXISTS idx_contact_replies_admin_id ON contact_replies(admin_id);

-- Row Level Security (RLS) policies
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_replies ENABLE ROW LEVEL SECURITY;

-- Policy for contact_messages: Anyone can insert, only admins can read/update/delete
CREATE POLICY "Anyone can insert contact messages" ON contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can view contact messages" ON contact_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'ADMIN'
        )
    );

CREATE POLICY "Only admins can update contact messages" ON contact_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'ADMIN'
        )
    );

CREATE POLICY "Only admins can delete contact messages" ON contact_messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'ADMIN'
        )
    );

-- Policy for contact_replies: Only admins can insert/read/update/delete
CREATE POLICY "Only admins can insert replies" ON contact_replies
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'ADMIN'
        )
    );

CREATE POLICY "Only admins can view replies" ON contact_replies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'ADMIN'
        )
    );

CREATE POLICY "Only admins can update replies" ON contact_replies
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'ADMIN'
        )
    );

CREATE POLICY "Only admins can delete replies" ON contact_replies
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'ADMIN'
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_contact_messages_updated_at 
    BEFORE UPDATE ON contact_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_replies_updated_at 
    BEFORE UPDATE ON contact_replies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
