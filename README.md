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
✅ Clerk Auth Integration — Complete
What Changed
File	Change
client/middleware.ts (new)	Clerk middleware protecting /chat routes, all auth pages public
client/src/app/layout.tsx	Wrapped with <ClerkProvider>
client/src/app/sso-callback/page.tsx (new)	Handles Clerk OAuth redirect callback
client/src/components/auth/SocialAuth.tsx	Replaced mock buttons with real Google + GitHub OAuth via Clerk
server/src/config/env.ts	Added CLERK_SECRET_KEY to env schema
server/src/controllers/authController.ts	Added clerkLogin() — verifies Clerk token server-side
server/src/services/authService.ts	Added optional avatar param to socialLogin()
server/src/routes/authRoutes.ts	Added POST /auth/clerk-login route
client/.env.local	Added Clerk publishable key + sign-in URL vars
server/.env	Added CLERK_SECRET_KEY placeholder
Security PIN — Unchanged ✅
The E2EE Security PIN flow is fully preserved. After Clerk authenticates the user:
https://chat.aman-devop.me/sitemap.xml
New user → PIN setup modal appears → keys generated client-side → uploaded to your backend
Existing user → PIN unlock modal → private key decrypted locally
🔑 You Must Do: Get Clerk Keys
Go to clerk.com → create a free app
Enable Google and GitHub OAuth providers in the Clerk dashboard
Set the Allowed redirect URLs: http://localhost:3006/sso-callback
Copy your keys and replace the placeholders in:
client/.env.local → NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... and CLERK_SECRET_KEY=sk_test_...
server/.env → CLERK_SECRET_KEY=sk_test_...
Both keys must be identical on client and server