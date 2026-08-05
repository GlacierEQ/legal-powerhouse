#!/bin/bash
# Legal Powerhouse - Operational Backup
# Backup critical config and state

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="legal-powerhouse_${TIMESTAMP}"

echo "=========================================="
echo "  Creating Operational Backup"
echo "=========================================="
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create backup
echo "Backing up critical files..."
tar czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" \
    .env.local \
    .env.example \
    server.js \
    brain/memory/unified-brain.js \
    brain/server/supabase_vault_setup.sql \
    shared/config/ \
    scripts/ \
    LICENSE \
    README.md \
    package.json \
    .config-fingerprints \
    2>/dev/null || true

# Calculate checksum
CHECKSUM=$(sha256sum "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -d' ' -f1)

# Create backup manifest
cat > "$BACKUP_DIR/$BACKUP_NAME.manifest" <<EOF
Backup: $BACKUP_NAME
Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Checksum: $CHECKSUM
Files:
  - .env.local
  - .env.example
  - server.js
  - brain/memory/unified-brain.js
  - brain/server/supabase_vault_setup.sql
  - shared/config/
  - scripts/
  - LICENSE
  - README.md
  - package.json
  - .config-fingerprints
EOF

chmod 444 "$BACKUP_DIR/$BACKUP_NAME.manifest"

echo ""
echo "=========================================="
echo "  Backup Complete"
echo "=========================================="
echo ""
echo "Backup: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
echo "Manifest: $BACKUP_DIR/$BACKUP_NAME.manifest"
echo "Checksum: $CHECKSUM"
echo ""
echo "To restore:"
echo "  tar xzf $BACKUP_DIR/$BACKUP_NAME.tar.gz"
echo ""
