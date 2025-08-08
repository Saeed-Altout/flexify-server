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
}
