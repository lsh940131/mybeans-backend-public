import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ErrorPayload } from './common/payload/error.payload';
import { ValidationError } from 'class-validator';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.getHttpAdapter().getInstance().set('etag', false);
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  // print all env
  // for (const key in process.env) {
  //   console.log(`${key} : ${process.env[key]}`);
  // }

  // allow cors
  // TODO: 배포 환경에서의 origin, credentials, allowedHeaders, methods 등 설정
  app.enableCors();

  // use cookie parser
  app.use(cookieParser());

  // validate
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
      exceptionFactory: (validationErrors: ValidationError[]) => {
        const messages = extractValidationMessages(validationErrors);
        return messages.length > 0
          ? new ErrorPayload(messages.join('\n'))
          : new BadRequestException(validationErrors);

        // class-validator의 validate method의 message 파라미터를 이용해 정의한 validate error message를 재귀적으로 찾아 반환하는 함수
        function extractValidationMessages(errors: ValidationError[]): string[] {
          const messages: Set<string> = new Set();

          function traverse(errorList: ValidationError[]) {
            for (const error of errorList) {
              if (error.constraints) {
                Object.values(error.constraints).forEach((msg) => messages.add(msg));
              }
              if (error?.children && error?.children.length > 0) {
                traverse(error.children);
              }
            }
          }

          traverse(errors);
          return Array.from(messages);
        }
      },
    }),
  );

  // swagger
  setupSwagger(app);

  const env = process.env.ENV;
  const port = process.env.SERVER_PORT;
  await app.listen(port, '0.0.0.0');

  console.log('\n' + '='.repeat(40));
  console.log(`🚀 Server started`);
  console.log(`🌐 ENV  : ${env}`);
  console.log(`🔌 PORT : ${port}`);
  console.log('='.repeat(40) + '\n');
}
bootstrap();
