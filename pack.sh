#!/usr/bin/env bash
#
# pack-all.sh
# Memaketkan atau mengekstrak aplikasi dan node_modules.
# Penggunaan:
#   ./pack-all.sh          -> Untuk memaketkan (pack)
#   ./pack-all.sh unpack   -> Untuk mengekstrak (unpack)
#

set -Eeuo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
cd "$SCRIPT_DIR"

APP_OUTPUT="pusher-x-steroids.zip"
MODULES_OUTPUT="pusher-node-modules.tar.gz"
MODE="${1:-pack}"

echo "----------------------------------------------------------"

if [[ "$MODE" == "unpack" ]]; then
    echo "🔓 Memulai Proses Ekstraksi (Unpack)"
    echo "----------------------------------------------------------"

    # 1. Unpack Application
    if [[ -f "$APP_OUTPUT" ]]; then
        echo "📂 1/2 Mengekstrak aplikasi dari $APP_OUTPUT..."
        unzip -o "$APP_OUTPUT" > /dev/null
        echo "✅ Aplikasi berhasil diekstrak."
    else
        echo "⚠️  File $APP_OUTPUT tidak ditemukan, melewati."
    fi

    # 2. Unpack node_modules
    if [[ -f "$MODULES_OUTPUT" ]]; then
        echo "📂 2/2 Mengekstrak node_modules dari $MODULES_OUTPUT..."
        # Hapus node_modules lama jika ada untuk menghindari konflik file lama
        # rm -rf node_modules 
        tar -xzf "$MODULES_OUTPUT"
        echo "✅ node_modules berhasil diekstrak."
    else
        echo "⚠️  File $MODULES_OUTPUT tidak ditemukan, melewati."
    fi

else
    echo "🚀 Memulai Proses Pengemasan (Pack)"
    echo "----------------------------------------------------------"

    # 1. Pack Application
    echo "📦 1/2 Memaketkan aplikasi ke $APP_OUTPUT..."
    rm -f "$APP_OUTPUT"
    # Tambahkan file script ini sendiri ke dalam exclusion agar tidak ikut ter-zip dalam zip itu sendiri
    zip -r "$APP_OUTPUT" . -x "node_modules/*" ".git/*" ".env" "$APP_OUTPUT" "$MODULES_OUTPUT" "pack-all.sh" > /dev/null

    if [[ -f "$APP_OUTPUT" ]]; then
        SIZE=$(du -h "$APP_OUTPUT" | cut -f1)
        echo "✅ Aplikasi berhasil dipaketkan ($SIZE)."
    else
        echo "❌ Gagal memaketkan aplikasi."
        exit 1
    fi

    # 2. Pack node_modules
    if [[ -d "node_modules" ]]; then
        echo "📦 2/2 Memaketkan node_modules ke $MODULES_OUTPUT (Level 9)..."
        rm -f "$MODULES_OUTPUT"
        tar -cf - node_modules | gzip -9 > "$MODULES_OUTPUT"

        if [[ -f "$MODULES_OUTPUT" ]]; then
            SIZE=$(du -h "$MODULES_OUTPUT" | cut -f1)
            echo "✅ node_modules berhasil dipaketkan ($SIZE)."
        else
            echo "❌ Gagal memaketkan node_modules."
            exit 1
        fi
    else
        echo "⚠️  Folder node_modules tidak ditemukan, melewati tahap ini."
    fi
fi

echo "----------------------------------------------------------"
echo "✨ Semua proses selesai!"
echo "----------------------------------------------------------"
