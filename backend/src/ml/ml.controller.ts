import { Controller, Get, Query } from '@nestjs/common';
import { MLService } from './ml.service';

@Controller('ml')
export class MLController {
  constructor(private readonly mlService: MLService) {}
  @Get('forecast')
  async getForecast(@Query('limit') limit?: string) {
    const n = limit ? parseInt(limit, 10) : 30;
    return this.mlService.getHyacinthForecast(n);
  }
}
