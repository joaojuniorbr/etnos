import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Etnos')
    .setVersion('0.0.1')
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

        if (token && typeof window !== 'undefined') {
          window.localStorage.setItem('swagger_token', token);
        }

        return response;
      },
      requestInterceptor: (request: any) => {
        if (typeof window === 'undefined') return request;
        const token = window.localStorage.getItem('swagger_token');
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
bootstrap();
