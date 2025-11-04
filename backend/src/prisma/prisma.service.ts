import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor(config: ConfigService) {
        super({
            // log: ['query', 'info', 'warn', 'error'],
            log: ['info', 'warn', 'error'],
            datasources: {
                db: {
                    url: config.get('DATABASE_URL')
                }
            }
        })
    }


}