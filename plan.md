# Forgot Password & Welcome Email

Add a secure forgot-password flow with email-based OTP reset, and send a styled welcome email to new signups.

## User Review Required

> [!IMPORTANT]
> **Email provider choice**: I'll use **Nodemailer with Gmail SMTP** (free, no third-party signup). You'll need to generate a [Google App Password](https://myaccount.google.com/apppasswords) for your Gmail account. Is that okay, or would you prefer another provider like Resend, SendGrid, etc.?

> [!IMPORTANT]
> **Reset flow**: I'm proposing a **6-digit OTP code** sent to the user's email (not a URL link). The user enters their email → receives a code → enters code + new password. This is simpler, more mobile-friendly, and avoids needing a publicly accessible server URL. Good?

## Proposed Changes

### Server: Email Service (new)

#### [NEW] [emailService.ts]
- Nodemailer transporter configured with Gmail SMTP
- `sendWelcomeEmail(email, username)` — branded HTML welcome email
- `sendPasswordResetEmail(email, username, otpCode)` — styled HTML email with 6-digit OTP

---

### Server: User Model

#### [MODIFY] [User.ts]()
- Add `passwordResetOTP: String` field
- Add `passwordResetExpires: Date` field
- Both fields are temporary and cleared after use

---

### Server: Auth Service

#### [MODIFY] [authService.ts]()
- `register()` → After creating user, call `emailService.sendWelcomeEmail()` (fire-and-forget, non-blocking)
- New `forgotPassword(email)` → generates cryptographically random 6-digit OTP, hashes it, stores with 10-min expiry, sends email
- New `resetPassword(email, otp, newPassword)` → verifies OTP, resets password, clears OTP fields

---

### Server: Auth Controller & Routes

#### [MODIFY] [authController.ts]()
- New `forgotPassword()` handler
- New `resetPassword()` handler

#### [MODIFY] [authRoutes.ts]()
- `POST /auth/forgot-password` — rate limited
- `POST /auth/reset-password` — rate limited

---

### Server: Env Configuration

#### [MODIFY] [env.ts]()
- Add `SMTP_EMAIL` and `SMTP_APP_PASSWORD` to the schema

#### [MODIFY] [.env]()
- Add `SMTP_EMAIL=your_gmail@gmail.com` and `SMTP_APP_PASSWORD=your_app_password`

---

### Server: Dependencies

#### [MODIFY] [package.json]()
- `npm install nodemailer`
- `npm install -D @types/nodemailer`

---

### Client: Forgot Password Page (new)

#### [NEW] [page.tsx]()
- Two-step form matching the existing auth page design:
  1. **Step 1**: Enter email → calls `POST /auth/forgot-password`
  2. **Step 2**: Enter OTP code + new password + confirm → calls `POST /auth/reset-password`
- Success → redirects to login with success toast
- Uses the same glass-panel, gradient theming as login/register

---

### Client: Login Page

#### [MODIFY] [page.tsx]()
- Add "Forgot password?" link below the password field, linking to `/forgot-password`

---

## Security Measures

| Measure | Implementation |
|---|---|
| OTP hashing | OTP stored as bcrypt hash in DB (never plain text) |
| OTP expiry | 10-minute TTL |
| Rate limiting | Auth rate limiter on both endpoints |
| Generic responses | "If this email exists, we sent a code" (no email enumeration) |
| OTP cleanup | Cleared from DB immediately after successful use |
| Brute force defense | Only 3 attempts per OTP, then invalidated |

## Verification Plan

### Manual Verification
- Register a new user → check inbox for welcome email
- Click "Forgot password?" → enter email → check inbox for OTP email
- Enter OTP + new password → verify login works with new password
- Verify invalid/expired OTP is rejected
