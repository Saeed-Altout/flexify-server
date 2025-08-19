-- Contact Service Database Schema - COMPLETE VERSION
-- Run this in your Supabase SQL Editor to create everything from scratch

-- Step 1: Create enum for message status
DO $$ BEGIN
    CREATE TYPE message_status AS ENUM ('PENDING', 'REPLIED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status message_status DEFAULT 'PENDING',
  source VARCHAR(50) DEFAULT 'portfolio',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create contact_replies table
CREATE TABLE IF NOT EXISTS contact_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES contact_messages(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL,
  reply_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_replies_message_id ON contact_replies(message_id);
CREATE INDEX IF NOT EXISTS idx_contact_replies_created_at ON contact_replies(created_at);

-- Step 5: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 6: Create triggers for updated_at (drop if exists first)
DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON contact_messages;
DROP TRIGGER IF EXISTS update_contact_replies_updated_at ON contact_replies;

CREATE TRIGGER update_contact_messages_updated_at 
  BEFORE UPDATE ON contact_messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_replies_updated_at 
  BEFORE UPDATE ON contact_replies 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Enable Row Level Security (RLS)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_replies ENABLE ROW LEVEL SECURITY;

-- Step 8: Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Only admins can read contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Only admins can update contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Only admins can delete contact messages" ON contact_messages;

DROP POLICY IF EXISTS "Anyone can insert replies" ON contact_replies;
DROP POLICY IF EXISTS "Only admins can read replies" ON contact_replies;
DROP POLICY IF EXISTS "Only admins can update replies" ON contact_replies;
DROP POLICY IF EXISTS "Only admins can delete replies" ON contact_replies;

-- Step 9: RLS Policies for contact_messages
-- Anyone can insert (send messages)
CREATE POLICY "Anyone can insert contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Only admins can read, update, delete
CREATE POLICY "Only admins can read contact messages" ON contact_messages
  FOR SELECT USING (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "Only admins can update contact messages" ON contact_messages
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "Only admins can delete contact messages" ON contact_messages
  FOR DELETE USING (auth.jwt() ->> 'role' = 'ADMIN');

-- Step 10: RLS Policies for contact_replies
-- Only admins can insert, read, update, delete
CREATE POLICY "Only admins can insert replies" ON contact_replies
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "Only admins can read replies" ON contact_replies
  FOR SELECT USING (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "Only admins can update replies" ON contact_replies
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY "Only admins can delete replies" ON contact_replies
  FOR DELETE USING (auth.jwt() ->> 'role' = 'ADMIN');

-- Step 11: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON contact_messages TO anon, authenticated;
GRANT ALL ON contact_replies TO anon, authenticated;

-- Step 12: Insert a test message to verify everything works
INSERT INTO contact_messages (name, email, subject, message, source) 
VALUES ('Test User', 'test@example.com', 'Test Message', 'This is a test message to verify the table works.', 'test')
ON CONFLICT DO NOTHING;

-- Step 13: Verify the table was created
SELECT 'Tables created successfully!' as status, 
       (SELECT COUNT(*) FROM contact_messages) as message_count,
       (SELECT COUNT(*) FROM contact_replies) as reply_count;

-- Step 14: Show table structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('contact_messages', 'contact_replies')
ORDER BY table_name, ordinal_position;
