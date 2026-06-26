# 🪝 Dokumentasi Webhooks

Webhooks memungkinkan PDS Pusher Server untuk mengirimkan notifikasi *real-time* ke backend aplikasi Anda (Laravel/Node.js) saat terjadi aktivitas tertentu di WebSocket.

## 1. Konfigurasi Webhook

Webhook dikonfigurasi per-aplikasi di dalam database pada kolom `webhooks` (format JSON). 

### Struktur JSON Konfigurasi
```json
[
  {
    "url": "https://api.anda.com/pusher/webhook",
    "event_types": ["client_event", "member_added", "member_removed"],
    "filter": {
      "channel_name_starts_with": "chat-",
      "channel_name_ends_with": "-room"
    },
    "headers": {
      "X-Custom-Auth": "secret-token-anda"
    }
  }
]
```

### Parameter Konfigurasi:
- `url`: URL tujuan yang akan menerima data POST.
- `event_types`: Daftar event yang ingin dipantau (lihat daftar di bawah).
- `filter` (Opsional): Membatasi webhook hanya untuk channel tertentu.
- `headers` (Opsional): Header tambahan yang ingin dikirimkan ke server Anda.

---

## 2. Jenis Event yang Didukung

| Nama Event | Deskripsi |
| :--- | :--- |
| `client_event` | Saat user mengirimkan client-event (misal: `client-typing`). |
| `member_added` | Saat user bergabung ke Presence Channel (Online). |
| `member_removed` | Saat user keluar dari Presence Channel (Offline). |
| `channel_occupied` | Saat sebuah channel baru dibuat (ada orang pertama yang join). |
| `channel_vacated` | Saat sebuah channel kosong (orang terakhir keluar). |
| `cache_miss` | Saat request data cache tidak ditemukan. |

---

## 3. Keamanan & Verifikasi

Setiap request webhook menyertakan header **`X-Pusher-Signature`**. Anda **WAJIB** memverifikasi signature ini di sisi server Anda untuk memastikan data benar-benar berasal dari PDS Pusher.

### Cara Verifikasi (Contoh Node.js):
Signature adalah hasil **HMAC SHA256** dari *request body* menggunakan **App Secret** Anda sebagai key-nya.

```javascript
const crypto = require('crypto');

function verifyWebhook(body, receivedSignature, appSecret) {
    const expectedSignature = crypto
        .createHmac('sha256', appSecret)
        .update(JSON.stringify(body))
        .digest('hex');

    return expectedSignature === receivedSignature;
}
```

---

## 4. Format Data (Payload)

Data dikirimkan dalam format JSON seperti berikut:

```json
{
  "time_ms": 1625000000000,
  "events": [
    {
      "name": "member_added",
      "channel": "presence-chat",
      "user_id": "123"
    }
  ]
}
```

---

## 5. Tips Implementasi
1. **Response Cepat**: Server Anda harus merespons dengan status code `200 OK` sesegera mungkin.
2. **Antrian (Queue)**: Sangat disarankan untuk memasukkan data webhook ke dalam *Queue* di sisi server Anda agar tidak menghambat performa Pusher jika server Anda lambat merespons.
3. **Idempotency**: Karena jaringan internet tidak stabil, ada kemungkinan webhook terkirim dua kali. Pastikan server Anda bisa menanganinya.
