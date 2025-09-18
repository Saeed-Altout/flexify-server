import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { CustomAuthService } from '../../supabase/custom-auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private customAuthService: CustomAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const user = await this.customAuthService.verifySession(token);
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      // Attach user to request object
      request['user'] = user;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    // First try to get from cookie (preferred for session-based auth)
    const cookieToken = request.cookies?.session_token;
    if (cookieToken) {
      return cookieToken;
    }

    // Fallback to Authorization header for backward compatibility
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
