import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Portfolio API')
    .setDescription('API for managing portfolio projects')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();


  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: true,
  });


  app.use('/api-docs-json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(document);
  });

  // 👇 your fancy UI config
  SwaggerModule.setup('/api-docs', app, document, {
    customSiteTitle: 'Portfolio API Docs',
    swaggerOptions: {
      url: '/api-docs-json',
      persistAuthorization: true, // keeps token after refresh
    },
    customCssUrl: 'https://unpkg.com/swagger-ui-dist/swagger-ui.css',
    customJs: [
      'https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js',
      'https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js',
    ],
  });

const port = process.env.PORT || 3050;
await app.listen(port, '0.0.0.0');

  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
  console.log(`Swagger JSON at http://localhost:${port}/api-docs-json`);
}

bootstrap();