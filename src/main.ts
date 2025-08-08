import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS - Configure based on environment
  const isDevelopment = process.env.NODE_ENV !== 'production';

  if (isDevelopment) {
    // Development: Allow all origins
    app.enableCors({
      origin: true, // Allow all origins
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
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });
    console.log(`🌐 CORS enabled for all origins (development mode)`);
  } else {
    // Production: Use specific origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    app.enableCors({
      origin: allowedOrigins,
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
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });
    console.log(
      `🌐 CORS enabled for specific origins: ${allowedOrigins.join(', ')}`,
    );
  }

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
    .addCookieAuth('auth-token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'auth-token',
      description: 'HTTP-only cookie containing the authentication token',
    })
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

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Auth service is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/v1`);
  console.log(`📖 Swagger Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
