import { Controller, Post, Get, Body, Param, ParseIntPipe, ParseEnumPipe } from '@nestjs/common';
import { ReadingsService } from './readings.service';
import type { ReadingType } from './readings.service';

@Controller('readings')
export class ReadingsController {
  constructor(private readonly readingsService: ReadingsService) { }

  @Post(':type/:deviceId')
  async addReading(
    @Param('type', new ParseEnumPipe(['temperature', 'ph', 'tds', 'gps', 'turbidity']))
    type: ReadingType,
    @Param('deviceId', ParseIntPipe) deviceId: number,
    @Body() body: { values: number[] | { [key: string]: number }; timestamp?: string; extra?: any },
  ) {
    return this.readingsService.addReading(
      deviceId,
      type,
      body.values,
      body.timestamp ? new Date(body.timestamp) : undefined,
      body.extra,
    );
  }

  @Get(':type/:deviceId')
  async getReadings(
    @Param('type') type: string,
    @Param('deviceId', ParseIntPipe) deviceId: number,
  ) {
    return this.readingsService.getReadings(deviceId, type as any);
  }
}
