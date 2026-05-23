import { Resend } from 'resend';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const resend = new Resend(env.RESEND_API_KEY);

class EmailService {
  private from = env.RESEND_FROM_EMAIL;

  async sendWelcomeEmail(email: string, username: string): Promise<void> {
    try {
      const { data, error } = await resend.emails.send({
        from: this.from,
        to: [email],
        subject: '🎉 Welcome to Pulse Chat!',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,#6c5ce7,#00cec9);line-height:64px;text-align:center;margin-bottom:16px;">
        <span style="font-size:28px;">💬</span>
      </div>
      <h1 style="color:#e8e8f0;font-size:28px;font-weight:700;margin:0 0 4px;">Welcome to Pulse Chat</h1>
      <p style="color:#9898b8;font-size:15px;margin:0;">Real-time messaging, reimagined.</p>
    </div>

    <!-- Card -->
    <div style="background:rgba(22,22,42,0.9);border:1px solid #2a2a4a;border-radius:16px;padding:32px;margin-bottom:24px;">
      <p style="color:#e8e8f0;font-size:16px;margin:0 0 16px;">Hey <strong style="color:#6c5ce7;">${username}</strong> 👋</p>
      <p style="color:#9898b8;font-size:14px;line-height:1.7;margin:0 0 24px;">
        Your account is all set up! You're now part of the Pulse community. Here's what you can do:
      </p>

      <div style="margin-bottom:24px;">
        <div style="display:flex;align-items:flex-start;margin-bottom:14px;">
          <span style="color:#00cec9;font-size:18px;margin-right:12px;line-height:1.4;">⚡</span>
          <div>
            <p style="color:#e8e8f0;font-size:14px;font-weight:600;margin:0;">Real-time Messaging</p>
            <p style="color:#6868a0;font-size:13px;margin:2px 0 0;">Instant delivery with read receipts & typing indicators</p>
          </div>
        </div>
        <div style="display:flex;align-items:flex-start;margin-bottom:14px;">
          <span style="color:#00cec9;font-size:18px;margin-right:12px;line-height:1.4;">📎</span>
          <div>
            <p style="color:#e8e8f0;font-size:14px;font-weight:600;margin:0;">File Sharing</p>
            <p style="color:#6868a0;font-size:13px;margin:2px 0 0;">Share images, documents, and more — up to 10MB</p>
          </div>
        </div>
        <div style="display:flex;align-items:flex-start;">
          <span style="color:#00cec9;font-size:18px;margin-right:12px;line-height:1.4;">🔒</span>
          <div>
            <p style="color:#e8e8f0;font-size:14px;font-weight:600;margin:0;">Secure & Private</p>
            <p style="color:#6868a0;font-size:13px;margin:2px 0 0;">End-to-end encrypted with JWT authentication</p>
          </div>
        </div>
      </div>

      <div style="text-align:center;">
        <a href="${env.CLIENT_URL}/chat" 
           style="display:inline-block;padding:14px 40px;background:linear-gradient(135deg,#6c5ce7,#00cec9);color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:14px;">
          Start Chatting →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <p style="text-align:center;color:#6868a0;font-size:12px;margin:0;">
      You're receiving this because you signed up for Pulse Chat.<br>
      If this wasn't you, you can safely ignore this email.
    </p>
  </div>
</body>
</html>`,
      });

      if (error) {
        logger.error('Failed to send welcome email:', error);
        return;
      }

      logger.info(`Welcome email sent to ${email} (id: ${data?.id})`);
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      // Don't throw — welcome email failure shouldn't block registration
    }
  }

  async sendPasswordResetEmail(email: string, username: string, otpCode: string): Promise<void> {
    try {
      const { data, error } = await resend.emails.send({
        from: this.from,
        to: [email],
        subject: '🔐 Pulse Chat — Password Reset Code',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,#6c5ce7,#00cec9);line-height:64px;text-align:center;margin-bottom:16px;">
        <span style="font-size:28px;">🔐</span>
      </div>
      <h1 style="color:#e8e8f0;font-size:24px;font-weight:700;margin:0;">Password Reset</h1>
    </div>

    <!-- Card -->
    <div style="background:rgba(22,22,42,0.9);border:1px solid #2a2a4a;border-radius:16px;padding:32px;margin-bottom:24px;">
      <p style="color:#e8e8f0;font-size:15px;margin:0 0 16px;">
        Hey <strong style="color:#6c5ce7;">${username}</strong>,
      </p>
      <p style="color:#9898b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
        We received a request to reset your Pulse Chat password. Use the code below to set a new one:
      </p>

      <!-- OTP Code -->
      <div style="text-align:center;margin:0 0 24px;">
        <div style="display:inline-block;background:#1a1a2e;border:2px solid #6c5ce7;border-radius:12px;padding:16px 32px;">
          <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#e8e8f0;font-family:monospace;">
            ${otpCode}
          </span>
        </div>
        <p style="color:#6868a0;font-size:13px;margin:12px 0 0;">
          This code expires in <strong style="color:#fdcb6e;">10 minutes</strong>
        </p>
      </div>

      <div style="background:rgba(255,118,117,0.1);border:1px solid rgba(255,118,117,0.2);border-radius:10px;padding:14px 16px;">
        <p style="color:#ff7675;font-size:13px;margin:0;line-height:1.5;">
          ⚠️ If you did not request this, please ignore this email. Your password will remain unchanged.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <p style="text-align:center;color:#6868a0;font-size:12px;margin:0;">
      This is an automated message from Pulse Chat.<br>
      Please do not reply to this email.
    </p>
  </div>
</body>
</html>`,
      });

      if (error) {
        logger.error('Failed to send password reset email:', error);
        throw new Error(`Resend API error: ${error.message}`);
      }

      logger.info(`Password reset email sent to ${email} (id: ${data?.id})`);
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw error; // Throw here — if we can't send the email, the reset fails
    }
  }

