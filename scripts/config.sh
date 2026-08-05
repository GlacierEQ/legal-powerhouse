#!/bin/bash
# Legal Powerhouse - Unified Config Manager
# Manage all configuration from one place

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# ==================== SHOW ====================
show() {
    local section="${1:-all}"
    
    echo "=========================================="
    echo "  LEGAL POWERHOUSE CONFIGURATION"
    echo "=========================================="
    echo ""
    
    case "$section" in
        env|environment)
            echo "Environment Variables:"
            if [ -f "$PROJECT_DIR/.env.local" ]; then
                echo "  ✓ .env.local exists"
                # Show non-secret values
                grep -v "KEY\|SECRET\|TOKEN\|PASSWORD" "$PROJECT_DIR/.env.local" 2>/dev/null || true
            else
                echo "  ✗ .env.local not found"
            fi
            ;;
        agents)
            echo "Agents:"
            if [ -f "$PROJECT_DIR/shared/config/agents.json" ]; then
                python3 -c "
import json
with open('$PROJECT_DIR/shared/config/agents.json') as f:
    data = json.load(f)
for agent in data.get('agents', {}).values():
    print(f\"  {agent['id']}: {agent['name']} ({agent['tier']})\")
" 2>/dev/null || echo "  (parse error)"
            fi
            ;;
        mesh)
            echo "Repo Mesh:"
            if [ -f "$PROJECT_DIR/shared/config/repo-mesh.json" ]; then
                python3 -c "
import json
with open('$PROJECT_DIR/shared/config/repo-mesh.json') as f:
    data = json.load(f)
for name, repo in data.get('repos', {}).items():
    print(f\"  {name}: {repo['role']} ({repo['tier']})\")
" 2>/dev/null || echo "  (parse error)"
            fi
            ;;
        documents)
            echo "Documents:"
            if [ -f "$PROJECT_DIR/shared/config/documents.json" ]; then
                python3 -c "
import json
with open('$PROJECT_DIR/shared/config/documents.json') as f:
    data = json.load(f)
for cat, docs in data.get('categories', {}).items():
    print(f\"  {cat}: {len(docs)} documents\")
" 2>/dev/null || echo "  (parse error)"
            fi
            ;;
        all|*)
            echo "Config Files:"
            echo "  ✓ .env.local - Environment variables"
            echo "  ✓ shared/config/agents.json - Agent definitions"
            echo "  ✓ shared/config/repo-mesh.json - Repo mesh"
            echo "  ✓ shared/config/documents.json - Document registry"
            echo ""
            echo "Protection:"
            if [ -f "$PROJECT_DIR/.config-fingerprints" ]; then
                echo "  ✓ Integrity fingerprints active"
            else
                echo "  ✗ No fingerprints"
            fi
            echo ""
            echo "Backups:"
            ls -lt "$PROJECT_DIR/backups/"*.tar.gz 2>/dev/null | head -3 | awk '{print "    " $NF}' || echo "    (none)"
            ;;
    esac
    echo ""
}

# ==================== SET ====================
set_config() {
    local key="$1"
    local value="$2"
    
    if [ -z "$key" ] || [ -z "$value" ]; then
        echo "Usage: config.sh set <key> <value>"
        return 1
    fi
    
    # Check if key exists in .env.local
    if grep -q "^$key=" "$PROJECT_DIR/.env.local" 2>/dev/null; then
        # Update existing
        sed -i "s|^$key=.*|$key=$value|" "$PROJECT_DIR/.env.local"
        echo -e "${GREEN}Updated $key${NC}"
    else
        # Append
        echo "$key=$value" >> "$PROJECT_DIR/.env.local"
        echo -e "${GREEN}Added $key${NC}"
    fi
    
    # Log change
    mkdir -p "$PROJECT_DIR/.config-audit"
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) | SET | $key | $(whoami)" >> "$PROJECT_DIR/.config-audit/change.log"
}

# ==================== GET ====================
get_config() {
    local key="$1"
    
    if [ -z "$key" ]; then
        echo "Usage: config.sh get <key>"
        return 1
    fi
    
    if [ -f "$PROJECT_DIR/.env.local" ]; then
        grep "^$key=" "$PROJECT_DIR/.env.local" 2>/dev/null | cut -d= -f2- || echo "(not set)"
    else
        echo "(.env.local not found)"
    fi
}

# ==================== LIST ====================
list_keys() {
    echo "Configuration Keys:"
    if [ -f "$PROJECT_DIR/.env.local" ]; then
        grep -v "^#\|^$" "$PROJECT_DIR/.env.local" 2>/dev/null | cut -d= -f1 | while read key; do
            echo "  $key"
        done
    fi
}

# ==================== VALIDATE ====================
validate() {
    echo "=========================================="
    echo "  VALIDATING CONFIGURATION"
    echo "=========================================="
    echo ""
    
    local errors=0
    
    # Check required files
    local required_files=(
        ".env.local"
        "server.js"
        "shared/config/agents.json"
        "shared/config/repo-mesh.json"
        "shared/config/documents.json"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "$PROJECT_DIR/$file" ]; then
            echo "  ✓ $file"
        else
            echo "  ✗ $file (missing)"
            errors=$((errors + 1))
        fi
    done
    
    echo ""
    if [ $errors -eq 0 ]; then
        echo -e "${GREEN}Configuration valid${NC}"
    else
        echo -e "${RED}Configuration has errors${NC}"
    fi
}

# ==================== MAIN ====================
case "${1:-show}" in
    show)
        show "${2:-all}"
        ;;
    set)
        set_config "$2" "$3"
        ;;
    get)
        get_config "$2"
        ;;
    list)
        list_keys
        ;;
    validate)
        validate
        ;;
    *)
        echo "Usage: config.sh {show|set|get|list|validate}"
        ;;
esac
