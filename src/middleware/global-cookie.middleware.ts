import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

@Injectable()
export class GlobalCookieMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Set global cookie headers for all responses
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Ensure cookies are accessible to frontend JavaScript
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Log cookie information for debugging
    if (req.headers.cookie) {
      console.log('🍪 Request cookies:', {
        total: req.headers.cookie.split(';').length,
        cookies: req.headers.cookie.split(';').map(c => c.trim()),
        userAgent: req.headers['user-agent'],
        origin: req.headers.origin,
        host: req.headers.host,
      });
    }

    next();
  }
}
