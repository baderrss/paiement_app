import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; 
import helmet from 'helmet';
import { ThrottlerExceptionFilter } from './common/filters/throttler-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }));

  // Apply Middlewares
  app.use(helmet());

  app.enableCors({
    origin: process.env.CLIENT_DOMAIN, // 'http://localhost:5173' React Vite default port
    credentials: true, 
  });

  const swagger = new DocumentBuilder()
  .setTitle("Nest JS App")
  .setDescription("APIs description")
  .addServer("http://localhost:3000")
  .setTermsOfService("http://localhost:3000/terms-of-service")
  .setLicense("MIT License", "http://localhost:3000/license")
  .setVersion("1.0")
  .build();
  const documentation = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup("swagger", app, documentation); // http://localhost:3000/swagger


  app.useGlobalFilters(new ThrottlerExceptionFilter());

  await app.listen(Number(process.env.PORT));
}
bootstrap();
