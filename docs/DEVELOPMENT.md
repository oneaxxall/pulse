# 🛠️ Development Guide: Pulse Server

This guide is intended for developers who want to contribute to or modify the **Pulse Server** source code.

---

## 🛠️ 1. Environment Setup

Make sure you have:
- **Node.js**: Version 22.x (Recommended).
- **TypeScript**: Installed globally or via project dependencies.

Install dependencies:
```bash
npm install
```

---

## 🚀 2. Running the Server (Development)

For daily development, use the **Live Reload** feature so the server automatically restarts whenever you save changes to `.ts` files.

```bash
npm run dev
```

This uses `ts-node-dev`, which is very fast because it only transpiles without performing full type checking on every restart.

---

## 🏗️ 3. Build Process

If you want to perform thorough type checking and generate JavaScript files:

```bash
# Single build
npm run build

# Build with watch mode
npm run build:watch
```

---

## 📦 4. Manual Bundling

If you want to test the bundling process before deployment:

```bash
npm run bundle
```
The bundle output will appear in the `/bundle` folder.

---

## 🧪 5. Testing

This application uses Jest for testing:

```bash
# Run all tests
npm test

# Run tests in verbose mode
npm run test:local
```

---

## 📝 Development Workflow
1. Create a new branch for your feature/bugfix.
2. Make changes in the `src/` folder.
3. Use `npm run dev` for instant verification.
4. Make sure `npm test` passes before committing.
5. Push your changes.

---
*Created by Pulse Team - 2026*
