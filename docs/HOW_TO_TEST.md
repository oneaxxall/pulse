# 🧪 Panduan Pengetesan PDS Pusher Server

Dokumen ini menjelaskan cara memverifikasi bahwa server berjalan dengan benar dan cara menguji fitur-fitur utamanya.

## 1. Cek Kesehatan Server (Health Check)

Setelah server dijalankan (`./run-pds-server.sh`), Anda bisa mengakses endpoint berikut untuk memastikan server merespons:

| Endpoint | Kegunaan | Contoh URL |
| :--- | :--- | :--- |
| `/` | Health Check dasar | `http://127.0.0.1:6001/` |
| `/ready` | Cek kesiapan server | `http://127.0.0.1:6001/ready` |
| `/usage` | Statistik penggunaan (JSON) | `http://127.0.0.1:9601/usage` |
| `/users` | Daftar user/koneksi aktif | `http://127.0.0.1:9601/users` |
| `/metrics` | Data Prometheus | `http://127.0.0.1:9601/metrics` |

> **Catatan:** Secara default, endpoint statistik (`/usage` & `/metrics`) dipisahkan ke port **9600** agar tidak membebani jalur data utama.

---

## 2. Pengetesan Authentikasi (App Key & Secret)

Server ini kompatibel dengan protokol Pusher. Untuk menguji apakah **App Key** dan **App Secret** Anda valid, cara termudah adalah dengan mencoba mengirimkan event (Broadcast) menggunakan API.

### A. Menggunakan Postman / cURL
Endpoint untuk broadcast: `POST /apps/:app_id/events`

Namun, karena Pusher menggunakan tanda tangan (signature) HMAC SHA256, mengirim manual via cURL cukup sulit. Sangat disarankan menggunakan script SDK.

### B. Menggunakan Node.js SDK (Cara Paling Akurat)
Anda bisa membuat file `test-broadcast.js` di luar folder server:

```javascript
const Pusher = require('pusher');

const pusher = new Pusher({
  appId: "1",             // Sesuai id di database
  key: "pds-key",         // Sesuai key di database
  secret: "pds-secret",   // Sesuai secret di database
  host: "127.0.0.1",
  port: "6001",
  useTLS: false,
  cluster: "mt1",
});

pusher.trigger("my-channel", "my-event", {
  message: "Halo dari PDS Pusher!"
}).then(response => {
  console.log("✅ Berhasil Broadcast:", response);
}).catch(err => {
  console.error("❌ Gagal:", err);
});
```

---

## 3. Pengetesan WebSocket (Frontend)

Untuk menguji apakah client bisa terhubung, Anda bisa menggunakan alat seperti **"Smart Websocket Client"** (extension Chrome) atau script sederhana:

1. Connect ke: `ws://127.0.0.1:6001/app/pds-key`
2. Jika berhasil, Anda akan menerima pesan:
   ```json
   {
     "event": "pusher:connection_established",
     "data": "{\"socket_id\":\"123.456\",\"activity_timeout\":30}"
   }
   ```

---

## 4. Monitoring & Metrics

Jika Anda mengaktifkan metrics di `.env` (`PDSPUSHER_METRICS_ENABLED=1`), Anda bisa melihat data untuk Prometheus di:
- `http://127.0.0.1:9600/metrics`

---

## 5. Troubleshooting (Masalah Umum)

- **Connection Refused**: Pastikan IP Bind di `.env` sudah benar (`0.0.0.0` untuk akses publik).
- **Auth Error (401)**: Periksa kembali apakah `App Secret` di database sudah cocok dengan yang digunakan di Client.
- **Wrong Sequence**: Pastikan server sudah menggunakan `mysql2` (sudah kita perbaiki di versi bundle terbaru).
