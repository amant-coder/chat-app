# Pulse Chat

A production-ready real-time chat application with End-to-End Encryption (E2EE), high-contrast UI, and real-time reactions.

## 🚀 Quick Start

1. **Install Dependencies**:
   ```bash
   npm run install:all
   ```

2. **Environment Setup**:
   Configure `.env` files in `client/` and `server/` based on their respective directories.

3. **Run Application**:
   ```bash
   npm run dev
   ```

## 🗺️ LLM Knowledge Graph (Graphify)
To help AI models understand this repository faster, we have integrated a **Graphify** knowledge graph:
- **Structural Overview**: [graphify-out/GRAPH_REPORT.md](graphify-out/GRAPH_REPORT.md)
- **Dependency Graph**: [graphify-out/graph.json](graphify-out/graph.json)

AI agents should read `CLAUDE.md` at the root for comprehensive development standards.

## 🏗️ Project Structure
- **/client**: Next.js 15 frontend with Zustand and Socket.io.
- **/server**: Express server with Socket.io, MongoDB, and E2EE logic.

## 🔐 Key Features
- **End-to-End Encryption**: RSA/AES-based security.
- **Real-time**: Messaging, Typing Indicators, and Status updates via Socket.IO.
- **File Support**: Image, Video, and Document uploads via Cloudinary.
- **Rich UI**: High-contrast dark/light mode and emoji reactions.
