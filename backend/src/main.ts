import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {

  const isLocal = process.env.NODE_ENV === 'local';

  const httpsOptions = isLocal ? {
    key: fs.readFileSync('./src/cert/key.pem'),
    cert: fs.readFileSync('./src/cert/cert.pem'),
  } : undefined;

  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    { httpsOptions },
  );

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: [
      'https://localhost:5173',
      'https://localhost:5174',
      'https://minor.alecschmitz.com'
    ],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);


  const server = app.getHttpAdapter().getInstance();
  const router = server.router;

  const availableRoutes = router.stack
    .map(layer => {
      if (layer.route) {
        return {
          route: {
            path: layer.route.path,
            method: layer.route.stack[0].method,
          },
        };
      }
    })
    .filter((item): item is { route: { path: string; method: string } } => item !== undefined);

  console.log(availableRoutes);

}
bootstrap();
