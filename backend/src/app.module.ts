import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevicesModule } from './devices/devices.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReadingsModule } from './readings/readings.module';
import { MLModule } from './ml/ml.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DevicesModule,
    PrismaModule,
    ReadingsModule,
    MLModule, // 👈 add ML module here
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
