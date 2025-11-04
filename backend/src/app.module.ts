import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { ReadingsModule } from './readings/readings.module';
import { ConfigModule } from '@nestjs/config';
import { DevicesModule } from './devices/devices.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }),
    DevicesModule,
    PrismaModule,
    ReadingsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
