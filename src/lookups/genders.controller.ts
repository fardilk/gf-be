import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Controller('api/genders')
export class GendersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async list() {
    const genders = await this.prisma.gender.findMany({
      orderBy: { name: 'asc' },
      select: { genderId: true, name: true },
    });
    return genders.map((g) => ({
      id: g.genderId,
      name: g.name,
    }));
  }
}
