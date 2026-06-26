# 🧠 In-Memory Data Management Documentation (RAM)

This document explains what information is temporarily stored in RAM by Pulse Server during its operation.

## 1. Types of Data Stored

The server uses in-memory storage to ensure maximum *real-time* performance. The following data is automatically cleared when a connection is terminated or the server restarts.

### A. WebSocket Connection Objects
Each connected client consumes memory to store:
- **Socket ID**: A unique identifier for the communication channel.
- **IP Address**: The client's IP address (supports Proxy/Cloudflare detection).
- **Subscription List**: A list of channels (public, private, presence) the client is subscribed to.
- **Handshake State**: The connection authentication status.

### B. Presence Data (Online Status)
Specifically for `presence-` type channels, the server stores user metadata:
- **User ID**: A unique user identifier (e.g., ID from the main database).
- **User Info**: Additional metadata in JSON format (e.g., name, profile picture, role).
- **Member Map**: A list of who is currently in a given channel, shared with other users.

### C. Operational Statistics
Accumulated temporary data for the `/usage` and `/metrics` endpoints:
- Total active connections.
- Incoming/outgoing message throughput.
- System RAM usage (RSS & Heap).

### D. Cluster & Discovery State
When running in cluster mode:
- **Node ID**: Identity of other servers in the network.
- **Node Address**: IP and port of other servers for broadcast synchronization.

---

## 2. Privacy & Security Policy (FAQ)

### Is the User Agent (Browser) stored?
**No.** By default, the User Agent is only read during the initial *handshake* for security validation and is not permanently stored in memory to conserve RAM.

### Are broadcast messages stored?
**Temporarily Only.** Broadcast messages reside in memory only during the delivery process to clients (milliseconds). If the `Channel Cache` feature is not enabled, the messages are discarded immediately after delivery.

### Is this data secure?
Yes, because:
1. **Volatile**: Data is never written to disk (no Disk I/O).
2. **Auto-Cleanup**: When a user disconnects, Node.js's Garbage Collection immediately cleans up the remaining memory.
3. **Encrypted in Transit**: If SSL/TLS is enabled, this data cannot be intercepted during transmission between servers or to clients.

---

## 3. Estimated Memory Usage
- **Idle Connection**: ~10-20 KB per connection.
- **Active Connection (Presence)**: Depends on the size of the `User Info` you send (recommended to stay under 2 KB).
