import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RelationService } from './relation.service';
import {
  CreateMasterRelationDto,
  UpdateMasterRelationDto,
  CreateTrxRelationDto,
  UpdateTrxRelationDto,
} from './relation.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('relations')
@UseGuards(JwtAuthGuard)
export class RelationController {
  constructor(private relationService: RelationService) {}

  // Master Relation endpoints
  @Get('master')
  async findAllMasterRelations() {
    return this.relationService.findAllMasterRelations();
  }

  @Get('master/:id')
  async findOneMasterRelation(@Param('id') id: string) {
    return this.relationService.findOneMasterRelation(id);
  }

  @Post('master')
  async createMasterRelation(@Body() dto: CreateMasterRelationDto) {
    return this.relationService.createMasterRelation(dto);
  }

  @Patch('master/:id')
  async updateMasterRelation(@Param('id') id: string, @Body() dto: UpdateMasterRelationDto) {
    return this.relationService.updateMasterRelation(id, dto);
  }

  @Delete('master/:id')
  async deleteMasterRelation(@Param('id') id: string) {
    return this.relationService.deleteMasterRelation(id);
  }

  // Transaction Relation endpoints
  @Get('trx')
  async findAllTrxRelations() {
    return this.relationService.findAllTrxRelations();
  }

  @Get('trx/:id')
  async findOneTrxRelation(@Param('id') id: string) {
    return this.relationService.findOneTrxRelation(id);
  }

  @Post('trx')
  async createTrxRelation(@Body() dto: CreateTrxRelationDto) {
    return this.relationService.createTrxRelation(dto);
  }

  @Patch('trx/:id')
  async updateTrxRelation(@Param('id') id: string, @Body() dto: UpdateTrxRelationDto) {
    return this.relationService.updateTrxRelation(id, dto);
  }

  @Delete('trx/:id')
  async deleteTrxRelation(@Param('id') id: string) {
    return this.relationService.deleteTrxRelation(id);
  }
}
