import { Injectable } from '@nestjs/common';
import { Device, Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) { }

  async getAllDevices(options?: {
    includeCount?: number;
    includeAllReadings?: boolean;
    skip?: number;
    take?: number;
  }): Promise<Device[]> {
    const {
      includeCount,
      includeAllReadings = false,
      skip = 0,
      take = 50,
    } = options || {};

    const includeReadings =
      includeAllReadings || typeof includeCount === 'number';

    const makeInclude = <
      T extends
      | Prisma.PH_ReadingFindManyArgs
      | Prisma.Temperature_ReadingFindManyArgs
      | Prisma.TDS_ReadingFindManyArgs
      | Prisma.GPS_ReadingFindManyArgs
      | Prisma.Turbidity_ReadingFindManyArgs,
    >(): T => {
      if (includeAllReadings) return {} as T;
      if (typeof includeCount === 'number') {
        return {
          orderBy: { RecordedAt: 'desc' },
          take: includeCount,
        } as T;
      }
      return { take: 1, orderBy: { RecordedAt: 'desc' } } as T;
    };

    return this.prisma.device.findMany({
      skip,
      take,
      include: includeReadings
        ? {
          PH_Readings: makeInclude<Prisma.PH_ReadingFindManyArgs>(),
          Temperature_Readings:
            makeInclude<Prisma.Temperature_ReadingFindManyArgs>(),
          TDS_Readings: makeInclude<Prisma.TDS_ReadingFindManyArgs>(),
          GPS_Readings: makeInclude<Prisma.GPS_ReadingFindManyArgs>(),
          Turbidity_Readings:
            makeInclude<Prisma.Turbidity_ReadingFindManyArgs>(),
        }
        : undefined,
    });
  }

  async getDeviceById(
    deviceId: number,
    includeReadings?: string,
  ): Promise<Device | null> {
    const includeAllReadings = includeReadings === 'true';
    const includeCount =
      !includeAllReadings && includeReadings && !isNaN(Number(includeReadings))
        ? parseInt(includeReadings, 10)
        : undefined;

    const includeReadingsFlag =
      includeAllReadings || typeof includeCount === 'number';

    const makeInclude = <
      T extends
      | Prisma.PH_ReadingFindManyArgs
      | Prisma.Temperature_ReadingFindManyArgs
      | Prisma.TDS_ReadingFindManyArgs
      | Prisma.GPS_ReadingFindManyArgs
      | Prisma.Turbidity_ReadingFindManyArgs,
    >(): T => {
      if (includeAllReadings) return {} as T;
      if (typeof includeCount === 'number') {
        return {
          orderBy: { RecordedAt: 'desc' },
          take: includeCount,
        } as T;
      }
      return { take: 1, orderBy: { RecordedAt: 'desc' } } as T;
    };

    return this.prisma.device.findUnique({
      where: { DeviceID: deviceId },
      include: includeReadingsFlag
        ? {
          PH_Readings: makeInclude<Prisma.PH_ReadingFindManyArgs>(),
          Temperature_Readings:
            makeInclude<Prisma.Temperature_ReadingFindManyArgs>(),
          TDS_Readings: makeInclude<Prisma.TDS_ReadingFindManyArgs>(),
          GPS_Readings: makeInclude<Prisma.GPS_ReadingFindManyArgs>(),
          Turbidity_Readings:
            makeInclude<Prisma.Turbidity_ReadingFindManyArgs>(),
        }
        : undefined,
    });
  }

  async searchDevicesByName(name: string): Promise<Device[]> {
    return this.prisma.device.findMany({
      where: {
        DeviceName: {
          contains: name,
        },
      },
    });
  }
}
