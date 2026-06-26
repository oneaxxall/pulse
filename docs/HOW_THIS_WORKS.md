# 🛠️ Pulse Server: Documentation & Internal Mechanisms

## 🌟 Overview
**Pulse** is a high-performance WebSocket server designed for full compatibility with the **Pusher** protocol. Built on top of **uWebSockets.js** (a very fast C++ engine for Node.js), this server acts as a self-hosted *drop-in replacement* for Pusher.com or Laravel Reverb.

The server acts as a real-time intermediary between backend applications (e.g., Laravel) and frontend applications (Vue, React, Mobile), enabling instant data delivery without manual polling.

---

## 🏗️ System Architecture

### 1. Entry Points
The server handles two types of traffic simultaneously:
- **WebSocket (WS)**: Manages persistent connections from clients (frontend). Used for channel subscriptions and receiving events.
- **HTTP REST API**: Handles requests from backend (server-to-server). Used for triggering events, checking channel status, and user management.

### 2. Core Components
- **Server Engine (`server.ts`)**: Initializes the uWS App, handles SSL, and manages the connection lifecycle.
- **WebSocket Handler (`ws-handler.ts`)**: The brain behind real-time communication. Handles Pusher handshake, ping/pong, and join/leave channel logic.
- **HTTP Handler (`http-handler.ts`)**: Pusher API implementation. Processes POST requests from the backend and validates HMAC signatures.
- **Adapter Driver (`adapters/`)**: State storage abstraction layer.
    - **Local**: Stores connection data in local memory (RAM).
    - **Redis**: Uses Redis Pub/Sub for synchronization across multiple server nodes (Horizontal Scaling).
- **App Manager (`app-managers/`)**: Manages application credentials (`app-id`, `app-key`, `app-secret`) stored in a file (Array) or Database (MySQL/PostgreSQL).

---

## 🚀 How It Works (Internal Logic)

### Client Connection Flow
1. **Handshake**: Client connects to `/app/:appKey`. The server validates the App Key.
2. **Established**: If valid, the server sends a `pusher:connection_established` event along with a `socket_id`.
3. **Subscription**: Client sends `pusher:subscribe`.
    - For **Public Channels**, the server immediately adds the socket to the channel.
    - For **Private/Presence Channels**, the server validates the `auth` signature sent by the client.
4. **Broadcast**: When a message arrives for a channel, the server looks up all sockets registered on that channel (via the Adapter) and delivers the data.

### Event Trigger Flow (Backend-to-Frontend)
1. Backend sends a POST request to `/apps/:appId/events`.
2. `HttpHandler` validates the `auth_signature` using the `app-secret`.
3. The server processes the payload and delivers the data to all clients subscribed to the relevant channel via WebSocket.

---

## 🔧 Configuration

### `.env` File
Main configuration is done through the `.env` file.
```env
# Debug Mode (Show detailed logs in terminal)
PULSE_DEBUG=1

# Server Port
PULSE_PORT=6001

# App Management Driver (array | mysql | postgres)
PULSE_MANAGER_DRIVER=mysql
PULSE_DB_MYSQL_DATABASE=pulse_db

# Connection Storage Driver (local | redis)
PULSE_ADAPTER_DRIVER=local
```

### Database Schema (When using MySQL driver)
The server expects a table (e.g., `pulse_manager`) with the following columns:
- `id`: App ID
- `key`: App Key
- `secret`: App Secret
- `max_connections`: Maximum simultaneous connections limit.

---

## 📡 Advanced Features

### 1. Webhooks
The server can send callback notifications to your backend when certain events occur:
- `channel_occupied`: A channel is first created (a user joins).
- `channel_vacated`: A channel becomes empty (last user leaves).
- `member_added` & `member_removed`: Presence channel specific.
- `client_event`: When a client sends data directly via WebSocket (`client-*`).

### 2. Metrics & Monitoring
The `/metrics` endpoint (Prometheus compatible) provides:
- Active connection count.
- Total messages sent/received.
- Memory usage (RSS, Heap).

---

## 📖 Usage Guide

### Backend Integration (Laravel)
Update the `.env` file in your Laravel project:
```env
BROADCAST_DRIVER=pusher

PUSHER_APP_ID=app-id
PUSHER_APP_KEY=app-key
PUSHER_APP_SECRET=app-secret
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http
```

### Frontend Integration (Laravel Echo)
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

## 🛡️ Security
- **HMAC Authentication**: Every request from the backend must include a digital signature computed with the `app-secret`.
- **Private Channels**: Ensures users can only listen to channels authorized by the backend system through an authentication process.
- **Rate Limiting**: Protects the server from brute-force attacks or event spamming from the client side.

---

## 📈 Production Tips
1. **Reverse Proxy**: Use Nginx as a reverse proxy to handle SSL termination (WSS).
2. **Process Manager**: Use **PM2** to keep the server alive in case of crashes.
   ```bash
   pm2 start ecosystem.config.js
   ```
3. **Scaling**: For high traffic, use the **Redis** driver and run multiple server instances behind a Load Balancer.

---
*This documentation was created to provide a comprehensive understanding of Pulse Server's internal workings. Made with ❤️ by the Pulse Team.*
