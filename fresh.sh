#!/usr/bin/env bash
#
# fresh.sh
# Membersihkan lingkungan kerja dan melakukan instalasi serta build ulang dari awal.
#

set -Eeuo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
cd "$SCRIPT_DIR"

echo "----------------------------------------------------------"
echo "♻️  Memulai Proses Instalasi Bersih (Fresh Install)"
echo "----------------------------------------------------------"

# 1. Hapus artefak lama
echo "🗑️  1/4 Menghapus node_modules, dist, dan bundle..."
rm -rf node_modules package-lock.json dist bundle

# 2. Install ulang
echo "📥 2/4 Mengunduh dependensi (npm install)..."
npm install

# 3. Build ulang (TypeScript)
echo "🏗️  3/4 Menjalankan build TypeScript..."
npm run build

# 4. Bundling (NCC)
echo "📦 4/4 Menjalankan bundling produksi..."
npm run bundle

echo "----------------------------------------------------------"
echo "✨ Selesai! Sistem sudah segar, ter-build, dan ter-bundle."
echo "----------------------------------------------------------"
