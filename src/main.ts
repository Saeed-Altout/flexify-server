import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Request, Response } from 'express';
import { INestApplication } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

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

    // Global error filter for standardized error envelopes
    app.useGlobalFilters(new HttpExceptionFilter());

    // Cookie parser middleware for session management
    app.use(cookieParser());

    // Global prefix
    app.setGlobalPrefix('api/v1');

    // Swagger Documentation Setup
    const config = new DocumentBuilder()
      .setTitle('Flexify Server API')
      .setDescription(
        'Flexify Backend API - A comprehensive platform for project management, user authentication, and portfolio management. Built with NestJS, Supabase, and TypeScript.',
      )
      .setVersion('2.0.0')
      .setContact(
        'Flexify Team',
        'https://flexify-server.vercel.app',
        'support@flexify.com',
      )
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .addTag('auth', 'Authentication and user management endpoints')
      .addTag('projects', 'Project management and portfolio endpoints')
      .addTag('technologies', 'Technology stack management endpoints')
      .addTag('messages', 'Message management and communication endpoints')
      .addTag('health', 'Server health and status monitoring')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description:
            'Enter JWT token (or use session cookie for better security)',
          in: 'header',
        },
        'JWT-auth',
      )
      .addCookieAuth('session_token', {
        type: 'apiKey',
        in: 'cookie',
        name: 'session_token',
        description:
          'HTTP-only session cookie (automatically set on login/signup) - Recommended for web applications',
      })
      .addServer('http://localhost:3000', 'Development server')
      .addServer('https://flexify-server.vercel.app', 'Production server')
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-API-Key',
          in: 'header',
        },
        'API-Key',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'list',
        filter: true,
        showRequestHeaders: true,
        showCommonExtensions: true,
        tryItOutEnabled: true,
        requestSnippetsEnabled: true,
        syntaxHighlight: {
          activate: true,
          theme: 'agate',
        },
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
        displayOperationId: false,
        showExtensions: true,
        deepLinking: true,
        layout: 'StandaloneLayout',
        validatorUrl: null,
      },
      customSiteTitle: 'Flexify Server API Documentation',
      customfavIcon: '/favicon.ico',
      customCss: `
        .swagger-ui .topbar { 
          display: none; 
        }
        .swagger-ui .info .title { 
          color: #2563eb; 
          font-size: 2.5rem;
          font-weight: 700;
        }
        .swagger-ui .info .description {
          font-size: 1.1rem;
          line-height: 1.6;
          color: #4a5568;
        }
        .swagger-ui .scheme-container { 
          background: #f8fafc; 
          padding: 20px; 
          border-radius: 8px; 
          border: 1px solid #e2e8f0;
        }
        .swagger-ui .opblock.opblock-post {
          border-color: #0066cc;
        }
        .swagger-ui .opblock.opblock-get {
          border-color: #00cc66;
        }
        .swagger-ui .opblock.opblock-put {
          border-color: #ff9900;
        }
        .swagger-ui .opblock.opblock-delete {
          border-color: #ff4444;
        }
        .swagger-ui .btn.authorize {
          background-color: #2563eb;
          border-color: #2563eb;
        }
        .swagger-ui .btn.authorize:hover {
          background-color: #1d4ed8;
          border-color: #1d4ed8;
        }
        .swagger-ui .btn.execute {
          background-color: #059669;
          border-color: #059669;
        }
        .swagger-ui .btn.execute:hover {
          background-color: #047857;
          border-color: #047857;
        }
        .swagger-ui .response-col_status {
          font-weight: 600;
        }
        .swagger-ui .response-col_description__inner {
          font-size: 0.9rem;
        }
        .swagger-ui .model-title {
          color: #2d3748;
        }
        .swagger-ui .model .property {
          color: #4a5568;
        }
        .swagger-ui .parameter__name {
          font-weight: 600;
          color: #2d3748;
        }
        .swagger-ui .parameter__type {
          color: #0066cc;
          font-weight: 500;
        }
        .swagger-ui .opblock-summary {
          border-radius: 6px;
        }
        .swagger-ui .opblock {
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `,
    });

    console.log(
      `📚 Swagger documentation available at: http://localhost:${process.env.PORT || 3000}/api/docs`,
    );
    console.log(
      `🌐 Production Swagger documentation: https://flexify-server.vercel.app/api/docs`,
    );

    // Only listen on port if not in Vercel environment
    if (!process.env.VERCEL) {
      const port = process.env.PORT || 3000;
      await app.listen(port);
      console.log(`🚀 Flexify API is running on: http://localhost:${port}`);
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
