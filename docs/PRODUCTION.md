# 🚀 Production Deployment Guide: Pulse Server

This guide explains how to package, transfer, and run **Pulse Server** in a production environment using the **Bundling** method.

---

## 📦 1. Package Preparation (Bundling & Packing)

We use the **Bundling (esbuild/NCC)** method to combine the source code and all dependencies into a single JavaScript file. This makes the package very lightweight and eliminates the need for `npm install` on the target server.

Run this command on your development machine:
```bash
./production.sh
```

**Result:** A `pusher-production.tar.gz` file will be created in the root folder (~35MB).
This clean package contains only:
- `pulse-server-js`: A single application file optimized by esbuild.
- `uws_linux_x64_127.node`: Native Linux binary.
- `run-pulse-server.sh`: A convenient script to run the server.
- `configurations/`: Folder with SQL schemas and JSON config.
- `sdk/`: Supporting SDK files (if any).
- `.env.example`: Configuration template.

---

## 🚚 2. Deployment to Server (CentOS/Ubuntu)

1. Copy the `pusher-production.tar.gz` file to the target server.
2. Extract the file:
   ```bash
   mkdir -p pulse
   tar -xzf pusher-production.tar.gz -C pulse
   cd pulse
   ```
3. Prepare the configuration:
   ```bash
   cp .env.example .env
   nano .env # Adjust database and port settings
   ```

---

## ⚡ 3. How to Run

### Option A: Run Directly
Suitable for initial testing or using the runner script:
```bash
./run-pulse-server.sh
```
Or manually:
```bash
node pulse-server-js start
```

### Option B: Using PM2 (Production Recommended)
Keeps the application running in the background and automatically restarts on crash.

1. **Start the Application:**
   ```bash
   pm2 start pulse-server-js --name "pulse" -- start
   ```
2. **Monitor Logs:**
   ```bash
   pm2 logs pulse
   ```
3. **Persistence (Auto-start on server reboot):**
   ```bash
   pm2 save
   pm2 startup
   ```

---

## ⚙️ 4. Important Configuration (.env)

Make sure the following variables are adjusted on the production server:
- `PULSE_MANAGER_DRIVER=mysql`: Enable this if you want to use a database.
- `PULSE_DB_MYSQL_HOST`: MySQL server host address.
- `PULSE_PORT`: WebSocket port (default: 6001).

---

## 🛡️ Security & Performance Tips
- **Reverse Proxy**: Use **Nginx** as a reverse proxy to handle SSL (WSS) termination.
- **Node.js Version**: Use Node.js v22.x for optimal performance with the included binary.
- **Firewall**: Ensure the configured ports are open in your server firewall.

---
*Created by Pulse Team - 2026*
