import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware to detect and block requests coming through proxies or VPNs
 * by checking common proxy-related headers.
 */
export const antiProxy = (req: Request, res: Response, next: NextFunction) => {
  const proxyHeaders = [
    'x-forwarded-for',
    'x-forwarded-host',
    'x-forwarded-proto',
    'x-forwarded-server',
    'x-forwarded-port',
    'forwarded',
    'via',
    'proxy-connection',
    'x-proxy-id',
    'client-ip',
    'x-real-ip',
    'true-client-ip'
  ];

  for (const header of proxyHeaders) {
    if (req.headers[header]) {
      logger.warn(`Blocked proxy request. Detected header: ${header}`);
      return res.status(403).json({
        status: 'error',
        message: 'Proxy/VPN usage is not allowed for security reasons. Please disable it and try again.'
      });
    }
  }

  next();
};
