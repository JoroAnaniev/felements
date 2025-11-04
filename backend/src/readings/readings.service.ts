import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type ReadingType =
  | 'temperature'
  | 'ph'
  | 'tds'
  | 'gps'
  | 'turbidity';

@Injectable()
export class ReadingsService {
  private tableMap: Record<
    ReadingType,
    {
      model: any;
      valueFields?: string[];
    }
  >;

  constructor(private prisma: PrismaService) {
    this.tableMap = {
      temperature: { model: this.prisma.temperature_Reading },
      ph: { model: this.prisma.pH_Reading },
      tds: { model: this.prisma.tDS_Reading },
      gps: { model: this.prisma.gPS_Reading },
      turbidity: { model: this.prisma.turbidity_Reading },
    };
  }

  /**
   * Add a reading
   */
  async addReading(
    deviceId: number,
    type: ReadingType,
    values: number[] | { [key: string]: number },
    timestamp?: Date,
    extra?: Partial<any>,
  ) {
    const entry = this.tableMap[type];
    if (!entry) throw new BadRequestException('Invalid sensor type');

    const data: any = { DeviceID: deviceId, RecordedAt: timestamp || new Date(), ...extra };

    // Map the values based on model
    switch (type) {
      case 'temperature':
        data.Temperature_Value = Number(values[0]);
        break;
      case 'ph':
        data.PH_Value = Number(values[0]);
        break;
      case 'tds':
        data.TDS_Value = Number(values[0]);
        break;
      case 'gps':
        data.Latitude = Number(values[0]);
        data.Longitude = Number(values[1]);
        data.Altitude = values[2] ? Number(values[2]) : undefined;
        break;
      case 'turbidity':
        data.Turbidity_Value = Number(values[0]);
        break;
    }

    return entry.model.create({ data });
  }

  /**
   * Get readings by device
   */
  async getReadings(deviceId: number, type: ReadingType) {
    const entry = this.tableMap[type];
    if (!entry) throw new BadRequestException('Invalid sensor type');

    const orderField = 'RecordedAt';

    return entry.model.findMany({
      where: { DeviceID: deviceId },
      orderBy: { [orderField]: 'asc' },
    });
  }
}
