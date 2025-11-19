import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Controller('api/ethnicities')
export class EthnicitiesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async list(@Query('q') q?: string) {
    const where = q
      ? { name: { contains: q, mode: 'insensitive' as const } }
      : undefined;

    const ethnicities = await this.prisma.ethnicity.findMany({
      where,
      orderBy: { name: 'asc' },
      select: { ethnicityId: true, name: true },
    });

    return ethnicities.map((e) => ({
      id: e.ethnicityId,
      name: e.name,
    }));
  }
}
