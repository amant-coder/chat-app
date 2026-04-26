# Project Graph Report: Pulse Chat

## 📌 Architecture Overview
Pulse Chat is a production-ready, full-stack real-time chat application with End-to-End Encryption (E2EE). It follows a monorepo-style structure with separate `client` (Next.js) and `server` (Express/Socket.IO) directories.

### 🧩 Core Tech Stack
- **Frontend**: Next.js 15, Tailwind CSS, Zustand (State Management), Socket.io-client.
- **Backend**: Node.js, Express, Socket.io, MongoDB (Mongoose), JWT Authentication.
- **Security**: RSA-OAEP & AES-GCM for End-to-End Encryption, Helmet, Rate Limiting.

---

## 📂 Repository Structure

### 💻 Client (`/client`)
- `src/app`: Next.js App Router pages.
  - `(auth)`: Login, Register, Forgot Password flows.
  - `(chat)`: Main chat interface.
- `src/components`: UI components.
  - `chat/`: Chat Window, Sidebar, Message Bubbles, Input, User Search.
  - `layout/`: Providers and Theme toggles.
- `src/stores`: Zustand stores for Auth, Chat, and UI state.
- `src/lib`: Utilities for API (Axios), Crypto (E2EE), and Socket.IO initialization.
- `src/hooks`: Custom React hooks (`useSocket`, `useChat`, etc.).

### ⚙️ Server (`/server`)
- `src/index.ts`: Application entry point, Express setup, and Socket.IO initialization.
- `src/socket/`: Real-time logic.
  - `handlers/`: Modularized handlers for messages, typing, status, read receipts, and reactions.
- `src/services/`: Business logic layer (Auth, Chat, Message, Upload, Email).
- `src/controllers/`: Request handling and response formatting.
- `src/models/`: Mongoose schemas (User, Conversation, Message).
- `src/routes/`: API route definitions.
- `src/middleware/`: Auth verification, error handling, rate limiting, and file upload.

---

## 🔐 Data Flow & Logic

### 1. Authentication
- **Flow**: User registers -> Server hashes password -> JWT issued (Access + Refresh tokens).
- **E2EE Setup**: Upon registration, client generates an RSA key pair. The private key is encrypted with a user-derived salt/password and stored locally (or on server in encrypted form), and the public key is sent to the server.

### 2. Real-time Messaging
- **Socket.IO**: Persistent connection established upon login.
- **Message Send**: 
  - Client encrypts message content with AES.
  - AES key is encrypted with recipient's RSA public key.
  - Payload + encrypted keys sent via `message:send` socket event.
- **Message Receive**: 
  - Server persists message and broadcasts to recipient.
  - Recipient decrypts AES key using their RSA private key, then decrypts message.

### 3. File Uploads
- Handled via Cloudinary. Client uploads to server -> Server uploads to Cloudinary -> URL stored in database.

---

## 📊 Database Schema Highlights

### User
- `username`, `email`, `password`
- `publicKey`, `encryptedPrivateKey`, `keySalt` (for E2EE)
- `status` (online/offline), `lastSeen`

### Conversation
- `participants` (Array of User IDs)
- `type` (currently 'direct')
- `lastMessage` (Denormalized for performance)

### Message
- `conversation` (Ref), `sender` (Ref)
- `content` (Encrypted string)
- `senderEncryptedKey`, `recipientEncryptedKey`, `iv`
- `type` (text, image, file, video)
- `status` (sent, delivered, read)
- `reactions` (Array of emoji/user mappings)

---

## 🚀 Getting Started
- Run `npm install` in root, client, and server.
- Set up `.env` files in both client and server based on provided samples.
- Use `npm run dev` in the root to start both client and server concurrently.
