import { Module } from '@nestjs/common';
import { PicksService } from './picks.service';
import { PicksController } from './picks.controller';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PicksService],
  controllers: [PicksController],
  exports: [PicksService],
})
export class PicksModule {}
