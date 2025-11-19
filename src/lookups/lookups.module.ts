import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma.module';
import { CitiesController } from './cities.controller';
import { GendersController } from './genders.controller';
import { EthnicitiesController } from './ethnicities.controller';
import { JobsController } from './jobs.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    CitiesController,
    GendersController,
    EthnicitiesController,
    JobsController,
  ],
})
export class LookupsModule {}
