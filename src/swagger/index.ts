import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as expressBasicAuth from 'express-basic-auth';
import { readFileSync } from 'fs';
import * as path from 'path';

/**
 * Swagger 세팅
 * @param {INestApplication} app
 */
export function setupSwagger(app: INestApplication): void {
  const swaggerRouter: string = '/api/docs';
  const swaggerId: string = 'root';
  const swaggerPass: string = 'admin';

  app.use(
    [swaggerRouter],
    expressBasicAuth({ challenge: true, users: { [swaggerId]: swaggerPass } }),
  );
  const descriptionFullPath = path.join(process.cwd(), 'src', 'swagger', 'description.md');
  const description: string = readFileSync(descriptionFullPath, 'utf-8');
  const config = new DocumentBuilder()
    .setTitle('API Document')
    .setDescription(description)
    .setVersion('0.1')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Token',
        description: '로그인 시 발급받은 token을 넣어줍니다',
      },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerRouter, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
