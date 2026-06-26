# Pulse — Self-Hosted Pusher-Compatible WebSocket Server

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Node Version](https://img.shields.io/badge/node-14%20-%2018-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-3178C6)](https://www.typescriptlang.org/)

**Pulse** is a high-performance, self-hosted WebSocket server that implements the **Pusher protocol** for real-time bidirectional messaging. It is a **fork of [Soketi](https://github.com/soketi/soketi)** with additional enhancements and modifications. Built on top of [uWebSockets.js](https://github.com/uNetworking/uWebSockets.js) — a C++-compiled WebSocket and HTTP library — Pulse delivers exceptional performance with minimal resource overhead.

It provides a drop-in replacement for [Pusher.com](https://pusher.com/) Channels, allowing you to run your own real-time infrastructure behind your firewall, on your own hardware, or in any cloud environment.

---

## ✨ Features

- **Pusher Protocol Compatible** — Works seamlessly with Pusher JS SDK, Laravel Echo, and Pusher backend SDKs (PHP, Node.js, Python, etc.)
- **High Performance** — Powered by uWebSockets.js, a C++-native engine capable of tens of thousands of concurrent connections
- **Channel Types** — Public, Private, Encrypted Private, and Presence channels
- **Client Events** — Enable client-to-client messaging on private channels
- **Horizontal Scaling** — Multiple adapters: Local, Redis, NATS, Cluster
- **Rate Limiting** — Granular rate limiting for backend events, client events, and read requests
- **Webhooks** — HTTP webhook notifications with optional AWS Lambda support
- **Webhook Logging** — Persist deliveries to files or database
- **Prometheus Metrics** — Expose real-time server metrics
- **Queue System** — Async event processing via sync or Redis (BullMQ)
- **Multi-App Support** — Serve multiple applications with isolated credentials
- **Graceful Shutdown** — Drain active connections before terminating
- **SSL/TLS Support** — Serve secure WSS connections
- **Docker Support** — Containerized deployment ready
- **PM2 Support** — Process management via PM2 clustering
- **CORS** — Fully configurable CORS headers

---

## 📋 Table of Contents

- [Requirements](#requirements)
- [Architecture Overview](#architecture-overview)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Channel Types](#channel-types)
- [Horizontal Scaling](#horizontal-scaling)
- [Monitoring & Metrics](#monitoring--metrics)
- [API Endpoints](#api-endpoints)
- [Webhooks](#webhooks)
- [Rate Limiting](#rate-limiting)
- [Project Structure](#project-structure)
- [Development](#development)
- [Known Limitations](#known-limitations)
- [Contributing](#contributing)
- [License](#license)

---

## 📦 Requirements

| Dependency | Version |
|------------|---------|
| [Node.js](https://nodejs.org) | v14 – v18 |
| [npm](https://www.npmjs.com/) | v6+ |
| Memory | Minimum 256 MB (recommended: 1 GB+) |

**Optional:**
- [Redis](https://redis.io/) — For Redis adapter, rate limiter, cache, and queue
- [NATS](https://nats.io/) — For NATS adapter
- [MySQL](https://www.mysql.com/) / [PostgreSQL](https://www.postgresql.org/) — For database-backed app managers
- [Docker](https://www.docker.com/) — Containerized deployment
- [PM2](https://pm2.keymetrics.io/) — Production process management

> **Note:** Due to uWebSockets.js limitations, Pulse cannot run on CentOS 7. Tested on CentOS 8 and Ubuntu.

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        Pulse Server                          │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐   │
│  │   HTTP   │  │ WebSocket │  │  Metrics  │  │   Queue    │   │
│  │  Handler │  │  Handler  │  │  (Prom)   │  │  Processor │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬─────┘   │
│       │             │             │               │          │
│  ┌────▼─────────────▼─────────────▼───────────────▼──────┐    │
│  │                    Core Engine                         │    │
│  │              (uWebSockets.js / Node.js)                │    │
│  └────────────────────────┬──────────────────────────────┘    │
│                           │                                   │
│  ┌────────────────────────▼──────────────────────────────┐    │
│  │                 Adapter Layer                           │    │
│  │  ┌───────┐  ┌───────┐  ┌──────┐  ┌────────┐          │    │
│  │  │ Local │  │ Redis │  │ NATS │  │Cluster │          │    │
│  │  └───────┘  └───────┘  └──────┘  └────────┘          │    │
│  └───────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐    │
│  │              App Manager Layer                         │    │
│  │  ┌───────┐  ┌───────┐  ┌──────────┐                  │    │
│  │  │ Array │  │ MySQL │  │PostgreSQL│                  │    │
│  │  └───────┘  └───────┘  └──────────┘                  │    │
│  └───────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Installation

### CLI Installation

```bash
git clone https://github.com/oneaxxall/pulse.git
cd pulse
npm install
npm run build
npm link
```

Now use the `pulse` command anywhere:

```bash
pulse start
```

### Docker

```bash
docker build -t pulse .
docker run -d --name pulse -p 6001:6001 pulse
```

Or use docker-compose:

```bash
docker-compose up -d
```

### PM2

```bash
pm2 start pulse -- start
```

---

## ⚙️ Configuration

Configuration methods (in order of precedence):
1. **JSON config file** — `pulse --config=app.json`
2. **Environment variables** — `.env` file (prefix: `PULSE_`)
3. **Default configuration** — Defined in `src/server.ts`

### Default Credentials

| Parameter | Default Value |
|-----------|---------------|
| App ID | `app-id` |
| App Key | `app-key` |
| App Secret | `app-secret` |
| Port | `6001` |

### Key Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PULSE_DEBUG` | `1` | Enable debug logging |
| `PULSE_ADAPTER_DRIVER` | `local` | Adapter driver |
| `PULSE_PORT` | `6001` | Server port |
| `PULSE_MANAGER_DRIVER` | `array` | App manager driver |

---

## 🎯 Usage

### Client Connection (Pusher JS SDK)

```javascript
const pusher = new Pusher('app-key', {
    wsHost: 'your-server.com',
    wsPort: 6001,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
});

const channel = pusher.subscribe('my-channel');
channel.bind('my-event', data => {
    console.log('Received:', data);
});
```

### Client Connection (Laravel Echo)

```javascript
import Echo from 'laravel-echo';
window.Pusher = require('pusher-js');

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'app-key',
    wsHost: 'your-server.com',
    wsPort: 6001,
    forceTLS: false,
    disableStats: true,
});
```

### Backend Trigger (PHP)

```php
$pusher = new Pusher\Pusher('app-key', 'app-secret', 'app-id', [
    'host' => 'your-server.com',
    'port' => 6001,
    'scheme' => 'http',
]);

$pusher->trigger('my-channel', 'my-event', ['message' => 'Hello World!']);
```

### Backend Trigger (REST API)

```bash
curl -X POST http://your-server.com:6001/apps/app-id/events \
  -H "Content-Type: application/json" \
  -d '{"name": "my-event", "channel": "my-channel", "data": "{\"message\":\"Hello World!\"}"}'
```

---

## 📡 Channel Types

| Type | Prefix | Description |
|------|--------|-------------|
| Public | (none) | Open to all clients |
| Private | `private-` | Requires auth; supports client events |
| Encrypted Private | `private-encrypted-` | End-to-end encrypted private channel |
| Presence | `presence-` | Tracks connected users |
| Cache | `cache-*` | Caches channel state |

---

## 🔄 Horizontal Scaling

| Architecture | Adapter | Rate Limiter |
|-------------|---------|--------------|
| Single node, single thread | `local` | `local` |
| Single node, multi-thread (PM2) | `cluster` | `cluster` |
| Multi-node, same network | `cluster` / `redis` | `cluster` / `redis` |
| Multi-node, multi-network | `redis` | `redis` |

---

## 📊 Monitoring

Pulse exposes Prometheus metrics on port `9601`:

```bash
PULSE_METRICS_ENABLED=true
PULSE_METRICS_SERVER_PORT=9601
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/ready` | Health check |
| `GET` | `/health` | Detailed health |
| `GET` | `/usage` | Memory usage |
| `GET` | `/accept-traffic` | Traffic capacity check |
| `GET` | `/apps/:appId/channels` | List channels |
| `POST` | `/apps/:appId/events` | Trigger event |
| `POST` | `/apps/:appId/events/batch` | Batch trigger events |

---

## 🔗 Webhooks

Events: `client_event`, `channel_occupied`, `channel_vacated`, `member_added`, `member_removed`. Supports AWS Lambda triggers.

---

## ⛔ Rate Limiting

| Limiter | Scope | Default |
|---------|-------|---------|
| Backend events | POST `/events` | Unlimited (-1) |
| Client events | Per socket | Unlimited (-1) |
| Read requests | Read APIs | Unlimited (-1) |

---

## 📁 Project Structure

```
pulse/
├── bin/                  # CLI entry points
├── certs/                # SSL examples
├── configurations/       # DB schemas, Nginx, Supervisor configs
├── docs/                 # Documentation
├── sdk/                  # SDK examples
├── src/
│   ├── adapters/         # Local, Redis, NATS, Cluster adapters
│   ├── app-managers/     # Array, MySQL, PostgreSQL managers
│   ├── cache-managers/   # Memory, Redis cache
│   ├── channels/         # Public, private, presence, encrypted
│   ├── cli/              # CLI implementation
│   ├── metrics/          # Prometheus drivers
│   ├── queues/           # Sync, Redis queue drivers
│   ├── rate-limiters/    # Local, Redis, cluster
│   ├── types/            # TypeScript definitions
│   ├── server.ts         # Core server
│   ├── ws-handler.ts     # WebSocket handler
│   ├── http-handler.ts   # REST API handler
│   └── ...               # Other modules
├── main.ts               # Entry point
├── package.json
├── tsconfig.json
├── Dockerfile
└── docker-compose.yml
```

---

## 🛠️ Development

```bash
npm run dev        # Hot-reload development
npm run build      # Compile TypeScript
npm test           # Run tests
npm run test:local # Verbose tests
npm run lint       # Lint source
npm run bundle     # Production bundle
```

---

## ⚠️ Known Limitations

- CentOS 7 not supported
- Windows not extensively tested
- Subset of Pusher HTTP API implemented (core features complete)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and open a Pull Request

---

## � Acknowledgements

- [Soketi](https://github.com/soketi/soketi) — The original project that Pulse is forked from
- [Pusher.com](https://pusher.com/) — For the protocol specification and inspiration
- [uNetworking/uWebSockets.js](https://github.com/uNetworking/uWebSockets.js) — The high-performance WebSocket engine
- [Laravel](https://laravel.com/) — For Laravel Echo and broadcasting integration

---

## �📄 License

AGPL-3.0 License

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/oneaxxall">oneaxxall</a>
</p>
