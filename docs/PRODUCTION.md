# 🚀 Production Deployment Guide: PDS Pusher Server

Panduan ini menjelaskan cara memaketkan, mengirim, dan menjalankan **PDS Pusher Server** di lingkungan produksi menggunakan metode **Bundling**.

---

## 📦 1. Persiapan Paket (Bundling & Packing)

Kita menggunakan metode **Bundling (NCC)** untuk menggabungkan kode sumber dan semua dependensi menjadi satu file JavaScript tunggal. Ini membuat paket sangat ringan dan tidak memerlukan `npm install` di server tujuan.

Jalankan perintah ini di mesin development:
```bash
./production.sh
```

**Hasil:** File `pusher-production.tar.gz` akan dibuat di root folder (~35MB).
File ini sangat bersih, hanya berisi:
- `pusher-server-js`: File aplikasi tunggal hasil optimasi esbuild.
- `uws_linux_x64_127.node`: Binary native Linux.
- `run-pds-server.sh`: Script praktis untuk menjalankan server.
- `configurations/`: Folder berisi skema SQL dan config JSON.
- `sdk/`: File SDK pendukung (jika ada).
- `.env.example`: Template konfigurasi.

---

## 🚚 2. Deployment ke Server (CentOS/Ubuntu)

1. Salin file `pusher-production.tar.gz` ke server tujuan.
2. Ekstrak file tersebut:
   ```bash
   mkdir -p pds-pusher
   tar -xzf pusher-production.tar.gz -C pds-pusher
   cd pds-pusher
   ```
3. Siapkan konfigurasi:
   ```bash
   cp .env.example .env
   nano .env # Sesuaikan database dan port
   ```

---

## ⚡ 3. Cara Menjalankan

### Opsi A: Menjalankan Secara Langsung
Cocok untuk pengujian awal atau menggunakan script runner:
```bash
./run-pds-server.sh
```
Atau secara manual:
```bash
node pusher-server-js start
```

### Opsi B: Menggunakan PM2 (Rekomendasi Produksi)
Agar aplikasi tetap berjalan di background dan otomatis restart jika crash.

1. **Start Aplikasi:**
   ```bash
   pm2 start pusher-server-js --name "pds-pusher" -- start
   ```
2. **Monitoring Log:**
   ```bash
   pm2 logs pds-pusher
   ```
3. **Persistensi (Auto-start saat server reboot):**
   ```bash
   pm2 save
   pm2 startup
   ```

---

## ⚙️ 4. Konfigurasi Penting (.env)

Pastikan variabel berikut disesuaikan di server produksi:
- `PDSPUSHER_MANAGER_DRIVER=mysql`: Aktifkan ini jika ingin menggunakan database.
- `PDSPUSHER_DB_MYSQL_HOST`: Alamat host MySQL server.
- `PORT`: Port WebSocket (default: 6001).

---

## 🛡️ Tips Keamanan & Performa
- **Reverse Proxy**: Gunakan **Nginx** sebagai reverse proxy untuk menangani SSL (WSS).
- **Node.js Version**: Gunakan Node.js v22.x untuk hasil performa terbaik dengan binary yang disertakan.
- **Firewall**: Pastikan port yang dikonfigurasi terbuka di firewall server Anda.

---
*Dibuat oleh Tim PDS - 2026*
