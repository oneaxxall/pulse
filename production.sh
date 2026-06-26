#!/usr/bin/env bash
#
# production.sh
# Membangun (build) dan memaketkan aplikasi untuk kebutuhan produksi (siap jalan).
#

set -Eeuo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
cd "$SCRIPT_DIR"

OUTPUT="pusher-production.tar.gz"

echo "----------------------------------------------------------"
echo "🚀 Menyiapkan Paket Produksi PDS Pusher Server (Bundled)"
echo "----------------------------------------------------------"

# 1. Jalankan Bundling
echo "🏗️  1/3 Menjalankan bundling (esbuild)..."
npm run bundle > /dev/null

if [[ ! -d "bundle" ]]; then
    echo "❌ Folder bundle tidak ditemukan! Bundling gagal."
    exit 1
fi

# 2. Hapus file lama jika ada
rm -f "$OUTPUT"

# 3. Memaketkan file yang dibutuhkan saja (Tanpa node_modules!)
echo "📦 2/3 Memaketkan file ke $OUTPUT..."

# Buat folder sementara untuk pemaketan
TEMP_DIR=".production_temp"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Salin hasil bundle
cp -r bundle/* "$TEMP_DIR/"

# Salin file pendukung jika ada
[ -d "sdk" ] && cp -r sdk "$TEMP_DIR/"
[ -f ".env.example" ] && cp ".env.example" "$TEMP_DIR/"
[ -f ".env" ] && cp ".env" "$TEMP_DIR/"

# Pakai tar untuk mengompres folder sementara
tar -czf "$OUTPUT" -C "$TEMP_DIR" .

# Bersihkan folder sementara
rm -rf "$TEMP_DIR"

# 4. Selesai
if [[ -f "$OUTPUT" ]]; then
    SIZE=$(du -h "$OUTPUT" | cut -f1)
    echo "✅ 3/3 Berhasil! File $OUTPUT siap digunakan ($SIZE)."
    echo "----------------------------------------------------------"
    echo "💡 Cara Penggunaan di Server Baru:"
    echo "   1. Copy $OUTPUT ke server tujuan."
    echo "   2. Ekstrak: tar -xzf $OUTPUT"
    echo "   3. Jalankan: ./run-pds-server.sh"
    echo "----------------------------------------------------------"
else
    echo "❌ Gagal membuat paket produksi."
    exit 1
fi
