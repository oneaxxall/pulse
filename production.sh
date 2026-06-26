#!/usr/bin/env bash
#
# production.sh
# Builds and packages the application for production deployment (ready to run).
#

set -Eeuo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
cd "$SCRIPT_DIR"

OUTPUT="pulse-production.tar.gz"

echo "----------------------------------------------------------"
echo "🚀 Preparing Pulse Server Production Package (Bundled)"
echo "----------------------------------------------------------"

# 1. Run Bundling
echo "🏗️  1/3 Running bundling (esbuild)..."
npm run bundle > /dev/null

if [[ ! -d "bundle" ]]; then
    echo "❌ Bundle folder not found! Bundling failed."
    exit 1
fi

# 2. Remove old package if exists
rm -f "$OUTPUT"

# 3. Package only the required files (Without node_modules!)
echo "📦 2/3 Packaging files to $OUTPUT..."

# Create temporary directory for packaging
TEMP_DIR=".production_temp"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Copy bundle output
cp -r bundle/* "$TEMP_DIR/"

# Copy supporting files if they exist
[ -d "sdk" ] && cp -r sdk "$TEMP_DIR/"
[ -f ".env.example" ] && cp ".env.example" "$TEMP_DIR/"
[ -f ".env" ] && cp ".env" "$TEMP_DIR/"

# Use tar to compress the temporary folder
tar -czf "$OUTPUT" -C "$TEMP_DIR" .

# Clean up temporary folder
rm -rf "$TEMP_DIR"

# 4. Done
if [[ -f "$OUTPUT" ]]; then
    SIZE=$(du -h "$OUTPUT" | cut -f1)
    echo "✅ 3/3 Success! File $OUTPUT is ready to use ($SIZE)."
    echo "----------------------------------------------------------"
    echo "💡 How to Use on a New Server:"
    echo "   1. Copy $OUTPUT to the target server."
    echo "   2. Extract: tar -xzf $OUTPUT"
    echo "   3. Run: ./run-pulse-server.sh"
    echo "----------------------------------------------------------"
else
    echo "❌ Failed to create production package."
    exit 1
fi