  async sendAdminAccessEmail(email: string, username: string, otpCode: string): Promise<void> {
    try {
      const { data, error } = await resend.emails.send({
        from: this.from,
        to: [email],
        subject: '🛡️ Pulse Chat — Admin Access Code',
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0f;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,#e84393,#fd79a8);line-height:64px;text-align:center;margin-bottom:16px;">
        <span style="font-size:28px;">🛡️</span>
      </div>
      <h1 style="color:#e8e8f0;font-size:24px;font-weight:700;margin:0;">Admin Access</h1>
    </div>

    <!-- Card -->
    <div style="background:rgba(22,22,42,0.9);border:1px solid #2a2a4a;border-radius:16px;padding:32px;margin-bottom:24px;">
      <p style="color:#e8e8f0;font-size:15px;margin:0 0 16px;">
        Hey <strong style="color:#fd79a8;">${username}</strong>,
      </p>
      <p style="color:#9898b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
        A request was made to access the Admin Panel. Use the secret code below to verify your identity:
      </p>

      <!-- OTP Code -->
      <div style="text-align:center;margin:0 0 24px;">
        <div style="display:inline-block;background:#1a1a2e;border:2px solid #e84393;border-radius:12px;padding:16px 32px;">
          <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#e8e8f0;font-family:monospace;">
            ${otpCode}
          </span>
        </div>
        <p style="color:#6868a0;font-size:13px;margin:12px 0 0;">
          This code expires in <strong style="color:#fdcb6e;">5 minutes</strong>
        </p>
      </div>

      <div style="background:rgba(255,118,117,0.1);border:1px solid rgba(255,118,117,0.2);border-radius:10px;padding:14px 16px;">
        <p style="color:#ff7675;font-size:13px;margin:0;line-height:1.5;">
          ⚠️ If you did not request this, your account may be compromised. Please secure your account immediately.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`,
      });

      if (error) {
        logger.error('Failed to send admin access email:', error);
        throw new Error(`Resend API error: ${error.message}`);
      }

      logger.info(`Admin access email sent to ${email} (id: ${data?.id})`);
    } catch (error) {
      logger.error('Failed to send admin access email:', error);
      throw error;
    }
  }
}

export default new EmailService();
