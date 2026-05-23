# Pulse Chat Development Guide

Welcome! This repository contains a production-ready E2EE chat application.

## 🧭 Repository Navigation
Before making changes, please refer to the **Graphify Knowledge Graph** for a full structural overview:
- **Architecture Report**: [graphify-out/GRAPH_REPORT.md](graphify-out/GRAPH_REPORT.md)
- **Visual/JSON Graph**: [graphify-out/graph.json](graphify-out/graph.json)

## 🛠️ Key Commands
- `npm run dev`: Start both client and server (root)
- `cd client && npm run dev`: Start only the frontend
- `cd server && npm run dev`: Start only the backend

## 🧩 Standards
- **Styling**: Vanilla CSS (Tailwind CSS also used in some components).
- **State**: Zustand for global state.
- **E2EE**: All messages must be encrypted before sending. Check `client/src/lib/crypto.ts`.
- **Naming**: PascalCase for components, camelCase for functions/variables.
