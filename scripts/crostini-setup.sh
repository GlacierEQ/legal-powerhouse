#!/bin/bash
# Crostini Setup for Pixel Tab
# Optimizes ChromeOS Linux container for Legal Powerhouse

set -e

echo "=========================================="
echo "  Crostini Setup for Legal Powerhouse"
echo "=========================================="
echo ""

# Check if running in Crostini
if [ ! -f /etc/precious ]; then
    echo "Warning: This doesn't appear to be a Crostini environment"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# System optimizations
echo "[1/5] Applying system optimizations..."

# Increase file watches
echo "fs.inotify.max_user_watches=524288" | sudo tee -a /etc/sysctl.conf > /dev/null
echo "fs.inotify.max_user_instances=512" | sudo tee -a /etc/sysctl.conf > /dev/null

# Increase open files limit
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf > /dev/null
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf > /dev/null

# Apply sysctl changes
sudo sysctl -p 2>/dev/null || true

echo "  ✓ System optimizations applied"

# Disable unnecessary services
echo "[2/5] Disabling unnecessary services..."

for service in cups bluetooth ModemManager; do
    if systemctl is-active --quiet "$service" 2>/dev/null; then
        sudo systemctl stop "$service" 2>/dev/null || true
        sudo systemctl disable "$service" 2>/dev/null || true
        echo "  ✓ Disabled $service"
    fi
done

# Install required packages
echo "[3/5] Installing required packages..."

sudo apt-get update -qq
sudo apt-get install -y -qq \
    curl \
    git \
    build-essential \
    python3 \
    python3-pip \
    nodejs \
    npm \
    > /dev/null 2>&1

echo "  ✓ Packages installed"

# Setup Node.js (latest LTS)
echo "[4/5] Setting up Node.js..."

if ! command -v nvm &> /dev/null; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash > /dev/null 2>&1
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install --lts > /dev/null 2>&1
    nvm use --lts > /dev/null 2>&1
fi

echo "  ✓ Node.js configured"

# Setup Legal Powerhouse
echo "[5/5] Setting up Legal Powerhouse..."

# Clone the repo if not exists
if [ ! -d "$HOME/legal-powerhouse" ]; then
    git clone https://github.com/GlacierEQ/legal-powerhouse.git "$HOME/legal-powerhouse" > /dev/null 2>&1
fi

cd "$HOME/legal-powerhouse"

# Install dependencies
npm install > /dev/null 2>&1

# Create .env.local
if [ ! -f .env.local ]; then
    cat > .env.local <<'EOF'
# Legal Powerhouse Environment
# Add your Supabase credentials here
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE=your-service-role-key
PORT=3000
EOF
    echo "  ✓ Created .env.local - please add your Supabase credentials"
fi

echo ""
echo "=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo "To start Legal Powerhouse:"
echo "  cd ~/legal-powerhouse"
echo "  node server.js"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "Fiat justitia ruat caelum."
echo ""
