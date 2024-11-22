import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('main');
  const app = await NestFactory.create(AppModule, new FastifyAdapter());
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  // Set up Swagger API docs
  const config = new DocumentBuilder()
    .setTitle('NestJS API') // API title
    .setDescription('The NestJS API description') // API description
    .setVersion('1.0')
    //.addBearerAuth()
    .addBearerAuth(
      {
        // copied from stack overflow
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
        description: 'Enter your Bearer token',
      },
      'access-token', // This name here is important for matching up with @ApiBearerAuth() in your controller!)
    )
    .addSecurityRequirements('bearer')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Swagger UI will be available at /api endpoint
  const port = process.env.PORT ?? 3000;
  logger.log(`app listening on port ${port}`);
  await app.listen(port, '0.0.0.0');
}
bootstrap();
