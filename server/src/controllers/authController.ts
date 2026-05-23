import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { createClerkClient, verifyToken } from '@clerk/backend';
import User from '../models/User';
import Message from '../models/Message';
import Conversation from '../models/Conversation';

const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY });

class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, email, password, publicKey, encryptedPrivateKey, keySalt } = req.body;
      const result = await authService.register(username, email, password, publicKey, encryptedPrivateKey, keySalt);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async socialLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, username, publicKey, encryptedPrivateKey, keySalt, backupPin } = req.body;
      if (!email || !username) {
        res.status(400).json({ error: 'Email and username are required for social login.' });
        return;
      }
      const result = await authService.socialLogin(email, username, publicKey, encryptedPrivateKey, keySalt, backupPin);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async clerkLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // The client sends the Clerk session token (getToken()) in the Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Clerk token required.' });
        return;
      }
      const clerkToken = authHeader.split(' ')[1];

      // Verify token with Clerk and get the Clerk user id
      let sessionClaims;
      try {
        sessionClaims = await verifyToken(clerkToken, {
          secretKey: env.CLERK_SECRET_KEY,
          clockSkewInMs: 30000, // 30 seconds clock skew tolerance for local development
        });
      } catch (err) {
        logger.error(`Clerk token verification failed. Error: ${err}`);
        res.status(401).json({ error: 'Invalid Clerk token.', details: err });
        return;
      }

      if (!sessionClaims || !sessionClaims.sub) {
        res.status(401).json({ error: 'Invalid Clerk token: Missing sub claim.' });
        return;
      }
      const clerkUserId = sessionClaims.sub;

      // Fetch the full Clerk user object so we have name/email
      const clerkUser = await clerkClient.users.getUser(clerkUserId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      if (!email) {
        res.status(400).json({ error: 'No email associated with this account.' });
        return;
      }

      // Check if this user was previously registered but has been deleted
      const mongoUserId = clerkUser.publicMetadata?.mongoUserId as string | undefined;
      if (mongoUserId) {
        const dbUserExists = await User.findById(mongoUserId);
        if (!dbUserExists) {
          logger.warn(`Clerk login denied: User ${email} (Clerk ID: ${clerkUserId}, Mongo ID: ${mongoUserId}) has been deleted from the database.`);
          res.status(403).json({ 
            error: 'This account has been deleted by an administrator.', 
            code: 'ACCOUNT_DELETED' 
          });
          return;
        }
      }

      // Build a username from the Clerk profile
      const username =
        clerkUser.username ||
        (clerkUser.firstName
          ? `${clerkUser.firstName}${clerkUser.lastName ? '_' + clerkUser.lastName : ''}`.toLowerCase().replace(/\s+/g, '_')
          : email.split('@')[0]);

      const avatar = clerkUser.imageUrl || '';

      const fullName = clerkUser.firstName
        ? `${clerkUser.firstName}${clerkUser.lastName ? ' ' + clerkUser.lastName : ''}`.trim()
        : '';

      let authProvider = 'clerk';
      if (clerkUser.externalAccounts && clerkUser.externalAccounts.length > 0) {
        const extProvider = clerkUser.externalAccounts[0].provider;
        if (extProvider.includes('google')) {
          authProvider = 'google';
        } else if (extProvider.includes('github')) {
          authProvider = 'github';
        } else {
          authProvider = extProvider;
        }
      }

      // Extract optional E2EE fields from request body (sent by the PIN setup flow)
      const { publicKey, encryptedPrivateKey, keySalt, backupPin } = req.body;

      const result = await authService.socialLogin(
        email,
        username,
        publicKey,
        encryptedPrivateKey,
        keySalt,
        backupPin,
        avatar,
        fullName,
        authProvider,
        clerkUserId
      );

      // Link the MongoDB user ID back to Clerk metadata if not already done
      if (result.user && !mongoUserId) {
        try {
          await clerkClient.users.updateUserMetadata(clerkUserId, {
            publicMetadata: {
              mongoUserId: result.user._id.toString()
            }
          });
          logger.info(`Linked Clerk user ${clerkUserId} to MongoDB user ${result.user._id}`);
        } catch (metaError) {
          logger.error(`Failed to update Clerk metadata for ${clerkUserId}: ${metaError}`);
        }
      }

      logger.info(`Clerk login: ${email}`);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token is required.' });
        return;
      }
      const tokens = await authService.refreshToken(refreshToken);
      res.status(200).json(tokens);
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: 'Email is required.' });
        return;
      }
      const result = await authService.forgotPassword(email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) {
        res.status(400).json({ error: 'Email, OTP code, and new password are required.' });
        return;
      }
      if (newPassword.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters.' });
        return;
      }
      const result = await authService.resetPassword(email, otp, newPassword);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getProfile(req.user!.userId);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string' || q.trim().length < 2) {
        res.status(400).json({ error: 'Search query must be at least 2 characters.' });
        return;
      }
      const users = await authService.searchUsers(q, req.user!.userId);
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bio, statusMessage, avatar } = req.body;
      const user = await authService.updateProfile(req.user!.userId, { bio, statusMessage, avatar });
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async requestAdminAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, secretCode } = req.body;
      if (!email || !password || !secretCode) {
        res.status(400).json({ error: 'Email, password, and secret code are required.' });
        return;
      }

      // The master secret code required to even request an OTP
      if (secretCode !== env.ADMIN_SECRET_CODE) {
        res.status(401).json({ error: 'Invalid secret code. Access denied.' });
        return;
      }

      const result = await authService.requestAdminAccess(email, password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyAdminAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        res.status(400).json({ error: 'Email and OTP are required.' });
        return;
      }
      const result = await authService.verifyAdminAccess(email, otp);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // The adminAuthenticate middleware already ensures they have the admin token
      const users = await authService.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({ error: 'User ID is required.' });
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }

      // Delete all messages sent by this user
      await Message.deleteMany({ sender: userId });

      // Remove user from conversations they participate in
      // For direct conversations with only this user left, delete the conversation entirely
      const conversations = await Conversation.find({ participants: userId });
      for (const conv of conversations) {
        if (conv.type === 'direct') {
          // Delete the direct conversation and all its messages
          await Message.deleteMany({ conversation: conv._id });
          await Conversation.findByIdAndDelete(conv._id);
        } else {
          // For group conversations, just remove the user from participants and admins
          await Conversation.findByIdAndUpdate(conv._id, {
            $pull: { participants: userId, admins: userId },
          });
        }
      }

      // Delete user from Clerk if they have a clerkUserId
      if (user.clerkUserId) {
        try {
          await clerkClient.users.deleteUser(user.clerkUserId);
          logger.info(`Deleted Clerk user: ${user.clerkUserId} for ${user.email}`);
        } catch (clerkError) {
          logger.error(`Failed to delete Clerk user ${user.clerkUserId}: ${clerkError}`);
        }
      }

      // Delete the user
      await User.findByIdAndDelete(userId);

      logger.info(`Admin deleted user: ${user.email} (${userId})`);
      res.status(200).json({ message: `User "${user.username}" has been deleted successfully.` });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
