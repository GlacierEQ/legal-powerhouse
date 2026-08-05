#!/bin/bash
# Legal Powerhouse - Configuration Protection
# Lock configs, prevent accidental changes

set -e

echo "=========================================="
echo "  Locking Configuration Files"
echo "=========================================="
echo ""

# Critical files to protect
PROTECTED_FILES=(
    ".env.local"
    ".env.example"
    "server.js"
    "brain/memory/unified-brain.js"
    "brain/server/supabase_vault_setup.sql"
    "shared/config/agents.json"
    "shared/config/documents.json"
    "LICENSE"
)

# Make files read-only
for file in "${PROTECTED_FILES[@]}"; do
    if [ -f "$file" ]; then
        chmod 444 "$file"
        echo "  🔒 Locked: $file"
    fi
done

# Make scripts executable but not writable
SCRIPT_FILES=(
    "scripts/setup-vault.sh"
    "scripts/crostini-setup.sh"
    "scripts/process-filings.sh"
)

for file in "${SCRIPT_FILES[@]}"; do
    if [ -f "$file" ]; then
        chmod 555 "$file"
        echo "  🔒 Locked (executable): $file"
    fi
done

# Create config hash for integrity checking
echo ""
echo "Creating config fingerprints..."
for file in "${PROTECTED_FILES[@]}"; do
    if [ -f "$file" ]; then
        sha256sum "$file" >> .config-fingerprints
    fi
done
chmod 444 .config-fingerprints
echo "  ✓ Config fingerprints created"

echo ""
echo "=========================================="
echo "  Configuration Protected"
echo "=========================================="
echo ""
echo "To modify a protected file:"
echo "  1. Unlock: chmod 644 <file>"
echo "  2. Make changes"
echo "  3. Verify: sha256sum <file>"
echo "  4. Re-lock: chmod 444 <file>"
echo ""
echo "NEVER modify config without approval."
echo ""
