import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Headers injected by legitimate cloud infrastructure (Render, Vercel, Heroku, AWS, etc.)
 * These must NOT be blocked — they are set by the hosting platform, not by user proxies.
 */
const INFRASTRUCTURE_HEADERS = new Set([
  'x-forwarded-for',
  'x-forwarded-proto',
  'x-forwarded-host',
  'x-forwarded-port',
  'x-forwarded-server',
  'forwarded',
]);

/**
 * Headers that are genuine user-level proxy/VPN indicators.
 * Legitimate cloud infrastructure never sets these.
 */
const USER_PROXY_HEADERS = [
  'via',             // Added by HTTP proxies (Squid, etc.)
  'proxy-connection',// Non-standard header set by proxy clients
  'x-proxy-id',      // Used by some VPN/proxy services
  'x-bluecoat-via',  // BlueCoat proxy
  'x-forwarded-by',  // Some proxy servers add this (distinct from x-forwarded-for)
];

/**
 * Middleware to detect and block requests coming from user-controlled
 * proxies or VPNs. Infrastructure reverse-proxy headers (set by Render,
 * Heroku, Vercel, etc.) are whitelisted so legitimate hosted traffic is
 * never blocked.
 */
export const antiProxy = (req: Request, res: Response, next: NextFunction) => {
  for (const header of USER_PROXY_HEADERS) {
    if (req.headers[header]) {
      logger.warn(
        `Blocked proxy request. Detected user-proxy header: ${header} | IP: ${req.ip}`
      );
      return res.status(403).json({
        status: 'error',
        message:
          'Proxy/VPN usage is not allowed for security reasons. Please disable it and try again.',
      });
    }
  }

  // Log if infrastructure headers are present (for debugging), but never block them
  for (const header of INFRASTRUCTURE_HEADERS) {
    if (req.headers[header]) {
      logger.debug(`Infrastructure header present (allowed): ${header}`);
    }
  }

  next();
};
