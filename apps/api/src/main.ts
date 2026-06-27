import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: config.get<string>('API_CORS_ORIGIN', 'http://localhost:5173'),
  });

  // Documentação interativa em /api/docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Daily Hub API')
    .setDescription('API da agenda pessoal centrada no dia.')
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get<number>('API_PORT', 3333);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Daily Hub API em http://localhost:${port}/api (docs em /api/docs)`);
}

void bootstrap();
