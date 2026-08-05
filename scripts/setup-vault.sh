#!/bin/bash
# Supabase Vault Setup Script
# Run this locally to create the vault table

SUPABASE_URL="https://wibvqjdjewfvhwuxvbys.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpYnZxamRqZXdmdmh3dXh2YnlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjUwNjYwOCwiZXhwIjoyMDYyMDgyNjA4fQ.NCFXtac58uD8xyod9o7S7AJShnK9sJ4F377a6wCwzA0"

echo "Creating secrets_vault table..."

# SQL to execute
SQL=$(cat <<'EOF'
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

CREATE INDEX IF NOT EXISTS idx_secrets_vault_key_name ON secrets_vault(key_name);
CREATE INDEX IF NOT EXISTS idx_secrets_vault_category ON secrets_vault(category);

ALTER TABLE secrets_vault ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users full access" ON secrets_vault
    FOR ALL
    USING (auth.role() = 'authenticated');

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_secrets_vault_timestamp
    BEFORE UPDATE ON secrets_vault
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

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

GRANT SELECT ON vault_secrets TO authenticated;
GRANT ALL ON secrets_vault TO authenticated;
EOF
)

echo "$SQL" | curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d @- 2>&1

echo ""
echo "Done! Check your Supabase dashboard to verify the table was created."
