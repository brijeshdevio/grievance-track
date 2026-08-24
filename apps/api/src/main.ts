import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import { AppModule } from '@/app.module';
import { env } from '@/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log'],
  });

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );

  app.use(cookieParser());

  // Global pipes
  app.useGlobalPipes(new ZodValidationPipe());

  // CORS
  app.enableCors({
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  if (env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Grievance Track')
      .setDescription('Grievance Track API')
      .setVersion('1.0.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
      },
    });
  }

  const port = Number(env.PORT || 3000);
  const host = '0.0.0.0';

  await app.listen(port, host);

  logger.log(`🚀 Application running on: http://${host}:${port}`);
  logger.log(`📚 Swagger documentation: http://${host}:${port}/api/docs`);
  logger.log(`🌍 Environment: ${env.NODE_ENV}`);
}

bootstrap().catch((error) => {
  console.error('Error starting application:', error);
});
