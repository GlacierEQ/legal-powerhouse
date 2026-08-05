#!/bin/bash
# Legal Powerhouse - Integrity Protection System
# Hash-based protection (works when chmod is ignored)

set -e

FINGERPRINT_FILE=".config-fingerprints"
AUDIT_DIR=".config-audit"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Protected files
PROTECTED_FILES=(
    "server.js"
    "brain/memory/unified-brain.js"
    "brain/server/supabase_vault_setup.sql"
    "shared/config/agents.json"
    "shared/config/documents.json"
    "LICENSE"
    "package.json"
    ".gitignore"
)

# Create audit directory
mkdir -p "$AUDIT_DIR"

# Generate fingerprints
generate_fingerprints() {
    echo -e "${GREEN}Generating integrity fingerprints...${NC}"
    > "$FINGERPRINT_FILE"
    for file in "${PROTECTED_FILES[@]}"; do
        if [ -f "$file" ]; then
            hash=$(sha256sum "$file" | cut -d' ' -f1)
            echo "$hash  $file" >> "$FINGERPRINT_FILE"
            echo "  ✓ $file"
        fi
    done
    echo -e "${GREEN}Fingerprints saved.${NC}"
}

# Verify integrity
verify_integrity() {
    echo -e "${GREEN}Verifying config integrity...${NC}"
    local failed=0
    
    if [ ! -f "$FINGERPRINT_FILE" ]; then
        echo -e "${RED}No fingerprint file found. Run: protect.sh init${NC}"
        return 1
    fi
    
    while IFS= read -r line; do
        expected_hash=$(echo "$line" | awk '{print $1}')
        file=$(echo "$line" | awk '{print $2}')
        
        if [ -f "$file" ]; then
            current_hash=$(sha256sum "$file" | awk '{print $1}')
            if [ "$expected_hash" != "$current_hash" ]; then
                echo -e "${RED}✗ TAMPERED: $file${NC}"
                echo "  Expected: $expected_hash"
                echo "  Current:  $current_hash"
                failed=1
            else
                echo -e "${GREEN}✓ OK: $file${NC}"
            fi
        fi
    done < "$FINGERPRINT_FILE"
    
    if [ $failed -eq 1 ]; then
        echo -e "${RED}INTEGRITY VIOLATION DETECTED${NC}"
        log_change "INTEGRITY_VIOLATION" "multiple files"
        return 1
    else
        echo -e "${GREEN}All files verified.${NC}"
        return 0
    fi
}

# Log changes
log_change() {
    local action="$1"
    local file="$2"
    local user=$(whoami)
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    echo "$timestamp | $action | $file | $user" >> "$AUDIT_DIR/change.log"
}

# Show status
show_status() {
    echo "=========================================="
    echo "  INTEGRITY PROTECTION STATUS"
    echo "=========================================="
    echo ""
    
    echo "Protected Files:"
    for file in "${PROTECTED_FILES[@]}"; do
        if [ -f "$file" ]; then
            echo "  ✓ $file"
        else
            echo "  ✗ $file (missing)"
        fi
    done
    
    echo ""
    if [ -f "$FINGERPRINT_FILE" ]; then
        local count=$(wc -l < "$FINGERPRINT_FILE")
        echo "Fingerprints: $count files tracked"
    else
        echo "Fingerprints: NOT INITIALIZED"
    fi
    
    echo ""
    if [ -f "$AUDIT_DIR/change.log" ]; then
        echo "Recent Audit:"
        tail -5 "$AUDIT_DIR/change.log" 2>/dev/null || echo "  (empty)"
    fi
    
    echo ""
    echo "Backups:"
    ls -lt backups/*.tar.gz 2>/dev/null | head -3 | awk '{print "  " $NF}' || echo "  (none)"
    
    echo ""
}

# Backup
backup() {
    local ts=$(date +%Y%m%d_%H%M%S)
    local name="legal-powerhouse_${ts}"
    mkdir -p backups
    
    echo "Creating backup: $name"
    tar czf "backups/$name.tar.gz" \
        server.js \
        brain/ \
        shared/config/ \
        scripts/ \
        LICENSE \
        package.json \
        .config-fingerprints \
        .config-audit/ \
        2>/dev/null || true
    
    sha256sum "backups/$name.tar.gz" > "backups/$name.sha256"
    echo -e "${GREEN}Backup complete: backups/$name.tar.gz${NC}"
}

# Restore
restore() {
    local backup_file="$1"
    if [ -z "$backup_file" ]; then
        echo "Usage: protect.sh restore <backup-file>"
        ls backups/*.tar.gz 2>/dev/null
        return 1
    fi
    
    echo -e "${YELLOW}Restoring from: $backup_file${NC}"
    read -p "Type 'RESTORE' to confirm: " confirm
    if [ "$confirm" != "RESTORE" ]; then
        echo "Aborted."
        return 1
    fi
    
    tar xzf "$backup_file"
    log_change "RESTORE" "$backup_file"
    echo -e "${GREEN}Restore complete.${NC}"
}

# Main
case "${1:-status}" in
    init)
        generate_fingerprints
        ;;
    verify)
        verify_integrity
        ;;
    status)
        show_status
        ;;
    backup)
        backup
        ;;
    restore)
        restore "$2"
        ;;
    *)
        echo "Usage: protect.sh {init|verify|status|backup|restore}"
        ;;
esac
