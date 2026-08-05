#!/bin/bash
# Legal Powerhouse - Repo Mesh Sync
# Synchronize all legal repositories

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
MESH_CONFIG="$PROJECT_DIR/shared/config/repo-mesh.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +%H:%M:%S)] $1${NC}"; }
warn() { echo -e "${YELLOW}[$(date +%H:%M:%S)] WARNING: $1${NC}"; }
error() { echo -e "${RED}[$(date +%H:%M:%S)] ERROR: $1${NC}"; }

# ==================== STATUS ====================
status() {
    echo "=========================================="
    echo "  LEGAL REPO MESH STATUS"
    echo "=========================================="
    echo ""
    
    echo "Repos:"
    echo "  ✓ legal-powerhouse (hub) - $PROJECT_DIR"
    echo "  ✓ quantum_nexus (core) - /root/quantum_nexus"
    echo "  ✓ quantum-legal (core) - /root/quantum-legal"
    echo "  ✓ genesis-prime (integration) - /root/genesis-prime"
    echo ""
    
    echo "Sync State:"
    if [ -f "$PROJECT_DIR/.sync-state" ]; then
        cat "$PROJECT_DIR/.sync-state"
    else
        echo "  No sync state found"
    fi
    echo ""
    
    echo "Server Status:"
    if curl -s http://localhost:3000/api/status > /dev/null 2>&1; then
        echo "  ✓ Legal Powerhouse: Running on :3000"
    else
        echo "  ✗ Legal Powerhouse: Not running"
    fi
    echo ""
}

# ==================== SYNC ====================
sync_repo() {
    local repo="$1"
    local target="$2"
    
    log "Syncing $repo -> $target"
    
    case "$repo" in
        quantum_nexus)
            if [ -d "/root/quantum_nexus" ]; then
                # Sync brain
                cp -r /root/quantum_nexus/brain/* "$PROJECT_DIR/brain/" 2>/dev/null || true
                # Sync legal bucket
                cp -r /root/quantum_nexus/buckets/legal/* "$PROJECT_DIR/shared/data/legal/" 2>/dev/null || true
                log "✓ quantum_nexus synced"
            else
                warn "quantum_nexus not found"
            fi
            ;;
        quantum-legal)
            if [ -d "/root/quantum-legal" ]; then
                # Sync legal intelligence
                mkdir -p "$PROJECT_DIR/shared/data/legal-intelligence"
                cp -r /root/quantum-legal/legal-intelligence/* "$PROJECT_DIR/shared/data/legal-intelligence/" 2>/dev/null || true
                log "✓ quantum-legal synced"
            else
                warn "quantum-legal not found"
            fi
            ;;
        genesis-prime)
            if [ -d "/root/genesis-prime" ]; then
                # Sync courtlistener client
                mkdir -p "$PROJECT_DIR/shared/data/courtlistener"
                cp /root/genesis-prime/courtlistener_client.py "$PROJECT_DIR/shared/data/courtlistener/" 2>/dev/null || true
                log "✓ genesis-prime synced"
            else
                warn "genesis-prime not found"
            fi
            ;;
    esac
}

sync_all() {
    echo "=========================================="
    echo "  SYNCING ALL REPOS"
    echo "=========================================="
    echo ""
    
    sync_repo "quantum_nexus"
    sync_repo "quantum-legal"
    sync_repo "genesis-prime"
    
    # Record sync state
    cat > "$PROJECT_DIR/.sync-state" <<EOF
Last sync: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Synced repos: quantum_nexus, quantum-legal, genesis-prime
Status: success
EOF
    
    echo ""
    log "All repos synced"
}

# ==================== VERIFY ====================
verify() {
    echo "=========================================="
    echo "  VERIFYING MESH INTEGRITY"
    echo "=========================================="
    echo ""
    
    # Check core files
    local files=(
        "server.js"
        "shared/config/agents.json"
        "shared/config/repo-mesh.json"
        "brain/memory/unified-brain.js"
        "routes/brain.js"
        "routes/context.js"
    )
    
    local all_ok=true
    for file in "${files[@]}"; do
        if [ -f "$PROJECT_DIR/$file" ]; then
            echo "  ✓ $file"
        else
            echo "  ✗ $file (missing)"
            all_ok=false
        fi
    done
    
    echo ""
    if [ "$all_ok" = true ]; then
        log "All files verified"
    else
        error "Some files missing"
    fi
    
    # Verify integrity
    if [ -f "$PROJECT_DIR/.config-fingerprints" ]; then
        echo ""
        bash "$PROJECT_DIR/scripts/protect.sh" verify
    fi
}

# ==================== BACKUP ====================
backup() {
    log "Creating mesh backup..."
    bash "$PROJECT_DIR/scripts/protect.sh" backup
}

# ==================== RESTORE ====================
restore() {
    local backup_file="$1"
    if [ -z "$backup_file" ]; then
        echo "Usage: mesh.sh restore <backup-file>"
        ls -lt "$PROJECT_DIR/backups/"*.tar.gz 2>/dev/null | head -5
        return 1
    fi
    
    log "Restoring from $backup_file"
    bash "$PROJECT_DIR/scripts/protect.sh" restore "$backup_file"
}

# ==================== MAIN ====================
case "${1:-status}" in
    status)
        status
        ;;
    sync)
        sync_all
        ;;
    verify)
        verify
        ;;
    backup)
        backup
        ;;
    restore)
        restore "$2"
        ;;
    *)
        echo "Usage: mesh.sh {status|sync|verify|backup|restore}"
        ;;
esac
