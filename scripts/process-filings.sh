#!/bin/bash
# Process Court Filings through CaseBrain Memory System
# Usage: ./process-filings.sh <directory>

set -e

FILINGS_DIR="${1:-./filings}"
SERVER_URL="${SERVER_URL:-http://localhost:3000}"

echo "=========================================="
echo "  Processing Court Filings"
echo "=========================================="
echo ""
echo "Directory: $FILINGS_DIR"
echo "Server: $SERVER_URL"
echo ""

# Check if server is running
if ! curl -s "$SERVER_URL/api/status" > /dev/null 2>&1; then
    echo "Error: Server not running at $SERVER_URL"
    echo "Start with: node server.js"
    exit 1
fi

# Check if directory exists
if [ ! -d "$FILINGS_DIR" ]; then
    echo "Creating filings directory: $FILINGS_DIR"
    mkdir -p "$FILINGS_DIR"
fi

# Process each file
count=0
for file in "$FILINGS_DIR"/*; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        echo "Processing: $filename"
        
        # Read file content
        content=$(cat "$file")
        
        # Determine type based on filename
        type="note"
        if [[ "$filename" == *motion* ]] || [[ "$filename" == *Motion* ]]; then
            type="motion"
        elif [[ "$filename" == *evidence* ]] || [[ "$filename" == *Exhibit* ]]; then
            type="evidence"
        elif [[ "$filename" == *threat* ]] || [[ "$filename" == *Threat* ]]; then
            type="threat"
        elif [[ "$filename" == *deadline* ]] || [[ "$filename" == *Deadline* ]]; then
            type="deadline"
        elif [[ "$filename" == *ruling* ]] || [[ "$filename" == *Ruling* ]]; then
            type="ruling"
        fi
        
        # Store in memory
        curl -s -X POST "$SERVER_URL/api/brain/memory" \
            -H "Content-Type: application/json" \
            -d "{
                \"content\": $(echo "$content" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))"),
                \"type\": \"$type\",
                \"tags\": [\"$filename\", \"court-filing\"]
            }" > /dev/null
        
        count=$((count + 1))
        echo "  ✓ Stored as $type"
    fi
done

echo ""
echo "=========================================="
echo "  Processed $count filings"
echo "=========================================="
echo ""

# Show stats
echo "Memory Statistics:"
curl -s "$SERVER_URL/api/brain/stats" | python3 -m json.tool 2>/dev/null || echo "Could not fetch stats"

echo ""
echo "Filing processing complete!"
