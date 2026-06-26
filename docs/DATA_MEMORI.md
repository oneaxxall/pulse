# 🧠 Dokumentasi Manajemen Data Memori (RAM)

Dokumen ini menjelaskan informasi apa saja yang disimpan secara sementara (temporary) di dalam RAM oleh PDS Pusher Server selama operasionalnya.

## 1. Jenis Data yang Disimpan

Server menggunakan penyimpanan in-memory untuk memastikan performa *real-time* yang maksimal. Data-data berikut akan dihapus secara otomatis saat koneksi terputus atau server restart.

### A. Objek Koneksi (WebSocket)
Setiap client yang terhubung akan mengonsumsi memori untuk menyimpan:
- **Socket ID**: Identifier unik untuk jalur komunikasi.
- **IP Address**: Alamat IP client (mendukung deteksi Proxy/Cloudflare).
- **Subscription List**: Daftar channel (public, private, presence) yang sedang diikuti.
- **Handshake State**: Status autentikasi koneksi.

### B. Data Presence (Status Online)
Khusus untuk channel bertipe `presence-`, server menyimpan metadata user:
- **User ID**: ID unik user (misal: ID dari database utama).
- **User Info**: Metadata tambahan dalam bentuk JSON (misal: nama, foto profil, role).
- **Member Map**: Daftar siapa saja yang ada di dalam channel tertentu untuk dibagikan ke user lain.

### C. Statistik Operasional
Data akumulasi sementara untuk endpoint `/usage` dan `/metrics`:
- Jumlah koneksi aktif (Total Connections).
- Jumlah pesan masuk/keluar (Messages Throughput).
- Penggunaan RAM sistem (RSS & Heap Usage).

### D. Cluster & Discovery State
Jika berjalan dalam mode cluster:
- **Node ID**: Identitas server lain dalam jaringan.
- **Node Address**: IP dan Port server lain untuk sinkronisasi broadcast.

---

## 2. Kebijakan Privasi & Keamanan (FAQ)

### Apakah User Agent (Browser) disimpan?
**Tidak.** Secara default, User Agent hanya dibaca saat proses *handshake* awal untuk validasi keamanan, namun tidak disimpan secara permanen di memory untuk menghemat RAM.

### Apakah pesan broadcast disimpan?
**Hanya Sementara.** Pesan broadcast hanya berada di memory selama proses pengiriman ke client (milidetik). Jika fitur `Channel Cache` tidak diaktifkan, pesan tersebut langsung dibuang setelah terkirim.

### Apakah data ini aman?
Ya, karena:
1. **Volatile**: Data tidak pernah ditulis ke Harddisk (Disk I/O).
2. **Auto-Cleanup**: Saat user melakukan *disconnect*, sistem *Garbage Collection* Node.js akan langsung membersihkan sisa memorinya.
3. **Encrypted in Transit**: Jika menggunakan SSL/TLS, semua data ini tidak bisa disadap saat dikirim antar server atau ke client.

---

## 3. Estimasi Penggunaan Memori
- **Koneksi Idle**: ±10-20 KB per koneksi.
- **Koneksi Active (Presence)**: Bergantung pada ukuran `User Info` yang Anda kirimkan (disarankan tetap di bawah 2 KB).
