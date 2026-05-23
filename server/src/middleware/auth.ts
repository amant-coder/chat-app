import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../types';
import User from '../models/User';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      
      // Verify user still exists
      const user = await User.findById(decoded.userId);
      if (!user) {
        res.status(401).json({ error: 'User no longer exists.' });
        return;
      }

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
      };
      
      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        res.status(401).json({ error: 'Token expired. Please refresh your token.' });
        return;
      }
      res.status(401).json({ error: 'Invalid token.' });
    }
  } catch (error) {
    next(error);
  }
};

export const adminAuthenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload & { role?: string };
      
      if (decoded.role !== 'admin') {
        res.status(403).json({ error: 'Access denied. Admin token required.' });
        return;
      }

      // Verify user still exists
      const user = await User.findById(decoded.userId);
      if (!user) {
        res.status(401).json({ error: 'User no longer exists.' });
        return;
      }

      req.user = {
        userId: decoded.userId,
        email: decoded.email,
      };
      
      next();
    } catch (jwtError) {
      if (jwtError instanceof jwt.TokenExpiredError) {
        res.status(401).json({ error: 'Token expired. Please login again.' });
        return;
      }
      res.status(401).json({ error: 'Invalid token.' });
    }
  } catch (error) {
    next(error);
  }
};
