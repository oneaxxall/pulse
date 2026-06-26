# 🛠️ Development Guide: PDS Pusher Server

Panduan ini ditujukan bagi pengembang yang ingin berkontribusi atau melakukan modifikasi pada kode sumber **PDS Pusher Server**.

---

## 🛠️ 1. Persiapan Lingkungan

Pastikan Anda memiliki:
- **Node.js**: Versi 22.x (Direkomendasikan).
- **TypeScript**: Terinstal secara global atau via dependensi.

Instalasi dependensi:
```bash
npm install
```

---

## 🚀 2. Menjalankan Server (Development)

Untuk pengembangan sehari-hari, gunakan fitur **Live Reload** agar server otomatis restart setiap kali Anda menyimpan perubahan pada file `.ts`.

```bash
npm run dev
```

Ini menggunakan `ts-node-dev` yang sangat cepat karena hanya melakukan transpilasi tanpa pengecekan tipe data penuh di setiap restart.

---

## 🏗️ 3. Proses Build

Jika Anda ingin melakukan pengecekan tipe data secara menyeluruh dan menghasilkan file JavaScript:

```bash
# Build satu kali
npm run build

# Build dengan mode pemantauan (watch mode)
npm run build:watch
```

---

## 📦 4. Bundling Manual

Jika Anda ingin mengetes proses bundling sebelum deployment:

```bash
npm run bundle
```
Hasil bundle akan muncul di folder `/bundle`.

---

## 🧪 5. Testing

Aplikasi ini menggunakan Jest untuk pengujian:

```bash
# Menjalankan semua test
npm test

# Menjalankan test dalam mode verbose
npm run test:local
```

---

## 📝 Alur Pengembangan
1. Buat branch baru untuk fitur/bugfix.
2. Lakukan perubahan pada folder `src/`.
3. Gunakan `npm run dev` untuk verifikasi instan.
4. Pastikan `npm test` lulus sebelum melakukan commit.
5. Push perubahan Anda.

---
*Dibuat oleh Tim PDS - 2026*
