# 🧪 Pulse Server Testing Guide

This document explains how to verify that the server is running correctly and how to test its main features.

## 1. Health Check

After starting the server, you can access the following endpoints to ensure the server is responding:

| Endpoint | Purpose | Example URL |
| :--- | :--- | :--- |
| `/` | Basic Health Check | `http://127.0.0.1:6001/` |
| `/ready` | Server readiness check | `http://127.0.0.1:6001/ready` |
| `/usage` | Usage statistics (JSON) | `http://127.0.0.1:9601/usage` |
| `/users` | Active user/connection list | `http://127.0.0.1:9601/users` |
| `/metrics` | Prometheus metrics data | `http://127.0.0.1:9601/metrics` |

> **Note:** By default, statistics endpoints (`/usage` & `/metrics`) are served on a separate port **9600** to avoid congesting the main data channel.

---

## 2. Authentication Testing (App Key & Secret)

This server is compatible with the Pusher protocol. To test whether your **App Key** and **App Secret** are valid, the easiest way is to try sending an event (Broadcast) using the API.

### A. Using Postman / cURL
Broadcast endpoint: `POST /apps/:app_id/events`

However, since Pusher uses HMAC SHA256 signature signing, sending requests manually via cURL can be challenging. Using the SDK is highly recommended.

### B. Using Node.js SDK (Most Accurate Method)
Create a `test-broadcast.js` file outside the server folder:

```javascript
const Pusher = require('pusher');

const pusher = new Pusher({
  appId: "1",             // Match the ID in the database
  key: "app-key",         // Match the key in the database
  secret: "app-secret",   // Match the secret in the database
  host: "127.0.0.1",
  port: "6001",
  useTLS: false,
  cluster: "mt1",
});

pusher.trigger("my-channel", "my-event", {
  message: "Hello from Pulse!"
}).then(response => {
  console.log("✅ Broadcast Successful:", response);
}).catch(err => {
  console.error("❌ Failed:", err);
});
```

---

## 3. WebSocket Testing (Frontend)

To test whether a client can connect, you can use tools like **"Smart Websocket Client"** (Chrome extension) or a simple script:

1. Connect to: `ws://127.0.0.1:6001/app/app-key`
2. If successful, you will receive a message:
   ```json
   {
     "event": "pusher:connection_established",
     "data": "{\"socket_id\":\"123.456\",\"activity_timeout\":30}"
   }
   ```

---

## 4. Monitoring & Metrics

If you have enabled metrics in `.env` (`PULSE_METRICS_ENABLED=true`), you can view Prometheus data at:
- `http://127.0.0.1:9600/metrics`

---

## 5. Troubleshooting (Common Issues)

- **Connection Refused**: Make sure the IP Bind in `.env` is correct (`0.0.0.0` for public access).
- **Auth Error (401)**: Double-check that the `App Secret` in the database matches the one used by the Client.
- **Wrong Sequence**: Ensure the server is using `mysql2` (fixed in the latest bundle version).
