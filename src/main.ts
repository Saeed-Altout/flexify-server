import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with credentials support for SameSite=None
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173', // Vite default
      'http://localhost:8080', // Common dev port
      'https://localhost:3000', // HTTPS for SameSite=None
      'https://localhost:3001',
      'https://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-API-Key',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200,
    preflightContinue: false,
  });

  // Allow all HTTP methods
  console.log(
    '📋 All HTTP methods allowed: GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
  );
  console.log(
    '🍪 Cookie settings: SameSite=None; Secure=true (requires HTTPS for proper functionality)',
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Cookie parser middleware
  app.use(cookieParser());

  // Debug middleware for cookies (development only)
  if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
      if (req.path.includes('/auth/')) {
        console.log('🍪 Cookies received:', req.cookies);
        console.log('🌐 Origin:', req.headers.origin);
        console.log('🔗 Referer:', req.headers.referer);
        console.log('📱 User-Agent:', req.headers['user-agent']);
        console.log('🔒 Secure:', req.secure);
        console.log('🌍 Host:', req.headers.host);
      }
      next();
    });
  }

  // Global API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Flexify Server API')
    .setDescription(
      'A comprehensive microservices API for portfolio management',
    )
    .setVersion('1.0.0')
    .addTag('auth', 'Authentication and user management')
    .addTag('technologies', 'Technology stack management')
    .addTag('projects', 'Project portfolio management')
    .addTag('messages', 'Contact messages and communication')
    .addTag('health', 'System health and monitoring')
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
    .addCookieAuth('NEXT_CWS_TOKEN', {
      type: 'apiKey',
      in: 'cookie',
      name: 'NEXT_CWS_TOKEN',
      description:
        'HTTP-only access token cookie with NEXT_CWS_ prefix (automatically set on login/signup) - Recommended for web applications',
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

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Flexify API is running on: http://localhost:${port}`);
}

bootstrap();
