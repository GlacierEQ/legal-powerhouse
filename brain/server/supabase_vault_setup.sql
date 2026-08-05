-- Supabase Vault Setup for Legal Powerhouse
-- Run this in your Supabase SQL Editor

-- Create secrets_vault table
CREATE TABLE IF NOT EXISTS secrets_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name TEXT UNIQUE NOT NULL,
    encrypted_value TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_secrets_vault_key_name ON secrets_vault(key_name);
CREATE INDEX IF NOT EXISTS idx_secrets_vault_category ON secrets_vault(category);

-- Enable Row Level Security
ALTER TABLE secrets_vault ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow authenticated users full access" ON secrets_vault
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_secrets_vault_timestamp
    BEFORE UPDATE ON secrets_vault
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Insert secrets from environment variables
-- Use your Supabase dashboard or CLI to insert actual values

-- Example: INSERT INTO secrets_vault (key_name, encrypted_value, category, description) VALUES ('your_key', 'your_value', 'category', 'description');
-- Do NOT commit actual secrets to git!

-- Create view for easy access
CREATE OR REPLACE VIEW vault_secrets AS
SELECT 
    key_name,
    category,
    description,
    created_at,
    updated_at,
    last_accessed,
    is_active
FROM secrets_vault
WHERE is_active = true;

-- Grant permissions
GRANT SELECT ON vault_secrets TO authenticated;
GRANT ALL ON secrets_vault TO authenticated;
