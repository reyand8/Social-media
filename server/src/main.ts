import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';

/**
 * Initializes and starts the NestJS application.
 *
 * Sets global API prefix, enables CORS, and adds shutdown hooks.
 * The server listens on the port specified in the environment variable
 * or defaults to 8080.
 */
async function bootstrap(): Promise<void> {
  const PORT: string | 8080 = process.env.API_PORT || 8080;

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.enableShutdownHooks()

  app.use(bodyParser.json({ limit: '5mb' }));  // Увеличьте limit до необходимого размера
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

  await app.listen(PORT, (): void => {
    Logger.log(`http://localhost:${PORT}`, `Server starts on host`);
  });
}

bootstrap();