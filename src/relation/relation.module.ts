import { Module } from '@nestjs/common';
import { RelationService } from './relation.service';
import { RelationController } from './relation.controller';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RelationService],
  controllers: [RelationController],
  exports: [RelationService],
})
export class RelationModule {}
