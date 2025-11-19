import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PicksService } from './picks.service';
import { CreatePickDto, UpdatePickDto } from './picks.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('picks')
@UseGuards(JwtAuthGuard)
export class PicksController {
  constructor(private picksService: PicksService) {}

  @Get()
  async findAll(@Request() req: any) {
    return this.picksService.findAll(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.picksService.findOne(id, req.user.userId);
  }

  @Post()
  async create(@Body() dto: CreatePickDto, @Request() req: any) {
    return this.picksService.create(dto, req.user.userId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePickDto, @Request() req: any) {
    return this.picksService.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    await this.picksService.delete(id, req.user.userId);
    return { message: 'Pick deleted successfully' };
  }
}
