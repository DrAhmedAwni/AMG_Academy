import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { SanitizationPipe } from './common/pipes/sanitization.pipe';
import { PrismaService } from './modules/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const prisma = app.get(PrismaService);
  const apiPrefix = config.get<string>('app.apiPrefix', 'api/v1');
  const frontendUrl = config.get<string>('app.frontendUrl', 'http://localhost:3000');

  app.use(cookieParser());
  app.setGlobalPrefix(apiPrefix);
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });
  app.useGlobalPipes(
    new SanitizationPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('AMG Academy API')
    .setDescription('Operational API documentation for AMG Academy Platform V1')
    .setVersion('1.0.0')
    .addCookieAuth('access_token')
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await prisma.enableShutdownHooks(app);
  await app.listen(config.get<number>('app.port', 4000));
}

void bootstrap();
