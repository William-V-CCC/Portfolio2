import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { json } from 'express';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(json());

  // ------------------- SWAGGER CONFIG -------------------
  const config = new DocumentBuilder()
    .setTitle('Portfolio API')
    .setDescription('API for managing portfolio projects')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: true,
  });

  // Serve Swagger JSON publicly
  app.getHttpAdapter()?.get('/api-docs-json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(document);
  });

  // Swagger UI setup with dynamic host
  SwaggerModule.setup('/api-docs', app, document, {
    customSiteTitle: 'Portfolio API Docs',
    swaggerOptions: {
      url: `${reqProtocol()}://${reqHost()}/api-docs-json`,
      persistAuthorization: true,
    },
    customCssUrl: 'https://unpkg.com/swagger-ui-dist/swagger-ui.css',
    customJs: [
      'https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js',
      'https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js',
    ],
  });

  // ------------------- END SWAGGER CONFIG -------------------
  // ------------------- START SERVER -------------------
  const port = process.env.PORT || 3050;
  await app.listen(port, '0.0.0.0');

  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
  console.log(`Swagger JSON at http://localhost:${port}/api-docs-json`);
}

function reqProtocol() {
  return process.env.NODE_ENV === 'production' ? 'https' : 'http';
}

function reqHost() {
  return process.env.HOST || 'localhost:3050';
}

bootstrap();