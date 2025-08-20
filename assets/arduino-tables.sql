-- Arduino Control System Tables

-- Device status table
CREATE TABLE IF NOT EXISTS arduino_devices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_name VARCHAR(100) NOT NULL DEFAULT 'Arduino Device',
    device_type VARCHAR(50) DEFAULT 'Arduino',
    is_connected BOOLEAN DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'offline',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Commands table
CREATE TABLE IF NOT EXISTS arduino_commands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id UUID REFERENCES arduino_devices(id) ON DELETE CASCADE,
    command_type VARCHAR(50) NOT NULL, -- 'on', 'off', 'send'
    command VARCHAR(100) NOT NULL, -- 'on', 'off', 'bottom', 'top', 'both'
    time_minutes INTEGER, -- for timed commands
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'executing', 'completed', 'failed'
    executed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Command history table
CREATE TABLE IF NOT EXISTS arduino_command_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id UUID REFERENCES arduino_devices(id) ON DELETE CASCADE,
    command_id UUID REFERENCES arduino_commands(id) ON DELETE CASCADE,
    command_type VARCHAR(50) NOT NULL,
    command VARCHAR(100) NOT NULL,
    time_minutes INTEGER,
    status VARCHAR(50) NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE,
    response_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default Arduino device
INSERT INTO arduino_devices (device_name, device_type, is_connected, status) 
VALUES ('Main Arduino', 'Arduino Uno', false, 'offline')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_arduino_devices_status ON arduino_devices(status);
CREATE INDEX IF NOT EXISTS idx_arduino_commands_device_id ON arduino_commands(device_id);
CREATE INDEX IF NOT EXISTS idx_arduino_commands_status ON arduino_commands(status);
CREATE INDEX IF NOT EXISTS idx_arduino_command_history_device_id ON arduino_command_history(device_id);

-- Enable Row Level Security (RLS)
ALTER TABLE arduino_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE arduino_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE arduino_command_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for arduino_devices
CREATE POLICY "Allow public read access to arduino devices" ON arduino_devices
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to update arduino devices" ON arduino_devices
    FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for arduino_commands
CREATE POLICY "Allow public read access to arduino commands" ON arduino_commands
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert arduino commands" ON arduino_commands
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update arduino commands" ON arduino_commands
    FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for arduino_command_history
CREATE POLICY "Allow public read access to arduino command history" ON arduino_command_history
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert arduino command history" ON arduino_command_history
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_arduino_devices_updated_at 
    BEFORE UPDATE ON arduino_devices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_arduino_commands_updated_at 
    BEFORE UPDATE ON arduino_commands 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
