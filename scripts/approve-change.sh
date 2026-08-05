#!/bin/bash
# Legal Powerhouse - Config Change Approval Gate
# Requires explicit approval for any config changes

set -e

FILE="$1"
ACTION="${2:-modify}"

if [ -z "$FILE" ]; then
    echo "Usage: $0 <file> [action]"
    echo "  action: modify (default), delete, move"
    exit 1
fi

echo "=========================================="
echo "  CONFIG CHANGE APPROVAL GATE"
echo "=========================================="
echo ""
echo "File: $FILE"
echo "Action: $ACTION"
echo ""

# Check if file is protected
PROTECTED=false
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

for pfile in "${PROTECTED_FILES[@]}"; do
    if [ "$FILE" = "$pfile" ]; then
        PROTECTED=true
        break
    fi
done

if [ "$PROTECTED" = true ]; then
    echo "⚠️  WARNING: This is a PROTECTED configuration file!"
    echo ""
    echo "Current hash:"
    sha256sum "$FILE" 2>/dev/null || echo "  (file not found)"
    echo ""
    read -p "Type 'APPROVE' to confirm changes: " confirmation
    echo ""
    
    if [ "$confirmation" != "APPROVE" ]; then
        echo "❌ Change NOT approved. Aborting."
        exit 1
    fi
    
    echo "✓ Change approved by operator"
    echo ""
fi

# Log the change
mkdir -p .config-audit
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) | $ACTION | $FILE | $(whoami)" >> .config-audit/change.log

echo "Proceeding with $ACTION on $FILE..."
