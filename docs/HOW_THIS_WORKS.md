# 🛠️ PDS Pusher Server: Documentation & Internal Mechanisms

## 🌟 Overview
**pds-pusher-server** adalah server WebSocket performa tinggi yang dirancang khusus untuk kompatibilitas penuh dengan protokol **Pusher**. Dibangun di atas **uWebSockets.js** (engine C++ yang sangat cepat untuk Node.js), server ini berfungsi sebagai pengganti mandiri (*drop-in replacement*) untuk layanan Pusher.com atau Laravel Reverb.

Server ini bertindak sebagai perantara real-time antara aplikasi backend (misalnya Laravel) dan aplikasi frontend (Vue, React, Mobile), memungkinkan pengiriman data instan tanpa perlu polling manual.

---

## 🏗️ Arsitektur Sistem

### 1. Titik Masuk (Entry Points)
Server menangani dua jenis traffic secara bersamaan:
- **WebSocket (WS)**: Menangani koneksi persisten dari klien (frontend). Digunakan untuk langganan channel dan menerima event.
- **HTTP REST API**: Menangani permintaan dari backend (server-to-server). Digunakan untuk memicu event, mengecek status channel, dan manajemen user.

### 2. Komponen Utama
- **Server Engine (`server.ts`)**: Menginisiasi uWS App, menangani SSL, dan mengelola lifecycle koneksi.
- **WebSocket Handler (`ws-handler.ts`)**: Otak di balik komunikasi real-time. Menangani handshake Pusher, ping/pong, serta logika join/leave channel.
- **HTTP Handler (`http-handler.ts`)**: Implementasi API Pusher. Memproses permintaan POST dari backend dan memvalidasi tanda tangan HMAC.
- **Adapter Driver (`adapters/`)**: Lapisan abstraksi penyimpanan status.
    - **Local**: Menyimpan data koneksi di memori lokal (RAM).
    - **Redis**: Menggunakan Redis Pub/Sub untuk sinkronisasi antar beberapa node server (Horizontal Scaling).
- **App Manager (`app-managers/`)**: Mengelola kredensial aplikasi (`app-id`, `app-key`, `app-secret`) yang bisa disimpan di file (Array) atau Database (MySQL/PostgreSQL).

---

## 🚀 Cara Kerja (Internal Logic)

### Alur Koneksi Client
1. **Handshake**: Client melakukan koneksi ke `/app/:appKey`. Server memvalidasi App Key.
2. **Established**: Jika valid, server mengirim event `pusher:connection_established` beserta `socket_id`.
3. **Subscription**: Client mengirim `pusher:subscribe`.
    - Untuk **Public Channel**, server langsung memasukkan socket ke channel tersebut.
    - Untuk **Private/Presence Channel**, server memvalidasi tanda tangan `auth` yang dikirim client.
4. **Broadcast**: Jika ada pesan masuk untuk channel tersebut, server mencari semua socket yang terdaftar di channel tersebut (lewat Adapter) dan mengirimkan datanya.

### Alur Trigger Event (Backend-to-Frontend)
1. Backend mengirim POST request ke `/apps/:appId/events`.
2. `HttpHandler` memvalidasi `auth_signature` menggunakan `app-secret`.
3. Server memproses payload dan mengirimkan data tersebut ke semua client yang berlangganan channel terkait melalui WebSocket.

---

## 🔧 Konfigurasi

### File `.env`
Konfigurasi utama dilakukan melalui file `.env`.
```env
# Debug Mode (Tampilkan log detail di terminal)
PDSPUSHER_DEBUG=1

# Port Server
PORT=6001

# Driver Management Aplikasi (array | mysql | postgres)
PDSPUSHER_MANAGER_DRIVER=mysql
PDSPUSHER_DB_MYSQL_DATABASE=pds_pusher_db

# Driver Penyimpanan Koneksi (local | redis)
PDSPUSHER_ADAPTER_DRIVER=local
```

### Database Schema (Jika menggunakan driver MySQL)
Server mengharapkan tabel (misalnya `pusher_manager`) dengan kolom:
- `id`: App ID
- `key`: App Key
- `secret`: App Secret
- `max_connections`: Batas maksimal koneksi simultan.

---

## 📡 Fitur Lanjutan

### 1. Webhooks
Server dapat mengirim notifikasi balik ke backend Anda saat terjadi event tertentu:
- `channel_occupied`: Channel pertama kali dibuat (ada user join).
- `channel_vacated`: Channel kosong (user terakhir leave).
- `member_added` & `member_removed`: Khusus Presence Channel.
- `client_event`: Saat client mengirim data langsung melalui WebSocket (`client-*`).

### 2. Metrics & Monitoring
Endpoint `/metrics` (Prometheus compatible) menyediakan data:
- Jumlah koneksi aktif.
- Total pesan yang dikirim/diterima.
- Penggunaan memori (RSS, Heap).

---

## 📖 Panduan Penggunaan

### Integrasi Backend (Laravel)
Ubah file `.env` di proyek Laravel Anda:
```env
BROADCAST_DRIVER=pusher

PUSHER_APP_ID=app-id
PUSHER_APP_KEY=app-key
PUSHER_APP_SECRET=app-secret
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http
```

### Integrasi Frontend (Laravel Echo)
```javascript
import Echo from 'laravel-echo';
window.Pusher = require('pusher-js');

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'app-key',
    wsHost: '127.0.0.1',
    wsPort: 6001,
    forceTLS: false,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
});
```

---

## 🛡️ Keamanan (Security)
- **HMAC Authentication**: Setiap request dari backend wajib menyertakan tanda tangan digital yang dikalkulasi dengan `app-secret`.
- **Private Channels**: Memastikan user hanya bisa mendengarkan channel yang diizinkan oleh sistem backend melalui proses autentikasi.
- **Rate Limiting**: Melindungi server dari serangan brute-force atau spamming event dari sisi client.

---

## 📈 Tips Produksi
1. **Reverse Proxy**: Gunakan Nginx sebagai reverse proxy untuk menangani terminasi SSL (WSS).
2. **Process Manager**: Gunakan **PM2** untuk menjaga server tetap hidup jika terjadi crash.
   ```bash
   pm2 start ecosystem.config.js
   ```
3. **Scaling**: Jika traffic sangat tinggi, gunakan driver **Redis** dan jalankan beberapa instance server di belakang Load Balancer.

---
*Dokumentasi ini dibuat untuk memberikan pemahaman menyeluruh tentang cara kerja internal PDS Pusher Server. Dibuat dengan ❤️ oleh Tim PDS.*
