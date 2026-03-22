import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import './instrument';

const getReleaseVersion = () => {
  try {
    const packageJsonPath = resolve(
      __dirname,
      '..',
      '..',
      '..',
      'package.json',
    );
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
      version?: string;
    };

    return packageJson.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
};

const releaseVersion = getReleaseVersion();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Etnos')
    .setVersion(releaseVersion)
    .addBearerAuth()
    .build();

  app.enableCors();

  app.setGlobalPrefix('api');

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      responseInterceptor: (response: any) => {
        const obj = response?.obj;
        const rawBody = response?.data ?? response?.body;
        let body: any = obj;

        if (!body && typeof rawBody === 'string') {
          try {
            body = JSON.parse(rawBody);
          } catch {
            body = undefined;
          }
        }

        const token = body?.idToken;

        if (token && globalThis.window) {
          globalThis.window.localStorage.setItem('swagger_token', token);
        }

        return response;
      },
      requestInterceptor: (request: any) => {
        if (typeof globalThis.window) {
          return request;
        }
        const token = globalThis.window.localStorage.getItem('swagger_token');
        if (token) {
          request.headers = request.headers || {};
          request.headers.Authorization = `Bearer ${token}`;
        }
        return request;
      },
    },
  });

  const port = Number.parseInt(process.env.PORT) || 8080;

  app.listen(port, '0.0.0.0');
}
bootstrap(); // NOSONAR -- top-level await is not available in the current CommonJS NestJS bootstrap
