import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Request, Response } from 'express';
import { INestApplication } from '@nestjs/common';

let app: INestApplication | null = null;

async function bootstrap(): Promise<INestApplication> {
  if (!app) {
    app = await NestFactory.create(AppModule);

    // Enable CORS globally for all domains
    app.enableCors({
      origin: true, // Allow all origins
      credentials: true, // Allow credentials (authorization headers)
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'X-API-Key',
        'X-Forwarded-For',
        'X-Forwarded-Proto',
        'X-Forwarded-Host',
      ],
      exposedHeaders: [
        'Authorization',
        'X-Total-Count',
        'Access-Control-Allow-Credentials',
        'Access-Control-Allow-Origin',
      ],
      preflightContinue: false,
      optionsSuccessStatus: 204,
      maxAge: 86400, // Cache preflight response for 24 hours
    });

    console.log(`🌐 CORS enabled globally for all origins`);
    console.log(`🔒 Credentials enabled for cross-origin requests`);
    console.log(
      `📋 All HTTP methods allowed: GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD`,
    );

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

    // Swagger documentation setup
    const config = new DocumentBuilder()
      .setTitle('Flexify Auth Service API')
      .setDescription(
        'A comprehensive authentication service built with NestJS and Supabase. This API provides user registration, login, logout, and session management functionality.',
      )
      .setVersion('1.0.0')
      .addTag('auth', 'Authentication endpoints')
      .addTag('health', 'Health check endpoints')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list',
        filter: true,
        showRequestDuration: true,
      },
      customSiteTitle: 'Flexify Auth Service API Documentation',
    });

    // Only listen on port if not in Vercel environment
    if (!process.env.VERCEL) {
      const port = process.env.PORT || 3000;
      await app.listen(port);
      console.log(`🚀 Auth service is running on: http://localhost:${port}`);
      console.log(`📚 API Documentation: http://localhost:${port}/api/v1`);
      console.log(
        `📖 Swagger Documentation: http://localhost:${port}/api/docs`,
      );
    }

    await app.init();
  }
  return app;
}

// Default export for Vercel serverless function
export default async function handler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const app = await bootstrap();
    const expressApp = app.getHttpAdapter().getInstance();

    // Enhanced CORS headers for serverless environment
    const origin = req.headers.origin;

    // Set CORS headers for all requests
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, X-API-Key, X-Forwarded-For, X-Forwarded-Proto, X-Forwarded-Host',
    );
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader(
      'Access-Control-Expose-Headers',
      'Authorization, X-Total-Count',
    );

    // Debug logging for serverless environment
    console.log('🚀 Vercel handler - CORS headers set:', {
      origin: origin || '*',
      credentials: 'true',
      methods: 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
    });

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return expressApp(req, res);
  } catch (error) {
    console.error('❌ Handler error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const isDevelopment = process.env.NODE_ENV === 'development';

    res.status(500).json({
      error: 'Internal Server Error',
      message: isDevelopment ? errorMessage : 'Something went wrong',
      ...(isDevelopment && {
        stack: error instanceof Error ? error.stack : undefined,
      }),
    });
  }
}

// For local development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  bootstrap().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
  });
}
