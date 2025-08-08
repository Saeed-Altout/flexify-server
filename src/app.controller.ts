import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('cors-test')
  testCors(@Res() res: Response): void {
    // This endpoint specifically tests CORS functionality
    res.status(HttpStatus.OK).json({
      message: 'CORS test successful',
      timestamp: new Date().toISOString(),
      cors: {
        origin: res.getHeader('Access-Control-Allow-Origin'),
        credentials: res.getHeader('Access-Control-Allow-Credentials'),
        methods: res.getHeader('Access-Control-Allow-Methods'),
        headers: res.getHeader('Access-Control-Allow-Headers'),
      },
    });
  }

  @Get('test-cookie')
  testCookie(@Res() res: Response) {
    // Test basic cookie functionality
    const cookieOptions = {
      httpOnly: false,
      secure: false, // Allow HTTP in development
      sameSite: 'none' as const,
      maxAge: 60 * 60 * 1000, // 1 hour
      path: '/',
    };

    // Set a simple test cookie
    res.cookie('simple-test', 'hello-world', cookieOptions);

    return res.json({
      message: 'Test cookie set',
      timestamp: new Date().toISOString(),
      cookieOptions,
      note: 'Check browser dev tools > Application > Cookies to see if cookie is set',
    });
  }
}
