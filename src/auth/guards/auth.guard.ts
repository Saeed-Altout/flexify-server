import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from '../auth.service';
import { User } from '../types/auth.types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const user = await this.authService.validateToken(token);
      if (!user) {
        // Session expired or invalid, clear cookies
        this.clearAuthCookies(response);
        throw new UnauthorizedException('Session expired or invalid');
      }

      // Attach user to request object
      request['user'] = user;
      return true;
    } catch (error) {
      // Clear cookies on any error
      this.clearAuthCookies(response);
      throw new UnauthorizedException('Session expired or invalid');
    }
  }

  private extractTokenFromRequest(request: Request): string | undefined {
    // First try to get from cookie (preferred for session-based auth)
    const cookieToken = request.cookies?.access_token;
    if (cookieToken) {
      return cookieToken;
    }

    // Fallback to Authorization header for backward compatibility
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private clearAuthCookies(response: Response): void {
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
    });
  }
}
