import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';
import { logger } from '../utils/logger';

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
}

export default new AuthController();
