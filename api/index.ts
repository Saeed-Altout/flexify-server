import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);

    // Enable CORS for Vercel
    app.enableCors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'https://your-frontend-domain.vercel.app',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'X-API-Key',
      ],
      exposedHeaders: ['Set-Cookie'],
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Global prefix
    app.setGlobalPrefix('api/v1');

    await app.init();
  }
  return app;
}

export default async function handler(req: any, res: any) {
  const app = await bootstrap();
  const expressApp = app.getHttpAdapter().getInstance();

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-API-Key',
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
    return;
  }

  return expressApp(req, res);
}
