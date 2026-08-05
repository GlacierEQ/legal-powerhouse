#!/bin/bash
# Legal Powerhouse - Protection Status
# Show current protection state

echo "=========================================="
echo "  PROTECTION STATUS"
echo "=========================================="
echo ""

# Check protected files
echo "Protected Files:"
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

for file in "${PROTECTED_FILES[@]}"; do
    if [ -f "$file" ]; then
        perms=$(stat -c "%a" "$file" 2>/dev/null || stat -f "%Lp" "$file" 2>/dev/null)
        if [ "$perms" = "444" ] || [ "$perms" = "400" ]; then
            echo "  🔒 $file ($perms)"
        else
            echo "  ⚠️  $file ($perms) - NOT LOCKED"
        fi
    else
        echo "  ❓ $file (not found)"
    fi
done

echo ""
echo "Config Fingerprints:"
if [ -f ".config-fingerprints" ]; then
    wc -l < .config-fingerprints | xargs -I {} echo "  {} files tracked"
    echo "  Last modified: $(stat -c "%y" .config-fingerprints 2>/dev/null || stat -f "%Sm" .config-fingerprints 2>/dev/null)"
else
    echo "  No fingerprints found. Run: bash scripts/lock-config.sh"
fi

echo ""
echo "Recent Changes:"
if [ -f ".config-audit/change.log" ]; then
    tail -5 .config-audit/change.log 2>/dev/null || echo "  No changes logged"
else
    echo "  No audit log found"
fi

echo ""
echo "Backups:"
if [ -d "./backups" ]; then
    ls -lt ./backups/*.tar.gz 2>/dev/null | head -3 | awk '{print "  " $NF}'
else
    echo "  No backups found. Run: bash scripts/backup-state.sh"
fi

echo ""
echo "=========================================="
echo ""
