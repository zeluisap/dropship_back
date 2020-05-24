import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const MongoStore = require('connect-mongo')(session);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.use(
    session({
      store: new MongoStore({ url: configService.get('MONGODB_URI_SESSION') }),
      secret: 'CHANGEME',
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  await app.listen(configService.get('PORT') || 3000);
}
bootstrap();
