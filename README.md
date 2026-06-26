# Pulse — Self-Hosted Pusher-Compatible WebSocket Server

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Node Version](https://img.shields.io/badge/node-18%20-%2024-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-3178C6)](https://www.typescriptlang.org/)
[![Bundle](https://img.shields.io/badge/bundle-esbuild-FFCF00)](https://esbuild.github.io/)

**Pulse** is a high-performance, self-hosted WebSocket server that implements the **Pusher protocol** for real-time bidirectional messaging. It is a **fork of [Soketi](https://github.com/soketi/soketi)** with significant enhancements, modernized dependencies, and production-ready features built on top of [uWebSockets.js](https://github.com/uNetworking/uWebSockets.js) — a C++-compiled WebSocket and HTTP library.

It provides a drop-in replacement for [Pusher.com](https://pusher.com/) Channels, allowing you to run your own real-time infrastructure behind your firewall, on your own hardware, or in any cloud environment.

---

## ✨ Features

- **Pusher Protocol Compatible** — Works seamlessly with Pusher JS SDK, Laravel Echo, and Pusher backend SDKs (PHP, Node.js, Python, etc.)
- **High Performance** — Powered by uWebSockets.js, a C++-native engine capable of tens of thousands of concurrent connections
- **Node.js v18 – v24 Support** — Fully compatible with the latest Node.js runtimes up to version 24
- **Channel Types** — Public, Private, Encrypted Private, and Presence channels
- **Client Events** — Enable client-to-client messaging on private channels
- **Horizontal Scaling** — Multiple adapters: Local, Redis, NATS, Cluster
- **Rate Limiting** — Granular rate limiting for backend events, client events, and read requests
- **Webhooks** — HTTP webhook notifications with optional AWS Lambda support
- **Webhook Logger** — Persist webhook deliveries to daily log files (webhook-YYYY-MM-DD.log) or database (MySQL/PostgreSQL)
- **Production-Ready Bundling** — Single-file bundle via esbuild for zero-dependency deployment
- **Prometheus Metrics** — Expose real-time server metrics on a dedicated HTTP endpoint
- **Queue System** — Async event processing via sync or Redis (BullMQ)
- **Multi-App Support** — Serve multiple applications with isolated credentials
- **Graceful Shutdown** — Drain active connections before terminating
- **SSL/TLS Support** — Serve secure WSS connections
- **Docker Support** — Containerized deployment ready
- **PM2 Support** — Process management via PM2 clustering
- **CORS** — Fully configurable CORS headers

---

## 📋 Table of Contents

- [Why Pulse? (vs Soketi)](#why-pulse-vs-soketi)
- [Requirements](#requirements)
- [Architecture Overview](#architecture-overview)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Channel Types](#channel-types)
- [Horizontal Scaling](#horizontal-scaling)
- [Webhook Logger](#webhook-logger)
- [Production Bundling](#production-bundling)
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

## 🆚 Why Pulse? (vs Soketi)

Pulse is a **fork of [Soketi](https://github.com/soketi/soketi)** with a focus on modernization, production readiness, and enhanced observability.

| Aspect | Soketi | Pulse |
|--------|--------|-------|
| **Node.js Support** | v14 – v18 | **v18 – v24** (latest) |
| **Webhook Logging** | Not available | File & Database logging — daily rotated logs or MySQL/PostgreSQL tables |
| **Production Bundling** | Requires npm install on server | esbuild zero-dependency bundle — single JS file |
| **Environment Prefix** | SOKETI_ | **PULSE_** |
| **AWS Lambda Webhooks** | Not available | Direct Lambda invocation as webhook target |
| **Database Pooling** | Not available | Knex connection pooling for MySQL/PostgreSQL |
| **Graceful Shutdown** | Basic | Configurable grace period with connection draining |
| **Memory Monitoring** | Not available | Accept-traffic endpoint with memory threshold check |
| **Docker Build** | Standard | Multi-stage build with modclean for minimal image size |
| **Default Credentials** | Random-generated | Pre-configured defaults for quick start |
| **CLI Binary Name** | soketi | **pulse** |
| **Documentation** | English only | Full English documentation with detailed architecture |
| **Configuration File** | Basic .env.example | Comprehensive .env.example with 20 organized sections |

> **Summary:** Pulse takes everything great about Soketi and adds production-hardened features: webhook persistence for debugging, a zero-dependency bundle for easy deployment, support for modern Node.js runtimes up to v24, and extensive documentation.

---

## 📦 Requirements

| Dependency | Version |
|------------|---------|
| [Node.js](https://nodejs.org) | v18 – **v24** |
| [npm](https://www.npmjs.com/) | v8+ |
| Memory | Minimum 256 MB (recommended: 1 GB+) |

**Optional:**
- [Redis](https://redis.io/) — For Redis adapter, rate limiter, cache, and queue
- [NATS](https://nats.io/) — For NATS adapter
- [MySQL](https://www.mysql.com/) / [PostgreSQL](https://www.postgresql.org/) — For database-backed app managers and webhook logging
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
│                                                               │
│  ┌───────────────────────────────────────────────────────┐    │
│  │         Webhook Logger Layer                            │    │
│  │  ┌──────────────┐  ┌──────────────────┐               │    │
│  │  │  File Logger  │  │  Database Logger  │             │    │
│  │  │ (Daily Rotate)│  │ (MySQL/Postgres) │              │    │
│  │  └──────────────┘  └──────────────────┘               │    │
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

### Production Bundle (Zero-Dependency)

```bash
./production.sh
# Creates pulse-production.tar.gz (~35MB)
# Contains a single bundled JS file — no npm install needed on target server!
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
| `PULSE_WEBHOOKS_LOGS_ENABLED` | `false` | Enable webhook logging to files |
| `PULSE_WEBHOOKS_LOGS_DB_ENABLED` | `false` | Enable webhook logging to database |

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

## 📝 Webhook Logger

Pulse includes a built-in **Webhook Logger** that persists all webhook deliveries for auditing, debugging, and compliance.

### File Logging

```bash
PULSE_WEBHOOKS_LOGS_ENABLED=true
PULSE_WEBHOOKS_LOGS_DIR=logs
```

Log files are rotated daily: `webhook-YYYY-MM-DD.log`

### Database Logging

```bash
PULSE_WEBHOOKS_LOGS_DB_ENABLED=true
```

> Note: Database logging works with mysql/postgres manager driver. Run the SQL schema from `configurations/pds-pusher-manager.sql`.

---

## 📦 Production Bundling

Pulse uses **esbuild** to compile the entire application into a single JavaScript file.

| Feature | Traditional | Pulse Bundled |
|---------|-------------|---------------|
| npm install on server | Required | **Not needed** |
| Deployment size | ~200MB+ | **~35MB** (compressed) |
| Startup time | Slow | **Instant** |
| Dependency conflicts | Possible | **Eliminated** |
| File count | Thousands | **Single JS file** |

```bash
./production.sh
# Output: pulse-production.tar.gz (~35MB)
```

### Deploy

```bash
tar -xzf pulse-production.tar.gz
./run-pulse-server.sh
```

---

## 📊 Monitoring

Pulse exposes Prometheus-compatible metrics on port `9601`:

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
| Backend events | POST /events | Unlimited (-1) |
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
│   ├── webhook-log-adapters/ # File & DB webhook log storage
│   ├── server.ts         # Core server
│   ├── ws-handler.ts     # WebSocket handler
│   ├── http-handler.ts   # REST API handler
│   └── webhook-logger.ts # Webhook logging system
├── tools/
│   └── build.js          # esbuild bundling script
├── main.ts               # Entry point
├── production.sh         # Production bundling script
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

## 🙏 Acknowledgements

- [Soketi](https://github.com/soketi/soketi) — The original project that Pulse is forked from
- [Pusher.com](https://pusher.com/) — For the protocol specification and inspiration
- [uNetworking/uWebSockets.js](https://github.com/uNetworking/uWebSockets.js) — The high-performance WebSocket engine
- [Laravel](https://laravel.com/) — For Laravel Echo and broadcasting integration

---

## 📄 License

AGPL-3.0 License

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/oneaxxall">oneaxxall</a>
</p>
