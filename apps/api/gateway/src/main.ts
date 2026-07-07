import 'reflect-metadata';

import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { BRAND } from '@certisphere/design-system/branding';

import { AppModule } from './modules/app.module.js';

const DEFAULT_API_PORT = 3001;

function resolvePort(value: string | undefined): number {
  if (value === undefined || value.trim() === '') {
    return DEFAULT_API_PORT;
  }

  const parsedPort = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65_535) {
    throw new Error('API_PORT must be an integer between 1 and 65535.');
  }

  return parsedPort;
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.enableShutdownHooks();
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  const openApiConfig = new DocumentBuilder()
    .setTitle(BRAND.applications.api)
    .setDescription(`${BRAND.tagline} API gateway for ${BRAND.legalName}.`)
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, openApiConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = resolvePort(process.env.API_PORT);
  await app.listen(port);

  Logger.log(`${BRAND.applications.api} listening on port ${String(port)}`, 'Bootstrap');
}

await bootstrap();
