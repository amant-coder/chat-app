import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User, { IUserDocument } from '../models/User';
import { env } from '../config/env';
import { JwtPayload } from '../types';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import emailService from './emailService';

class AuthService {
  generateAccessToken(user: IUserDocument): string {
    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
    };
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      algorithm: 'HS256',
    });
  }

  generateRefreshToken(user: IUserDocument): string {
    const payload: JwtPayload = {
      userId: user._id.toString(),
      email: user.email,
    };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
      algorithm: 'HS256',
    });
  }

  async register(username: string, email: string, password: string, publicKey?: string, encryptedPrivateKey?: string, keySalt?: string) {
    // Check existing
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new AppError('Email already registered.', 409);
      }
      throw new AppError('Username already taken.', 409);
    }

    const user = await User.create({ username, email, password, publicKey, encryptedPrivateKey, keySalt });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    logger.info(`User registered: ${user.email}`);

    // Send welcome email (fire-and-forget — don't block registration)
    emailService.sendWelcomeEmail(email, username);

    return {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        status: user.status,
        bio: user.bio,
        statusMessage: user.statusMessage,
        publicKey: user.publicKey,
        encryptedPrivateKey: user.encryptedPrivateKey,
        keySalt: user.keySalt,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email }).select('+password +encryptedPrivateKey +keySalt');

    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Update status
    user.status = 'online';
    await user.save();

    logger.info(`User logged in: ${user.email}`);

    return {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        status: user.status,
        bio: user.bio,
        statusMessage: user.statusMessage,
        publicKey: user.publicKey,
        encryptedPrivateKey: user.encryptedPrivateKey,
        keySalt: user.keySalt,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
      const user = await User.findById(decoded.userId);

      if (!user) {
        throw new AppError('User not found.', 404);
      }

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return { accessToken, refreshToken };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Refresh token expired. Please login again.', 401);
      }
      throw new AppError('Invalid refresh token.', 401);
    }
  }

  async forgotPassword(email: string) {
    // Always return generic message to prevent email enumeration
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether the email exists
      return { message: 'If this email is registered, you will receive a reset code shortly.' };
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Hash the OTP before storing
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // Store hashed OTP with 10-minute expiry
    user.set('passwordResetOTP', hashedOtp);
    user.set('passwordResetExpires', new Date(Date.now() + 10 * 60 * 1000));
    await user.save({ validateModifiedOnly: true });

    // Send email with plain OTP
    await emailService.sendPasswordResetEmail(email, user.username, otp);

    logger.info(`Password reset OTP sent to ${email}`);

    return { message: 'If this email is registered, you will receive a reset code shortly.' };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await User.findOne({ email })
      .select('+passwordResetOTP +passwordResetExpires');

    if (!user || !user.get('passwordResetOTP') || !user.get('passwordResetExpires')) {
      throw new AppError('Invalid or expired reset code.', 400);
    }

    // Check expiry
    const expires = user.get('passwordResetExpires') as Date;
    if (new Date() > expires) {
      // Clear expired OTP
      user.set('passwordResetOTP', undefined);
      user.set('passwordResetExpires', undefined);
      await user.save({ validateModifiedOnly: true });
      throw new AppError('Reset code has expired. Please request a new one.', 400);
    }

    // Verify OTP
    const storedHash = user.get('passwordResetOTP') as string;
    const isValid = await bcrypt.compare(otp, storedHash);
    if (!isValid) {
      throw new AppError('Invalid reset code.', 400);
    }

    // Update password and clear OTP fields
    user.password = newPassword;
    user.set('passwordResetOTP', undefined);
    user.set('passwordResetExpires', undefined);
    await user.save(); // This triggers the pre-save hook to hash the new password

    logger.info(`Password reset successful for ${email}`);

    return { message: 'Password reset successfully. You can now log in with your new password.' };
  }

  async getProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user;
  }

  async searchUsers(query: string, currentUserId: string) {
    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    })
      .select('username email avatar status lastSeen publicKey')
      .limit(20);

    return users;
  }

  async updateProfile(userId: string, data: { bio?: string; statusMessage?: string; avatar?: string }) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user;
  }
}

export default new AuthService();
