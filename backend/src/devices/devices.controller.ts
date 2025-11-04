import { Controller, Get, Param, Query } from '@nestjs/common';
import { DevicesService } from './devices.service';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get()
  getAll(
    @Query('includeReadings') includeReadings?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const includeAllReadings = includeReadings === 'true';
    const includeCount =
      !includeAllReadings && includeReadings && !isNaN(Number(includeReadings))
        ? parseInt(includeReadings, 10)
        : undefined;

    return this.devicesService.getAllDevices({
      includeCount,
      includeAllReadings,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get(':id')
  getById(
    @Param('id') id: string,
    @Query('includeReadings') includeReadings?: string,
  ) {
    return this.devicesService.getDeviceById(Number(id), includeReadings);
  }

  @Get('search/:name')
  searchByName(@Param('name') name: string) {
    return this.devicesService.searchDevicesByName(name);
  }
}
